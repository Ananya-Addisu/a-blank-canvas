import { useState, useEffect } from 'react';
import { useIsNativePlatform } from '~/hooks/use-is-native';
import { BrowserOnlyScreen } from '~/components/browser-only-screen';
import { useNavigate } from 'react-router';
import { TeacherSidebar } from '~/components/teacher-sidebar';
import { TeacherHeader } from '~/components/teacher-header';
import { Button } from '~/components/ui/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '~/components/ui/dialog/dialog';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select/select';
import { CreditCard, DollarSign, Clock, CheckCircle, TrendingUp, Wallet } from 'lucide-react';
import { getTeacherAuth } from '~/lib/auth.client';
import { getTeacherEarnings, getTotalEarnings, requestWithdrawal } from '~/services/earnings.client';
import styles from './teacher-earnings.module.css';

export default function TeacherEarnings() {
  const isNative = useIsNativePlatform();
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState<any[]>([]);
  const [earningStats, setEarningStats] = useState({ total: 0, available: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [teacherId, setTeacherId] = useState('');

  useEffect(() => {
    (async () => {
      const t = await getTeacherAuth();
      if (!t) { navigate('/teacher-login', { replace: true }); return; }
      setTeacherId(t.id);
      const [e, s] = await Promise.all([getTeacherEarnings(t.id), getTotalEarnings(t.id)]);
      setEarnings(e);
      setEarningStats(s);
      setLoading(false);
    })();
  }, []);

  const handlePayout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await requestWithdrawal(teacherId, Number(fd.get('amount')));
    setIsPayoutDialogOpen(false);
    const [newE, newS] = await Promise.all([getTeacherEarnings(teacherId), getTotalEarnings(teacherId)]);
    setEarnings(newE);
    setEarningStats(newS);
  };

  if (isNative === null || loading) return null;
  if (isNative) return <BrowserOnlyScreen />;

  const stats = [
    { label: 'Total Earnings', value: `${earningStats.total} ETB`, icon: <TrendingUp size={24} />, color: '#3B82F6' },
    { label: 'Available Balance', value: `${earningStats.available} ETB`, icon: <DollarSign size={24} />, color: '#10B981' },
    { label: 'Pending Payouts', value: `${earningStats.pending} ETB`, icon: <Clock size={24} />, color: '#F59E0B' },
  ];

  return (
    <div className={styles.container}>
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={styles.main}>
        <TeacherHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Earnings</h1>
            <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
              <DialogTrigger asChild><Button className={styles.requestButton}>Request Payout</Button></DialogTrigger>
              <DialogContent className={styles.modalContent}>
                <DialogHeader className={styles.modalHeader}>
                  <div className={styles.modalIcon}><Wallet size={28} /></div>
                  <DialogTitle className={styles.modalTitle}>Request Payout</DialogTitle>
                  <DialogDescription className={styles.modalDescription}>Withdraw your earnings.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePayout}>
                  <div className={styles.modalBody}>
                    <div className={styles.formGroup}><Label htmlFor="amount">Amount (ETB)</Label><Input id="amount" name="amount" type="number" max={earningStats.available} placeholder={`Max: ${earningStats.available}`} required /></div>
                    <div className={styles.formGroup}><Label htmlFor="method">Payment Method</Label>
                      <Select name="method" defaultValue="CBE"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CBE">CBE</SelectItem><SelectItem value="Telebirr">Telebirr</SelectItem><SelectItem value="Abyssinia">Bank of Abyssinia</SelectItem></SelectContent></Select>
                    </div>
                    <div className={styles.formGroup}><Label htmlFor="details">Account Details</Label><Input id="details" name="details" placeholder="Account number or phone" required /></div>
                  </div>
                  <div className={styles.modalFooter}>
                    <DialogClose asChild><Button type="button" variant="outline" className={styles.cancelButton}>Cancel</Button></DialogClose>
                    <Button type="submit" className={styles.submitButton}>Request Withdrawal</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.iconContainer} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
                <div className={styles.statContent}><div className={styles.statValue}>{stat.value}</div><div className={styles.statLabel}>{stat.label}</div></div>
              </div>
            ))}
          </div>
          <div className={styles.transactionsSection}>
            <h2 className={styles.sectionTitle}>Recent Transactions</h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead><tr><th>Date</th><th>Description</th><th>Course</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {earnings.map((tx: any) => (
                    <tr key={tx.id}>
                      <td className={styles.date}>{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className={styles.description}>{tx.description || tx.type}</td>
                      <td className={styles.course}>{tx.enrollment?.course?.name || '-'}</td>
                      <td className={styles.amount}>{tx.amount} ETB</td>
                      <td><span className={`${styles.badge} ${tx.status === 'paid' ? styles.success : ''}`}>{tx.status}</span></td>
                    </tr>
                  ))}
                  {earnings.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-neutral-9)' }}>No transactions found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
