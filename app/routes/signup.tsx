import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button/button';
import { Input } from '../components/ui/input/input';
import { Checkbox } from '../components/ui/checkbox/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog/dialog";
import { useState, useEffect } from 'react';
import TextLoading from '~/components/ui/text-loading/text-loading';
import { CircleSpinner } from '~/components/circle-spinner';
import { signupStudent } from '~/lib/auth.client';
import { supabase } from '~/lib/supabase.client';
import styles from './signup.module.css';

export default function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [termsOfService, setTermsOfService] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [gender, setGender] = useState('');
  const [stream, setStream] = useState('');
  const [institution, setInstitution] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('app_settings').select('setting_value').eq('setting_key', 'terms_of_service').single(),
      supabase.from('app_settings').select('setting_value').eq('setting_key', 'privacy_policy').single(),
    ]).then(([tosResult, privacyResult]) => {
      setTermsOfService(tosResult.data?.setting_value || '');
      setPrivacyPolicy(privacyResult.data?.setting_value || '');
    });
  }, []);

  const institutions = [
    'College', 'High School', 'AA SCI. & TECH UNIVERSITY', 'Adama Science & Technology',
    'Addis Ababa University', 'Adigrat University', 'Ambo University', 'Arba Minch University',
    'Arsi University', 'Asossa University', 'Axum University', 'Bahir Dar University',
    'Bonga University', 'Bule Hora University', 'Debark University', 'Debrebirhan University',
    'Debremarkos University', 'Debretabor University', 'Dembi Dolo University', 'Dilla University',
    'Dire Dawa University', 'Gambella University', 'Gondar University', 'Haramaya University',
    'Hawassa University', 'Injibara University', 'Jigjiga University', 'Jimma University',
    'Jinka University', 'Kebri Dehar University', 'Kotebe Metropolitan University',
    'Meda Welabu University', 'Mekelle University', 'Mekidela Amba University', 'Metu University',
    'Mizan-Tepi University', 'Oda Bultum University', 'Raya University', 'Selale University',
    'Semera University', 'Wachamo University', 'Welketie University', 'Werabe University',
    'Wolayita Sodo University', 'Woldiya University', 'Wollega University', 'Wollo University',
  ];

  const handleNext = () => { if (step < 3) setStep(step + 1); };
  const handlePrevious = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!acceptedTerms) { setError('You must agree to the Terms of Service and Privacy Policy'); return; }
      if (pin !== confirmPin) { setError('PINs do not match'); return; }
      if (pin.length !== 4) { setError('PIN must be 4 digits'); return; }
      if (!phoneNumber.startsWith('9') && !phoneNumber.startsWith('7')) { setError('Phone number must start with 9 or 7'); return; }
      if (phoneNumber.length !== 9) { setError('Phone number must be 9 digits'); return; }

      const { data: existing } = await supabase.from('students').select('id').eq('phone_number', phoneNumber).maybeSingle();
      if (existing) { setError('A student with this phone number already exists'); return; }

      const result = await signupStudent({
        fullName,
        phoneNumber,
        pin,
        academicYear,
        gender,
        stream,
        institution,
      });

      if (!result.success) { setError(result.error ?? null); return; }
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.card}>
            <div className={styles.successMessage}>
              <h2 className={styles.successTitle}>Account Created Successfully!</h2>
              <p className={styles.successText}>Your account has been created. You can now log in with your phone number and PIN.</p>
              <Link to="/login" className={styles.loginButton}>Go to Login</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {isSubmitting && (
        <div className={styles.loadingOverlay}>
          <TextLoading texts={["Creating Account...", "Validating data...", "Setting up profile...", "Almost done..."]} interval={1000} />
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => step === 1 ? window.location.href = '/login' : handlePrevious()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={styles.title}>Create Account</h1>
        </div>

        <div className={styles.card}>
          <div className={styles.progressSteps}>
            <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}><div className={styles.stepCircle}>1</div></div>
            <div className={`${styles.stepLine} ${step >= 2 ? styles.active : ''}`}></div>
            <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}><div className={styles.stepCircle}>2</div></div>
            <div className={`${styles.stepLine} ${step >= 3 ? styles.active : ''}`}></div>
            <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}><div className={styles.stepCircle}>3</div></div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {step === 1 && (
            <>
              <h2 className={styles.stepTitle}>Personal Info</h2>
              <div className={styles.form}>
                <div className={styles.field}>
                  <Input type="text" placeholder="Full Name (First & Last)" className={styles.input} value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  {fullName.trim().length > 0 && fullName.trim().split(/\s+/).length < 2 && (
                    <span className={styles.fieldError}>Please enter both first and last name</span>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.phoneInputWrapper}>
                    <div className={styles.countryCode}>+251</div>
                    <Input type="tel" placeholder="Phone Number" className={styles.phoneInput} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9))} />
                  </div>
                  <span className={styles.counter}>{phoneNumber.length}/9</span>
                </div>
                <div className={styles.field}>
                  <div className={styles.pinInputWrapper}>
                    <Input type={showPin ? 'text' : 'password'} placeholder="PIN" className={styles.pinInput} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} />
                    <button type="button" className={styles.togglePin} onClick={() => setShowPin(!showPin)}>
                      {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <span className={styles.counter}>{pin.length}/4</span>
                </div>
                <div className={styles.field}>
                  <div className={styles.pinInputWrapper}>
                    <Input type={showConfirmPin ? 'text' : 'password'} placeholder="Confirm PIN" className={styles.pinInput} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))} />
                    <button type="button" className={styles.togglePin} onClick={() => setShowConfirmPin(!showConfirmPin)}>
                      {showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <span className={styles.counter}>{confirmPin.length}/4</span>
                  {confirmPin.length > 0 && pin.length > 0 && confirmPin !== pin && (<span className={styles.fieldError}>PINs do not match</span>)}
                  {confirmPin.length === 4 && pin.length === 4 && confirmPin === pin && (<span className={styles.fieldSuccess}>PINs match ✓</span>)}
                </div>
                <Button type="button" onClick={handleNext} className={styles.nextButton}
                  disabled={!fullName.trim() || fullName.trim().split(/\s+/).length < 2 || phoneNumber.length !== 9 || (!phoneNumber.startsWith('9') && !phoneNumber.startsWith('7')) || pin.length !== 4 || confirmPin.length !== 4 || pin !== confirmPin}>
                  Next
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className={styles.stepTitle}>Education Details</h2>
              <div className={styles.form}>
                <div className={styles.field}>
                  <select className={styles.select} value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
                    <option value="">Academic Year</option>
                    <option value="Highschool">Highschool</option>
                    <option value="1st year">1st Year</option>
                    <option value="2nd year">2nd Year</option>
                    <option value="3rd year">3rd Year</option>
                    <option value="4th year">4th Year</option>
                    <option value="5th year">5th Year</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <p className={styles.label}>Gender</p>
                  <div className={styles.genderButtons}>
                    <button type="button" className={`${styles.genderButton} ${gender === 'male' ? styles.selected : ''}`} onClick={() => setGender('male')}>Male</button>
                    <button type="button" className={`${styles.genderButton} ${gender === 'female' ? styles.selected : ''}`} onClick={() => setGender('female')}>Female</button>
                  </div>
                </div>
                <div className={styles.field}>
                  <select className={styles.select} value={stream} onChange={(e) => setStream(e.target.value)}>
                    <option value="">Stream</option>
                    <option value="natural">Natural Science</option>
                    <option value="social">Social Science</option>
                    <option value="not_assigned">Not Assigned</option>
                  </select>
                </div>
                <div className={styles.buttonGroup}>
                  <Button type="button" onClick={handlePrevious} variant="outline" className={styles.previousButton}>Previous</Button>
                  <Button type="button" onClick={handleNext} className={styles.nextButton} disabled={!academicYear || !gender || !stream}>Next</Button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className={styles.stepTitle}>Institution</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                  <select className={styles.institutionSelect} value={institution} onChange={(e) => setInstitution(e.target.value)}>
                    <option value="" disabled>Institution</option>
                    {institutions.map((inst) => (<option key={inst} value={inst}>{inst}</option>))}
                  </select>
                </div>
                <div className={styles.termsWrapper}>
                  <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(checked) => setAcceptedTerms(checked === true)} className={styles.checkbox} />
                  <label htmlFor="terms" className={styles.termsLabel}>
                    I agree to the{' '}
                    <button type="button" onClick={() => setShowTermsModal(true)} className={styles.termsLink}>Terms of Service</button>
                    {' '}and{' '}
                    <button type="button" onClick={() => setShowPrivacyModal(true)} className={styles.termsLink}>Privacy Policy</button>
                  </label>
                </div>
                <div className={styles.buttonGroup}>
                  <Button type="button" onClick={handlePrevious} variant="outline" className={styles.previousButton}>Previous</Button>
                  <Button type="submit" className={styles.nextButton} disabled={isSubmitting || !institution || !acceptedTerms}>
                    {isSubmitting ? (
                      <TextLoading
                        texts={["Creating Account...", "Validating data...", "Setting up profile...", "Almost done..."]}
                        interval={1000}
                        className={styles.buttonLoadingText}
                      />
                    ) : 'Create Account'}
                  </Button>
                </div>
              </form>
            </>
          )}

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already have an account?{' '}
              <Link to="/login" className={styles.loginLink}>Login Here</Link>
            </p>
          </div>
        </div>
      </div>

      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className={styles.termsModal}>
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>Please read our terms of service carefully.</DialogDescription>
          </DialogHeader>
          <div className={styles.termsContent}>
            {termsOfService || (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-6)' }}>
                <CircleSpinner />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className={styles.termsModal}>
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
            <DialogDescription>Please read our privacy policy carefully.</DialogDescription>
          </DialogHeader>
          <div className={styles.termsContent}>
            {privacyPolicy || (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-6)' }}>
                <CircleSpinner />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}