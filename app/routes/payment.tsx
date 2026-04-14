import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { BottomNav } from "~/components/bottom-nav";
import { Button } from "~/components/ui/button/button";
import { Label } from "~/components/ui/label/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group/radio-group";
import { ArrowLeft, Copy, Check, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getStudentAuth } from "~/lib/auth.client";
import { getPaymentMethods, submitPayment } from "~/services/enrollment.client";
import styles from "./payment.module.css";
import { LoadingScreen } from "~/components/loading-screen";

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enrollmentId = searchParams.get('enrollment_id') || '';
  const [student, setStudent] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const hasScreenshot = screenshotUrls.length >= 1;

  useEffect(() => {
    (async () => {
      const s = await getStudentAuth();
      if (!s) { navigate('/login'); return; }
      setStudent(s);
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const files = input.files;
    if (!files || files.length === 0) return;
    if (hasScreenshot) {
      toast.warning("You can upload only 1 payment screenshot.");
      input.value = "";
      return;
    }
    const [file] = Array.from(files);
    const placeholderLabel = encodeURIComponent(file.name.replace(/\.[^.]+$/, "") || "Payment Screenshot");
    const placeholderUrl = `https://placehold.co/400x600/png?text=${placeholderLabel}`;
    setScreenshotUrls([placeholderUrl]);
    input.value = "";
  };

  const removeScreenshot = (index: number) => {
    setScreenshotUrls(screenshotUrls.filter((_, i) => i !== index));
  };

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError("");
    try {
      await submitPayment({
        enrollment_id: enrollmentId,
        student_id: student.id,
        screenshot_urls: screenshotUrls,
        payment_method: selectedPaymentMethod?.method_name || '',
        amount: 0,
      });
      navigate('/payment-success');
    } catch (err: any) {
      setActionError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Submit Payment</h1>
            <p className={styles.subtitle}>Select a payment method and submit proof of payment</p>
          </div>

          <div className={styles.alert}>
            <AlertCircle className={styles.alertIcon} />
            <div>
              <p className={styles.alertTitle}>Payment Instructions</p>
              <p className={styles.alertText}>
                1. Choose a payment method below and copy the account details<br />
                2. Make the payment using your preferred method<br />
                3. Take a screenshot of the successful transaction<br />
                4. Upload 1 screenshot and submit for admin approval
              </p>
            </div>
          </div>

          {actionError && <div className={styles.errorMessage}>{actionError}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>1. Select Payment Method</h2>
              <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                {paymentMethods.map((method) => (
                  <div key={method.id} className={`${styles.paymentMethod} ${selectedMethod === method.id ? styles.paymentMethodActive : ''} ${selectedMethod && selectedMethod !== method.id ? styles.paymentMethodDimmed : ''}`}>
                    <div className={styles.radioWrapper}>
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className={styles.methodLabel}>{method.method_name}</Label>
                      {selectedMethod === method.id && <span className={styles.selectionBadge}>Selected</span>}
                    </div>
                    {selectedMethod === method.id && (
                      <div className={styles.methodDetails}>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Account Name:</span>
                          <div className={styles.detailValue}>
                            <span>{method.account_name}</span>
                            <button type="button" onClick={() => copyToClipboard(method.account_name, `${method.id}-name`)} className={styles.copyButton}>
                              {copiedField === `${method.id}-name` ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Account Number:</span>
                          <div className={styles.detailValue}>
                            <span className={styles.accountNumber}>{method.account_number}</span>
                            <button type="button" onClick={() => copyToClipboard(method.account_number, `${method.id}-number`)} className={styles.copyButton}>
                              {copiedField === `${method.id}-number` ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>
                        {method.bank_name && (
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Bank:</span>
                            <span>{method.bank_name}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>2. Upload Payment Screenshot</h2>
              <div className={styles.uploadArea}>
                <input type="file" id="screenshot" accept="image/*" onChange={handleFileUpload} className={styles.fileInput} disabled={hasScreenshot} />
                <label htmlFor="screenshot" className={styles.uploadLabel}>
                  <Upload size={32} />
                  <span>{hasScreenshot ? "Remove the current screenshot to upload another one" : "Click to upload your screenshot"}</span>
                  <span className={styles.uploadHint}>Only 1 screenshot • PNG, JPG up to 5MB</span>
                </label>
              </div>
              <p className={styles.limitNote}>Only 1 screenshot can be submitted for each payment proof.</p>
              {screenshotUrls.length > 0 && (
                <div className={styles.screenshots}>
                  {screenshotUrls.map((url, index) => (
                    <div key={index} className={styles.screenshot}>
                      <img src={url} alt={`Screenshot ${index + 1}`} />
                      <button type="button" onClick={() => removeScreenshot(index)} className={styles.removeButton}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" size="lg" className={styles.submitButton} disabled={!selectedMethod || screenshotUrls.length === 0 || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Payment Proof"}
            </Button>
          </form>

          <p className={styles.note}>Your payment will be reviewed by an admin. You will receive access to your enrolled courses once the payment is approved.</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
