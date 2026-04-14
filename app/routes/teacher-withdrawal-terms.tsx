import { useState, useEffect } from 'react';
import { TeacherHeader } from '../components/teacher-header';
import { TeacherSidebar } from '../components/teacher-sidebar';
import { supabase } from '~/lib/supabase.client';
import styles from './teacher-withdrawal-terms.module.css';

export default function TeacherWithdrawalTerms() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [terms, setTerms] = useState('');

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'teacher_withdrawal_terms')
      .single()
      .then(({ data }) => setTerms(data?.setting_value || ''));
  }, []);

  return (
    <div className={styles.container}>
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className={styles.main}>
        <TeacherHeader onMenuClick={() => setIsSidebarOpen(true)} />

        <div className={styles.content}>
          <h1 className={styles.title}>Withdrawal Terms & Conditions</h1>

          <div className={styles.termsContainer}>
            <div className={styles.termsContent}>
              {terms}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}