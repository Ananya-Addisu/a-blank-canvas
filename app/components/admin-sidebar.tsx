import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, Users, UserCog, BookOpen, Package, FolderEdit, Award, Library, PlayCircle,
  CreditCard, CheckSquare, Settings, LogOut, X, Send, UserPlus, LayoutGrid, HelpCircle,
  ShieldOff, MessageSquare, Megaphone, FolderTree, Star,
} from 'lucide-react';
import styles from './admin-sidebar.module.css';
import { Badge } from './ui/badge/badge';
import { LogoutConfirmModal } from './logout-confirm-modal';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleLogoutConfirm = () => { setShowLogoutModal(false); onClose?.(); navigate('/logout'); };

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>Magster</h1>
          <Badge variant="default" className={styles.badge}>ADMIN</Badge>
        </div>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close"><X size={24} /></button>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/admin" end prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><LayoutDashboard size={20} /><span>Dashboard</span></NavLink>
        <NavLink to="/admin/users" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><Users size={20} /><span>Users</span></NavLink>
        <NavLink to="/admin/teachers" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><UserCog size={20} /><span>Teachers</span></NavLink>
        <NavLink to="/admin/courses" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><BookOpen size={20} /><span>Courses</span></NavLink>
        <NavLink to="/admin/bundles" prefetch="intent" className={({ isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`}><Package size={20} /><span>Bundles</span></NavLink>
        <NavLink to="/admin/featured-paths" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><Star size={20} /><span>Featured Paths</span></NavLink>
        <NavLink to="/admin/competitions" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><Award size={20} /><span>Competitions</span></NavLink>
        <NavLink to="/admin/library" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><Library size={20} /><span>Library</span></NavLink>
        <NavLink to="/admin/tutorials" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><PlayCircle size={20} /><span>Tutorials</span></NavLink>
        <NavLink to="/admin/content-manager" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><FolderEdit size={20} /><span>Content Manager</span></NavLink>
        <NavLink to="/admin/content-approvals" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><CheckSquare size={20} /><span>Content Approvals</span></NavLink>
        <NavLink to="/admin/payments" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><CreditCard size={20} /><span>Payments</span></NavLink>
        <NavLink to="/admin/payment-approvals" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><CheckSquare size={20} /><span>Payment Approvals</span></NavLink>
        <NavLink to="/admin/payment-methods" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><CreditCard size={20} /><span>Payment Methods</span></NavLink>
        <NavLink to="/admin/manual-enrollment" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><UserPlus size={20} /><span>Manual Enrollment</span></NavLink>
        <NavLink to="/admin/home-ordering" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><LayoutGrid size={20} /><span>Home Ordering</span></NavLink>
        <NavLink to="/admin/categories" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><FolderTree size={20} /><span>Categories</span></NavLink>
        <NavLink to="/admin/popup-notices" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><Megaphone size={20} /><span>Popup Notices</span></NavLink>
        <NavLink to="/admin/settings" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><Settings size={20} /><span>Settings</span></NavLink>
        <NavLink to="/admin/send-notification" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><Send size={20} /><span>Send Notification</span></NavLink>
        <NavLink to="/admin/user-access" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><ShieldOff size={20} /><span>User Access</span></NavLink>
        <NavLink to="/admin/testimonials" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><MessageSquare size={20} /><span>Testimonials</span></NavLink>
        <NavLink to="/admin/how-to-use" prefetch="intent" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><HelpCircle size={20} /><span>How to Use</span></NavLink>

        <button onClick={handleLogoutClick} className={styles.logout}><LogOut size={20} /><span>Logout</span></button>
      </nav>
      </aside>

      <LogoutConfirmModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogoutConfirm} />
    </>
  );
}
