import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/teacher-login";
import { Eye, EyeOff, GraduationCap, ExternalLink, PlayCircle, Lock, Video } from "lucide-react";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "~/components/ui/dialog/dialog";
import { TutorialVideoPlayer } from "~/components/tutorial-video-player";
import { getSession, loginTeacher, saveSession } from "~/lib/auth.client";
import { getTutorialVideos } from "~/services/tutorial.client";
import styles from "./teacher-login.module.css";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Teacher Login - Magster Academy" }, { name: "description", content: "Sign in to your teacher portal" }];
}

export default function TeacherLogin() {
  const navigate = useNavigate();
  const [showPin, setShowPin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [showForgotPinModal, setShowForgotPinModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutorials, setTutorials] = useState<any[]>([]);
  const forgotPinUsername = 'magster_support';

  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.userType === 'teacher') navigate('/teacher', { replace: true });
      else if (session.userType === 'student') navigate('/home-page', { replace: true });
      else if (session.userType === 'admin') navigate('/admin', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    getTutorialVideos('teacher').then(setTutorials);
  }, []);

  const handleTelegramClick = () => {
    window.open(`https://t.me/${forgotPinUsername}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (phoneNumber.length !== 9 || pin.length !== 4) {
        setError("Invalid phone number or PIN format");
        return;
      }

      const result = await loginTeacher(phoneNumber, pin);

      if (!result.success) {
        setError(result.error || 'Invalid phone number or PIN');
        return;
      }

      saveSession(result.user.id, 'teacher', result.user);
      navigate('/teacher', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <GraduationCap size={48} strokeWidth={2} />
          </div>
          <h1 className={styles.title}>Teacher Portal</h1>
          <p className={styles.subtitle}>Sign in to manage your courses</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Login</h2>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
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
              <button type="button" className={styles.forgotLink} onClick={() => setShowForgotPinModal(true)}>
                Forgot PIN?
              </button>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className={styles.submitButton}
              disabled={isSubmitting || phoneNumber.length !== 9 || pin.length !== 4}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Want to teach?{" "}
              <Link to="/teacher-signup" className={styles.signupLink}>
                Apply Here
              </Link>
            </p>
            <Link to="/login" className={styles.backLink}>
              ← Back to Student Login
            </Link>
          </div>

          <button type="button" className={styles.howToButton} onClick={() => setShowTutorialModal(true)}>
            <PlayCircle size={18} className={styles.playIcon} />
            How to use the app?
          </button>
        </div>
      </div>

      <Dialog open={showForgotPinModal} onOpenChange={setShowForgotPinModal}>
        <DialogContent className={styles.forgotPinModal}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}><Lock size={28} /></div>
            <DialogTitle className={styles.modalTitle}>Forgot PIN?</DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              No worries! Contact our support team on Telegram to reset your security PIN.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleTelegramClick} className={styles.telegramButton}>
            <ExternalLink size={18} />
            Contact @{forgotPinUsername} on Telegram
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showTutorialModal} onOpenChange={setShowTutorialModal}>
        <DialogContent className={styles.tutorialModal}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}><Video size={28} /></div>
            <DialogTitle className={styles.modalTitle}>{tutorials[selectedVideoIndex]?.title || "How to Use the App"}</DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              Watch these short tutorials to master the teacher portal.
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
                              <div className={styles.videoItemIcon}><PlayCircle size={24} /></div>
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
          <div className={styles.modalFooter}>
            <DialogClose asChild>
              <Button variant="outline" className={styles.cancelButton}>Done</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}