import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { AdminSidebar } from '~/components/admin-sidebar';
import { AdminHeader } from '~/components/admin-header';
import { getSession } from '~/lib/auth.client';
import styles from './admin.module.css';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (!session || session.userType !== 'admin') {
      navigate('/admin-login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className={styles.layout}>
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={styles.main}>
        <div className={styles.header}>
          <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        </div>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}