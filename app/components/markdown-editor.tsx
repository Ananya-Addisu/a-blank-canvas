import { useState, useRef } from 'react';
import { MarkdownRenderer } from './markdown-renderer';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Eye, Code, ImagePlus, Loader2, Copy, Check } from 'lucide-react';
import styles from './markdown-editor.module.css';

interface MarkdownEditorProps {
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function MarkdownEditor({ name, defaultValue = '', value, onChange, placeholder, required }: MarkdownEditorProps) {
  const [internalContent, setInternalContent] = useState(defaultValue);
  const content = value !== undefined ? value : internalContent;
  const setContent = (val: string | ((prev: string) => string)) => {
    const newVal = typeof val === 'function' ? val(content) : val;
    if (onChange) onChange(newVal);
    else setInternalContent(newVal);
  };
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    setUploadedUrl(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.error) {
        setUploadError(result.error);
      } else {
        setUploadedUrl(result.url);
      }
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyUrl = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(`![image](${uploadedUrl})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const insertIntoContent = () => {
    if (uploadedUrl) {
      setContent(prev => prev + `\n![image](${uploadedUrl})\n`);
      setUploadedUrl(null);
    }
  };

  return (
    <div className={styles.container}>
      {/* Mobile tab switcher */}
      <div className={styles.mobileTabs}>
        <button type="button" className={`${styles.mobileTab} ${mobileTab === 'edit' ? styles.active : ''}`} onClick={() => setMobileTab('edit')}>
          <Code size={14} /> Editor
        </button>
        <button type="button" className={`${styles.mobileTab} ${mobileTab === 'preview' ? styles.active : ''}`} onClick={() => setMobileTab('preview')}>
          <Eye size={14} /> Preview
        </button>
      </div>

      {/* Image upload toolbar */}
      <div className={styles.imageToolbar}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 size={14} className={styles.spinning} /> : <ImagePlus size={14} />}
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        {uploadedUrl && (
          <div className={styles.uploadedUrl}>
            <span className={styles.urlText}>Image uploaded!</span>
            <button type="button" className={styles.copyBtn} onClick={copyUrl}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy MD'}
            </button>
            <button type="button" className={styles.insertBtn} onClick={insertIntoContent}>
              Insert
            </button>
          </div>
        )}
        {uploadError && <span className={styles.uploadError}>{uploadError}</span>}
      </div>

      <div className={styles.splitView}>
        {/* Editor pane */}
        <div className={`${styles.editorPane} ${mobileTab === 'edit' ? styles.showMobile : styles.hideMobile}`}>
          <div className={styles.paneHeader}>
            <Code size={14} />
            <span>Markdown</span>
          </div>
          <Textarea
            name={name}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder || 'Write your content in Markdown...\n\nSupports:\n- **Bold**, *Italic*, ~~Strikethrough~~\n- # Headings\n- Math: $E = mc^2$ or $$\\sum_{i=1}^n x_i$$\n- Mermaid diagrams: ```mermaid\n- Images: ![alt](url)\n- Tables, lists, code blocks, and more'}
            className={styles.textarea}
            required={required}
          />
        </div>

        {/* Preview pane */}
        <div className={`${styles.previewPane} ${mobileTab === 'preview' ? styles.showMobile : styles.hideMobile}`}>
          <div className={styles.paneHeader}>
            <Eye size={14} />
            <span>Preview</span>
          </div>
          <div className={styles.previewContent}>
            {content ? (
              <MarkdownRenderer content={content} showFontControls={false} />
            ) : (
              <p className={styles.placeholder}>Start typing to see a preview...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
