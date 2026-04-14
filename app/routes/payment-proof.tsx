import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button/button";
import { ArrowLeft, CheckCircle2, Upload, X } from "lucide-react";
import styles from "./payment-proof.module.css";
import telebirrLogo from "~/assets/telebirr-logo.svg";
import cbeLogo from "~/assets/cbe-logo.svg";
import boaLogo from "~/assets/boa-logo.svg";
import { getStudentAuth } from "~/lib/auth.client";
import { submitPayment } from "~/services/enrollment.client";
import { supabase } from "~/lib/supabase.client";
import { LoadingScreen } from "~/components/loading-screen";

export default function PaymentProof() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enrollmentId = searchParams.get('enrollment_id') || '';
  const amount = searchParams.get('amount') || '0';
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const isUploadLocked = uploadedUrls.length >= 1;

  useEffect(() => {
    (async () => {
      const s = await getStudentAuth();
      if (!s) { navigate('/login'); return; }
      setStudent(s);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const files = input.files;
    if (!files || files.length === 0) return;
    if (isUploadLocked) { toast.warning('You can only upload 1 payment screenshot.'); input.value = ''; return; }

    setUploading(true);
    try {
      const maxSize = 2 * 1024 * 1024;
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const [file] = Array.from(files);
      if (!validImageTypes.includes(file.type)) { toast.error('Not a valid image file.'); return; }
      if (file.size > maxSize) { toast.error('File too large. Max 2MB.'); return; }

      const reader = new FileReader();
      const previewUrl = await new Promise<string>((resolve) => { reader.onloadend = () => resolve(reader.result as string); reader.readAsDataURL(file); });

      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `${student.id}/${enrollmentId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from("payment-proofs").upload(filePath, file, { contentType: file.type, upsert: false });
      if (error) { toast.error(`Upload failed: ${error.message}`); return; }
      const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(data.path);
      setPreviewUrls([previewUrl]);
      setUploadedUrls([urlData.publicUrl]);
    } catch { toast.error('Upload error.'); } finally { setUploading(false); input.value = ''; }
  };

  const removeScreenshot = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setUploadedUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError("");
    try {
      await submitPayment({
        enrollment_id: enrollmentId,
        student_id: student.id,
        screenshot_urls: uploadedUrls,
        payment_method: selectedMethod,
        amount: Number(amount),
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
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Submit Payment Proof</h1>
            <p className={styles.subtitle}>Upload 1 screenshot of your successful bank transfer</p>
          </div>

          {actionError && <div className={styles.errorMessage}>{actionError}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.uploadSection}>
              <h2 className={styles.sectionTitle}>Select Payment Method</h2>
              <div className={styles.methodGrid}>
                {[
                  { key: 'Telebirr', logo: telebirrLogo, label: 'Telebirr' },
                  { key: 'CBE', logo: cbeLogo, label: 'CBE' },
                  { key: 'BoA', logo: boaLogo, label: 'Bank of Abyssinia' },
                ].map((method) => (
                  <button key={method.key} type="button" onClick={() => setSelectedMethod(method.key)} className={`${styles.methodCard} ${selectedMethod === method.key ? styles.methodActive : ''} ${selectedMethod && selectedMethod !== method.key ? styles.methodDimmed : ''}`} aria-pressed={selectedMethod === method.key}>
                    <img src={method.logo} alt={method.label} className={styles.methodLogo} />
                    <span className={styles.methodLabel}>{method.label}</span>
                    {selectedMethod === method.key && (<span className={styles.methodSelectedPill}><CheckCircle2 size={14} />Selected</span>)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.uploadSection}>
              <h2 className={styles.sectionTitle}>Upload Payment Screenshot</h2>
              <p className={styles.sectionDesc}>Upload only 1 screenshot of your successful transaction</p>
              <div className={styles.uploadArea}>
                <input type="file" id="screenshot" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleFileUpload} className={styles.fileInput} disabled={uploading || isUploadLocked} />
                <label htmlFor="screenshot" className={`${styles.uploadLabel} ${isUploadLocked ? styles.uploadLabelDisabled : ''}`}>
                  <Upload size={48} />
                  <span className={styles.uploadText}>{uploading ? 'Uploading...' : isUploadLocked ? 'Remove the current screenshot to upload another one' : 'Click to upload your screenshot'}</span>
                  <span className={styles.uploadHint}>Only 1 screenshot • PNG, JPG, GIF, WEBP up to 2MB</span>
                </label>
              </div>
              <p className={styles.limitNote}>Only 1 screenshot can be submitted for each payment proof.</p>
              {previewUrls.length > 0 && (
                <div className={styles.previewGrid}>
                  {previewUrls.map((url: string, index: number) => (
                    <div key={index} className={styles.previewItem}>
                      <img src={url} alt={`Screenshot ${index + 1}`} className={styles.previewImage} />
                      <button type="button" onClick={() => removeScreenshot(index)} className={styles.removeButton}><X size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <Button type="button" variant="outline" size="lg" onClick={() => window.history.back()}>
                <ArrowLeft size={20} /> Go Back
              </Button>
              <Button type="submit" size="lg" disabled={uploadedUrls.length === 0 || isSubmitting || uploading || !selectedMethod}>
                {isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
