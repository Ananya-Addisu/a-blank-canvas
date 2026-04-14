import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  Users, 
  HelpCircle, 
  DollarSign, 
  Shield, 
  User,
  ClipboardList,
  LogOut,
  Info,
  Trophy
} from 'lucide-react';
import { LogoutConfirmModal } from './logout-confirm-modal';
import styles from './teacher-sidebar.module.css';

interface TeacherSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeacherSidebar({ isOpen, onClose }: TeacherSidebarProps) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    if (onClose) onClose();
    navigate('/logout');
  };

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <span className={styles.brandText}>Magster</span>
          <span className={styles.badge}>TEACHER</span>
        </div>

        <nav className={styles.nav}>
          <NavLink 
            to="/teacher" 
            end
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/teacher/my-courses"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            <BookOpen size={20} />
            <span>My Courses</span>
          </NavLink>

          <NavLink 
            to="/teacher/content-manager"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            <Video size={20} />
            <span>Content Manager</span>
          </NavLink>

          <NavLink 
            to="/teacher/students"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            <Users size={20} />
            <span>Students</span>
          </NavLink>

          <NavLink 
            to="/teacher/quizzes"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            <HelpCircle size={20} />
            <span>Quizzes & Exams</span>
          </NavLink>

          <NavLink 
            to="/teacher/competitions"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            <Trophy size={20} />
            <span>Competitions</span>
          </NavLink>

          <NavLink
            to="/teacher/earnings"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            <DollarSign size={20} />
            <span>Earnings</span>
          </NavLink>

          <NavLink 
            to="/teacher/withdrawal-terms"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            <Shield size={20} />
            <span>Withdrawal Terms</span>
          </NavLink>

          <NavLink 
            to="/teacher/approvals"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            <ClipboardList size={20} />
            <span>Approval Status</span>
          </NavLink>

          <NavLink 
            to="/teacher/profile"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            <User size={20} />
            <span>Profile</span>
          </NavLink>

          <NavLink 
            to="/teacher/how-to-use"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            <Info size={20} />
            <span>How to Use</span>
          </NavLink>
        </nav>

        <div className={styles.footer}>
          <button onClick={handleLogoutClick} className={styles.logout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
