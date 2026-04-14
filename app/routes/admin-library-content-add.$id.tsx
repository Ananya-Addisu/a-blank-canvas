import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { Route } from './+types/admin-library-content-add.$id';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select/select';
import { ArrowLeft, Upload, Video, Loader2, FileText } from 'lucide-react';
import { Progress } from '~/components/ui/progress/progress';
import styles from './admin-library.module.css';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';

export default function AdminLibraryContentAdd() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [contentType, setContentType] = useState('book');
  const [videoSource, setVideoSource] = useState('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const requiresUploadedFile = contentType === 'video' ? videoSource === 'upload' : true;

  const handleFileUpload = async (file: File, bucket: string) => {
    setIsUploading(true);
    setUploadProgress('Uploading...');
    setUploadPercent(0);
    try {
      const ext = file.name.split('.').pop() || 'bin';
      const filePath = `library/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) {
        setUploadProgress(`Upload failed: ${error.message}`);
        return;
      }
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setUploadedFileUrl(urlData.publicUrl);
      setUploadProgress('Upload complete');
      setUploadPercent(100);
    } catch (err: any) {
      setUploadProgress(`Upload failed: ${err.message}`);
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);

    if (requiresUploadedFile && !uploadedFileUrl) {
      setUploadProgress(contentType === 'video' ? 'Please upload a video file before saving.' : 'Please upload a document before saving.');
      setSubmitting(false);
      return;
    }

    const fileUrl = uploadedFileUrl;

    await supabase.from('library_content').insert({
      category_id: id,
      title: fd.get('title'),
      description: fd.get('description'),
      content_type: contentType,
      subject: fd.get('subject'),
      author: fd.get('author'),
      file_url: fileUrl,
      video_source: contentType === 'video' ? videoSource : null,
      youtube_url: videoSource === 'youtube' ? (fd.get('youtube_url') as string) : null,
      status: 'active',
      approval_status: 'approved',
    });
    navigate(`/admin/library-manage/${id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="outline" onClick={() => navigate(`/admin/library-manage/${id}`)}>
          <ArrowLeft size={20} />
          Back to Category
        </Button>
        <h1 className={styles.title}>Add Library Content</h1>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Enter content title" required />
          </div>

          <div className={styles.formGroup}>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Enter description" required rows={3} />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <Label htmlFor="content_type">Content Type</Label>
              <Select name="content_type" required defaultValue="book" onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">Book (PDF)</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" placeholder="e.g. Mathematics" required />
            </div>
          </div>

          <div className={styles.formGroup}>
            <Label htmlFor="author">Author / Instructor</Label>
            <Input id="author" name="author" placeholder="Enter author name" />
          </div>

          {contentType === 'video' && (
            <div className={styles.formGroup}>
              <Label>Video Source</Label>
              <Select name="video_source" defaultValue="upload" onValueChange={setVideoSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upload">Direct Upload</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {contentType === 'video' && videoSource === 'youtube' && (
            <div className={styles.formGroup}>
              <Label htmlFor="youtube_url">YouTube URL</Label>
              <Input id="youtube_url" name="youtube_url" placeholder="https://youtube.com/..." required />
            </div>
          )}

          {contentType === 'video' && videoSource === 'upload' && (
            <div className={styles.formGroup}>
              <Label>Upload Video File *</Label>
              {uploadedFileUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--color-success-3)', borderRadius: 'var(--radius-2)', color: 'var(--color-success-11)', fontSize: '0.875rem' }}>
                  <Video size={16} /> Video uploaded successfully
                  <Button type="button" variant="outline" size="sm" onClick={() => setUploadedFileUrl('')} style={{ marginLeft: 'auto' }}>Change</Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="file"
                    accept="video/*"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'course-videos');
                    }}
                  />
                  {isUploading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--color-accent-11)' }}>
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {uploadProgress}
                      </div>
                      <Progress value={uploadPercent} style={{ height: '8px' }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {(contentType === 'book' || contentType === 'exam') && (
            <div className={styles.formGroup}>
              <Label>Upload PDF / Document *</Label>
              {uploadedFileUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--color-success-3)', borderRadius: 'var(--radius-2)', color: 'var(--color-success-11)', fontSize: '0.875rem' }}>
                  <FileText size={16} /> File uploaded successfully
                  <Button type="button" variant="outline" size="sm" onClick={() => setUploadedFileUrl('')} style={{ marginLeft: 'auto' }}>Change</Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'content-images');
                    }}
                  />
                  {isUploading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--color-accent-11)' }}>
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {uploadProgress}
                      </div>
                      <Progress value={uploadPercent} style={{ height: '8px' }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={() => navigate(`/admin/library-manage/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || isUploading || (requiresUploadedFile && !uploadedFileUrl)}>
              {submitting ? 'Adding...' : 'Add Content'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
