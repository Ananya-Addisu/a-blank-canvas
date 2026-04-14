import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog/alert-dialog';
import { LogOut } from 'lucide-react';
import styles from './logout-confirm-modal.module.css';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className={styles.modal}>
        <AlertDialogHeader className={styles.modalHeader}>
          <div className={styles.modalIcon}>
            <LogOut size={28} />
          </div>
          <AlertDialogTitle className={styles.modalTitle}>
            Confirm Logout
          </AlertDialogTitle>
          <AlertDialogDescription className={styles.modalDescription}>
            Are you sure you want to log out? You'll need to sign in again to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={styles.modalFooter}>
          <AlertDialogCancel className={styles.cancelButton} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction className={styles.confirmButton} onClick={onConfirm}>
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
