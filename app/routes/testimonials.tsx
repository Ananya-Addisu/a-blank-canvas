import { useState, useEffect } from 'react';
import { BottomNav } from '~/components/bottom-nav';
import { LoadingScreen } from '~/components/loading-screen';
import { Button } from '~/components/ui/button/button';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Star, Send as SendIcon, ImagePlus, X } from 'lucide-react';
import { OfflineBanner } from '~/components/offline-banner';
import { getStudentAuth } from '~/lib/auth.client';
import { supabase } from '~/lib/supabase.client';
import styles from './testimonials.module.css';

export default function TestimonialsPage() {
  const [student, setStudent] = useState<any>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [s, { data: t }] = await Promise.all([
        getStudentAuth(),
        supabase.from('testimonials').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(20),
      ]);
      setStudent(s);
      setTestimonials(t || []);
      setLoading(false);
    }
    load();
  }, []);

  const handleSubmitTestimonial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!student) return;

    const form = e.currentTarget;
    setSubmitting(true);
    setSubmitSuccess(false);
    setUploadError(null);

    const formData = new FormData(form);
    const content = (formData.get('content') as string | null)?.trim() || '';

    if (!content) {
      setUploadError('Please add your testimonial before submitting.');
      setSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert({
          student_id: student.id,
          student_name: student.full_name,
          content,
          rating,
          image_urls: imageUrls,
          status: 'pending',
        })
        .select('id')
        .single();

      if (error || !data) {
        throw error || new Error('Failed to submit testimonial');
      }

      setSubmitSuccess(true);
      setImageUrls([]);
      form.reset();
      setRating(5);
    } catch {
      setUploadError('Failed to submit testimonial. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className={styles.container}>
      <OfflineBanner />
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>Testimonials</h1>
            <p className={styles.heroSubtitle}>See what students are saying about Magster</p>
          </div>

          {/* Testimonials list */}
          <div className={styles.section}>
            {testimonials.length === 0 ? (
              <p className={styles.emptyTestimonials}>No testimonials yet. Be the first to share your experience!</p>
            ) : (
              <div className={styles.testimonialsList}>
                {testimonials.map((t: any) => (
                  <div key={t.id} className={styles.testimonialCard}>
                    {(t.admin_edited_content || t.content) && (
                      <p className={styles.testimonialContent}>"{t.admin_edited_content || t.content}"</p>
                    )}
                    {t.image_urls && t.image_urls.length > 0 && (
                      <div className={styles.testimonialImages}>
                        {t.image_urls.map((url: string, i: number) => (
                          <img key={i} src={url} alt="Testimonial" className={styles.testimonialImg} onClick={() => setLightboxImg(url)} />
                        ))}
                      </div>
                    )}
                    <div className={styles.testimonialAuthor}>
                      <span>{t.student_name}</span>
                      <span className={styles.stars}>
                        {'★'.repeat(t.rating || 5)}{'☆'.repeat(5 - (t.rating || 5))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit form */}
          {student && (
            <div className={styles.submitSection}>
              <h3 className={styles.submitTitle}>Share Your Experience</h3>
              {submitSuccess && (
                <div className={styles.successMsg}>Thank you! Your testimonial will appear after admin approval.</div>
              )}
              <form onSubmit={handleSubmitTestimonial} className={styles.testimonialForm}>
                <div className={styles.ratingSelect}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`${styles.starBtn} ${s <= rating ? styles.active : ''}`}
                      onClick={() => setRating(s)}
                    >
                      <Star size={24} fill={s <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                <Textarea name="content" placeholder="Tell us about your experience with Magster..." rows={4} />

                <div className={styles.imageUploadArea}>
                  {uploadError && (
                    <div style={{
                      padding: 'var(--space-3)',
                      background: 'var(--color-error-3)',
                      border: '1px solid var(--color-error-6)',
                      borderRadius: 'var(--radius-3)',
                      color: 'var(--color-error-11)',
                      fontSize: '0.875rem',
                    }}>
                      {uploadError}
                    </div>
                  )}
                  <label className={styles.imageUploadBtn}>
                    <ImagePlus size={16} />
                    {uploading ? 'Uploading...' : 'Add Images'}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      disabled={uploading}
                      onChange={async (e) => {
                        const files = e.target.files;
                        const input = e.target;
                        if (!files || files.length === 0) return;

                        setUploading(true);
                        setSubmitSuccess(false);
                        setUploadError(null);

                        try {
                          const uploadedUrls: string[] = [];
                          for (let index = 0; index < files.length; index++) {
                            const file = files[index];
                            const ext = file.name.split('.').pop() || 'jpg';
                            const filePath = `testimonials/${student.id}/${Date.now()}-${index}-${Math.random().toString(36).slice(2)}.${ext}`;
                            const { data, error } = await supabase.storage.from('content-images').upload(filePath, file, {
                              cacheControl: '3600',
                              upsert: false,
                            });

                            if (error || !data) {
                              throw error || new Error('Upload failed');
                            }

                            const { data: urlData } = supabase.storage.from('content-images').getPublicUrl(data.path);
                            uploadedUrls.push(urlData.publicUrl);
                          }

                          setImageUrls(prev => [...prev, ...uploadedUrls]);
                        } catch (err) {
                          console.error('Image upload error:', err);
                          setUploadError('Image upload failed. Please try again.');
                        } finally {
                          input.value = '';
                          setUploading(false);
                        }
                      }}
                    />
                  </label>
                  {imageUrls.length > 0 && (
                    <div className={styles.imagePreviewRow}>
                      {imageUrls.map((url, i) => (
                        <div key={i} className={styles.imagePreviewItem}>
                          <img src={url} alt="" className={styles.previewImg} />
                          <button type="button" className={styles.removeImgBtn} onClick={() => setImageUrls(prev => prev.filter((_, idx) => idx !== i))}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={submitting || uploading}>
                  <SendIcon size={16} /> {submitting ? 'Submitting...' : 'Submit Testimonial'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>

      {lightboxImg && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxImg(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxImg(null)}>
            <X size={24} />
          </button>
          <img src={lightboxImg} alt="Testimonial" className={styles.lightboxImg} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <BottomNav />
    </div>
  );
}
