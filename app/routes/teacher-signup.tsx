import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button/button';
import { Input } from '../components/ui/input/input';
import { Label } from '../components/ui/label/label';
import { Textarea } from '../components/ui/textarea/textarea';
import { useState } from 'react';
import { signupTeacher } from '~/lib/auth.client';
import { supabase } from '~/lib/supabase.client';
import styles from './teacher-signup.module.css';

export default function TeacherSignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [introVideoUrl, setIntroVideoUrl] = useState('');

  const specializations = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'English', 'History', 'Geography', 'Economics', 'Business Studies',
    'Engineering', 'Medicine', 'Law', 'Other'
  ];

  const handleNext = () => { if (step < 3) setStep(step + 1); };
  const handlePrevious = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (pin !== confirmPin) { setError('PINs do not match'); return; }
      if (pin.length !== 4) { setError('PIN must be 4 digits'); return; }
      if (!phoneNumber.startsWith('9') && !phoneNumber.startsWith('7')) { setError('Phone number must start with 9 or 7'); return; }
      if (phoneNumber.length !== 9) { setError('Phone number must be 9 digits'); return; }

      // Check if phone number already exists
      const { data: existing } = await supabase.from('teachers').select('id').eq('phone_number', phoneNumber).maybeSingle();
      if (existing) { setError('A teacher with this phone number already exists'); return; }

      const result = await signupTeacher({
        fullName,
        phoneNumber,
        email: `${phoneNumber}@noemail.placeholder`,
        pin,
        specialization,
        experience,
        bio,
        introVideoUrl: introVideoUrl || undefined,
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
              <h2 className={styles.successTitle}>Application Submitted Successfully!</h2>
              <p className={styles.successText}>
                Your teacher application has been submitted and is pending admin approval. 
                You will be notified once your account is approved (usually within 24-48 hours).
              </p>
              <Link to="/login" className={styles.loginButton}>Go to Login</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => step === 1 ? window.location.href = '/login' : handlePrevious()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={styles.title}>Become a Teacher</h1>
        </div>

        <div className={styles.card}>
          <div className={styles.progressSteps}>
            <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}><div className={styles.stepCircle}>1</div></div>
            <div className={styles.stepLine}></div>
            <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}><div className={styles.stepCircle}>2</div></div>
            <div className={styles.stepLine}></div>
            <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}><div className={styles.stepCircle}>3</div></div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {step === 1 && (
            <>
              <h2 className={styles.stepTitle}>Personal Information</h2>
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
                    <Input type={showPin ? 'text' : 'password'} placeholder="PIN (4 digits)" className={styles.pinInput} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} />
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
              <h2 className={styles.stepTitle}>Professional Details</h2>
              <div className={styles.form}>
                <div className={styles.field}>
                  <select className={styles.select} value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                    <option value="">Select Specialization</option>
                    {specializations.map((spec) => (<option key={spec} value={spec}>{spec}</option>))}
                  </select>
                </div>
                <div className={styles.field}>
                  <select className={styles.select} value={experience} onChange={(e) => setExperience(e.target.value)}>
                    <option value="">Years of Experience</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <Textarea placeholder="Brief Bio" className={styles.textarea} value={bio} onChange={(e) => setBio(e.target.value.slice(0, 500))} rows={4} />
                  <span className={styles.counter}>{bio.length}/500</span>
                </div>
                <div className={styles.buttonGroup}>
                  <Button type="button" onClick={handlePrevious} variant="outline" className={styles.previousButton}>Previous</Button>
                  <Button type="button" onClick={handleNext} className={styles.nextButton}>Next</Button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className={styles.stepTitle}>Introduction Video</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                  <Label className={styles.label}>Introduction Video Link (15 min max)</Label>
                  <Input type="url" placeholder="Paste your video link here" className={styles.input} value={introVideoUrl} onChange={(e) => setIntroVideoUrl(e.target.value)} />
                  <div className={styles.infoBox}>
                    <p style={{ margin: 0 }}><strong>Record a short video (max 15 minutes)</strong> introducing yourself.</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8125rem' }}><strong>Accepted links:</strong> YouTube, Google Drive, or Telegram video link.</p>
                  </div>
                </div>
                <div className={styles.infoBox}>
                  <p><strong>Note:</strong> Your application will be reviewed by our team (usually within 24-48 hours).</p>
                </div>
                <div className={styles.buttonGroup}>
                  <Button type="button" onClick={handlePrevious} variant="outline" className={styles.previousButton}>Previous</Button>
                  <Button type="submit" className={styles.nextButton} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </>
          )}

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already have a teacher account?{' '}
              <Link to="/login" className={styles.loginLink}>Login Here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}