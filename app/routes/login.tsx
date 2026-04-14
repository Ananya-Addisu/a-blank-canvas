import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/login";
import { Eye, EyeOff, UserCircle2, PlayCircle, ShieldAlert, ShieldCheck, MessageCircle } from "lucide-react";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { TutorialVideoPlayer } from "~/components/tutorial-video-player";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog/dialog";
import TextLoading from "~/components/ui/text-loading/text-loading";
import { getSession, loginStudent, loginTeacher, saveSession } from "~/lib/auth.client";
import { getTutorialVideos } from "~/services/tutorial.client";
import { verifyDeviceToken, hasExistingTrustedDevice, registerTrustedDevice } from "~/services/device.client";
import styles from "./login.module.css";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Login - Magster" }, { name: "description", content: "Sign in to your Magster student or teacher account" }];
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPin, setShowPin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [showResetPinModal, setShowResetPinModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [showForceResetModal, setShowForceResetModal] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [loginAs, setLoginAs] = useState<"student" | "teacher">("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutorials, setTutorials] = useState<any[]>([]);

  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.userType === 'student') navigate('/home-page', { replace: true });
      else if (session.userType === 'teacher') navigate('/teacher', { replace: true });
      else if (session.userType === 'admin') navigate('/admin', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    getTutorialVideos('student').then(setTutorials);
  }, []);

  useEffect(() => {
    if (searchParams.get('force_reset') === 'true') {
      setShowForceResetModal(true);
      searchParams.delete('force_reset');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const [showContactPopup, setShowContactPopup] = useState(false);
  const [contactContext, setContactContext] = useState<'forgot' | 'report'>('forgot');
  const supportUrl = "https://t.me/magster_support";
  const openSupport = () => window.open(supportUrl, '_blank');
  const handleNotifyAdmin = () => window.open(supportUrl, '_blank');
  const handleForgotPin = () => { setShowResetPinModal(false); window.open(supportUrl, '_blank'); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let hardwareId: string | undefined;
      try {
        const { Device } = await import('@capacitor/device');
        const info = await Device.getId();
        hardwareId = info.identifier || undefined;
      } catch {}

      if (loginAs === 'teacher') {
        const result = await loginTeacher(phoneNumber, pin);

        if (!result.success) {
          setError(result.error || 'Invalid phone number or PIN');
          return;
        }

        saveSession(result.user.id, 'teacher', result.user);
        navigate('/teacher', { replace: true });
      } else {
        const result = await loginStudent(phoneNumber, pin);

        if (!result.success) {
          setError(result.error || 'Invalid phone number or PIN');
          return;
        }

        const deviceCheck = await verifyDeviceToken(result.user.id, 'student', hardwareId);
        if (deviceCheck.trusted) {
          saveSession(result.user.id, 'student', result.user);
          navigate('/home-page', { replace: true });
          return;
        }

        const existing = await hasExistingTrustedDevice(result.user.id, 'student');
        if (existing.exists) {
          setError('This account is already bound to another device. Contact admin to reset.');
          return;
        }

        await registerTrustedDevice(result.user.id, 'student', hardwareId);
        saveSession(result.user.id, 'student', result.user);
        navigate('/home-page', { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {isSubmitting && (
        <div className={styles.loadingOverlay}>
          <TextLoading texts={["Logging in...", "Verifying credentials...", "Authenticating..."]} interval={1000} />
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Magster</h1>
          <p className={styles.subtitle}>Learn Smarter, Anytime, Anywhere.</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Login</h2>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <input type="hidden" name="loginAs" value={loginAs} />

            <div className={styles.field}>
              <div className={styles.phoneInputWrapper}>
                <div className={styles.countryCode}>+251</div>
                <Input
                  name="phoneNumber"
                  type="tel"
                  placeholder="Phone Number"
                  className={styles.phoneInput}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  required
                />
              </div>
              <span className={styles.counter}>{phoneNumber.length}/9</span>
            </div>

            <div className={styles.field}>
              <div className={styles.pinInputWrapper}>
                <Input
                  name="pin"
                  type={showPin ? "text" : "password"}
                  placeholder="PIN"
                  className={styles.pinInput}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  required
                />
                <button type="button" className={styles.togglePin} onClick={() => setShowPin(!showPin)}>
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <span className={styles.counter}>{pin.length}/4</span>
            </div>

            <div className={styles.forgotPinWrapper}>
              <button type="button" className={styles.forgotLink} onClick={() => setShowResetPinModal(true)}>
                Forgot PIN?
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              className={styles.submitButton}
              disabled={isSubmitting || phoneNumber.length !== 9 || pin.length !== 4}
            >
              {isSubmitting ? (
                <TextLoading 
                  texts={["Logging in...", "Verifying credentials...", "Authenticating..."]}
                  interval={1000}
                  className={styles.buttonLoadingText}
                />
              ) : "Login"}
            </Button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Don't have an account?{" "}
              <Link to="/signup" className={styles.signupLink}>
                Sign Up Here
              </Link>
            </p>
          </div>

          <button type="button" className={styles.howToButton} onClick={() => setShowTutorialModal(true)}>
            <PlayCircle size={18} className={styles.playIcon} />
            How to use the app?
          </button>

          <div className={styles.loginAsSection}>
            <p className={styles.loginAsLabel}>Login as:</p>
            <div className={styles.roleButtons}>
              <button
                type="button"
                className={`${styles.roleButton} ${styles.teacher}`}
                onClick={() => (window.location.href = "/teacher-login")}
              >
                <UserCircle2 size={18} />
                Teacher
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset PIN Modal */}
      <Dialog open={showResetPinModal} onOpenChange={setShowResetPinModal}>
        <DialogContent className={styles.resetPinModal}>
          <DialogHeader>
            <DialogTitle className={styles.resetPinTitle}>Reset PIN</DialogTitle>
            <DialogDescription className={styles.resetPinDescription}>
              To reset your PIN, please contact us on Telegram. Send a message explaining your issue.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleForgotPin} className={styles.telegramButton}>
            <MessageCircle size={18} />
            Contact Support on Telegram
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showTutorialModal} onOpenChange={setShowTutorialModal}>
        <DialogContent className={styles.tutorialModal}>
          <DialogHeader>
            <DialogTitle>{tutorials[selectedVideoIndex]?.title || "How to Use the App"}</DialogTitle>
            <DialogDescription>
              {tutorials[selectedVideoIndex]?.description || "Watch this tutorial to learn how to use the app"}
            </DialogDescription>
          </DialogHeader>

          <div className={styles.modalBody}>
          {tutorials.length > 0 ? (
            <>
              <TutorialVideoPlayer
                videoUrl={tutorials[selectedVideoIndex].video_url}
                title={tutorials[selectedVideoIndex].title}
                onNext={() => setSelectedVideoIndex((prev) => Math.min(prev + 1, tutorials.length - 1))}
                onPrevious={() => setSelectedVideoIndex((prev) => Math.max(prev - 1, 0))}
                hasNext={selectedVideoIndex < tutorials.length - 1}
                hasPrevious={selectedVideoIndex > 0}
              />

              {tutorials.length > 1 && (
                <div className={styles.videoList}>
                  <h4 className={styles.videoListTitle}>More Tutorials</h4>
                  <div className={styles.videoItems}>
                    {tutorials.map((tutorial: any, index: number) => (
                      <button
                        key={tutorial.id}
                        type="button"
                        className={`${styles.videoItem} ${index === selectedVideoIndex ? styles.active : ""}`}
                        onClick={() => setSelectedVideoIndex(index)}
                      >
                        <div className={styles.videoItemThumb}>
                          {tutorial.thumbnail_url ? (
                            <img src={tutorial.thumbnail_url} alt={tutorial.title} />
                          ) : (
                            <div className={styles.videoItemIcon}>
                              <PlayCircle size={24} />
                            </div>
                          )}
                        </div>
                        <div className={styles.videoItemInfo}>
                          <h5 className={styles.videoItemTitle}>{tutorial.title}</h5>
                          {tutorial.duration && (
                            <span className={styles.videoItemDuration}>
                              {Math.floor(tutorial.duration / 60)}:{String(tutorial.duration % 60).padStart(2, "0")}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noVideos}>
              <PlayCircle size={48} />
              <p>No tutorial videos available at the moment.</p>
              <p className={styles.noVideosSubtext}>Please check back later or contact support for assistance.</p>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Force Reset Modal */}
      <Dialog open={showForceResetModal} onOpenChange={setShowForceResetModal}>
        <DialogContent className={styles.forceResetModal}>
          <div className={styles.forceResetIconWrap}>
            <ShieldAlert size={36} />
          </div>
          <DialogTitle className={styles.forceResetTitle}>Account Reset by Admin</DialogTitle>
          <DialogDescription className={styles.forceResetDesc}>
            Your session was ended and your device was unlinked by an administrator. This is usually done when you request a device change.
          </DialogDescription>
          <div className={styles.forceResetInfo}>
            <ShieldCheck size={18} />
            <span>You can log in again now. Your current device will be linked to your account automatically.</span>
          </div>
          <div className={styles.forceResetActions}>
            <Button onClick={() => setShowForceResetModal(false)} className={styles.forceResetContinue}>
              Continue to Login
            </Button>
            <button type="button" onClick={handleNotifyAdmin} className={styles.forceResetReport}>
              <MessageCircle size={15} />
              Wasn't me — Report to Admin
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Support Popup */}
      <Dialog open={showContactPopup} onOpenChange={setShowContactPopup}>
        <DialogContent className={styles.contactModal}>
          <div className={styles.contactIconWrap}>
            <MessageCircle size={28} />
          </div>
          <DialogTitle className={styles.contactTitle}>
            {contactContext === 'forgot' ? 'Contact Support' : 'Report Unauthorized Reset'}
          </DialogTitle>
          <DialogDescription className={styles.contactDesc}>
            {contactContext === 'forgot'
              ? 'Send us a message on Telegram with your phone number and we\'ll help you reset your PIN.'
              : 'If you didn\'t request this reset, please let us know immediately on Telegram so we can secure your account.'}
          </DialogDescription>
          <Button onClick={openSupport} className={styles.telegramButton}>
            <MessageCircle size={18} />
            Open Telegram Support
          </Button>
          <Button onClick={() => setShowContactPopup(false)} variant="outline" className={styles.contactDone}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}