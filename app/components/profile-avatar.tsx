import { useState, useRef } from 'react';
import { useFetcher } from 'react-router';
import { Camera, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar/avatar';
import { Button } from './ui/button/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog/dialog';
import styles from './profile-avatar.module.css';

interface ProfileAvatarProps {
  profilePicture?: string | null;
  userName: string;
  editable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProfileAvatar({
  profilePicture,
  userName,
  editable = false,
  size = 'md',
  className = '',
}: ProfileAvatarProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('intent', 'upload_profile_picture');
    formData.append('profile_picture', file);

    fetcher.submit(formData, {
      method: 'post',
      encType: 'multipart/form-data',
    });

    setShowUploadDialog(false);
    setPreviewUrl(null);
  };

  const handleRemove = () => {
    fetcher.submit(
      { intent: 'remove_profile_picture' },
      { method: 'post' }
    );
    setShowUploadDialog(false);
  };

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <div className={`${styles.container} ${styles[size]} ${className}`}>
        <Avatar className={styles.avatar}>
          {profilePicture && <AvatarImage src={profilePicture} alt={userName} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {editable && (
          <button
            onClick={() => setShowUploadDialog(true)}
            className={styles.editButton}
            aria-label="Change profile picture"
          >
            <Camera size={16} />
          </button>
        )}
      </div>

      {editable && (
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profile Picture</DialogTitle>
              <DialogDescription>
                Upload a new profile picture or remove the current one
              </DialogDescription>
            </DialogHeader>

            <div className={styles.uploadContent}>
              <div className={styles.preview}>
                {previewUrl || profilePicture ? (
                  <img
                    src={previewUrl || profilePicture || ''}
                    alt="Preview"
                    className={styles.previewImage}
                  />
                ) : (
                  <div className={styles.previewPlaceholder}>
                    <User size={64} />
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className={styles.fileInput}
              />

              <div className={styles.actions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Photo
                </Button>

                {previewUrl && (
                  <Button type="button" onClick={handleUpload}>
                    Upload
                  </Button>
                )}

                {profilePicture && !previewUrl && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleRemove}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
