import { DollarSign, Clock } from 'lucide-react';
import styles from './admin-payments.module.css';
import { Button } from '~/components/ui/button/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table/table';
import { Badge } from '~/components/ui/badge/badge';
import { EtbIcon } from '~/components/etb-icon';
import type { Route } from './+types/admin-payments';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';


export async function clientLoader() {
  const { getAllPaymentSubmissions } = await import('~/services/admin.client');
  const payments = await getAllPaymentSubmissions();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const approved = payments.filter((p: any) => p.status === 'approved');
  const thisMonthRevenue = approved.filter((p: any) => p.submitted_at >= startOfMonth).reduce((s: number, p: any) => s + Number(p.amount), 0);
  const totalRevenue = approved.reduce((s: number, p: any) => s + Number(p.amount), 0);
  const pendingCount = payments.filter((p: any) => p.status === 'pending').length;
  return { payments, thisMonthRevenue, totalRevenue, pendingCount };
}


export default function AdminPayments({ loaderData }: Route.ComponentProps) {
  const { payments, thisMonthRevenue, totalRevenue, pendingCount } = loaderData as any;

  const stats = [
    {
      title: 'This Month',
      value: thisMonthRevenue.toLocaleString(),
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Total Revenue',
      value: totalRevenue.toLocaleString(),
      icon: DollarSign,
      color: 'blue',
    },
    {
      title: 'Pending Payments',
      value: pendingCount.toString(),
      icon: Clock,
      color: 'yellow',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Payments</h1>
      </div>

      <div className={styles.stats}>
        {stats.map((stat) => (
          <Card key={stat.title} className={styles.statCard}>
            <CardContent className={styles.statContent}>
              <div className={`${styles.statIcon} ${styles[stat.color]}`}>
                <stat.icon size={24} />
              </div>
              <div className={styles.statInfo}>
                <p className={styles.statLabel}>{stat.title}</p>
                <div className={styles.statValue}>
                  {stat.title !== 'Pending Payments' && (
                    <EtbIcon className={styles.etbIcon} />
                  )}
                  <h3>{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <Card className={styles.transactionsCard}>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Course/Bundle</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No payment submissions yet
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment: any) => {
                  const itemName = payment.enrollment?.course?.name || payment.enrollment?.bundle?.name || 'N/A';
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className={styles.nameCell}>
                        {payment.student?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>{itemName}</TableCell>
                      <TableCell>
                        <div className={styles.amount}>
                          {Number(payment.amount).toLocaleString()} <EtbIcon className={styles.etbIcon} />
                        </div>
                      </TableCell>
                      <TableCell>{payment.payment_method || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === 'approved'
                              ? 'default'
                              : payment.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.submitted_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className={styles.mobileCards}>
        {payments.map((payment: any) => {
          const itemName = payment.enrollment?.course?.name || payment.enrollment?.bundle?.name || 'N/A';
          return (
            <Card key={payment.id} className={styles.transactionCard}>
              <CardContent className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>
                    {payment.student?.full_name || 'Unknown'}
                  </h3>
                  <Badge
                    variant={
                      payment.status === 'approved'
                        ? 'default'
                        : payment.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
                <div className={styles.cardDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Course/Bundle:</span>
                    <span className={styles.detailValue}>{itemName}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Amount:</span>
                    <span className={styles.detailValue}>
                      <div className={styles.amount}>
                        {Number(payment.amount).toLocaleString()} <EtbIcon className={styles.etbIcon} />
                      </div>
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Method:</span>
                    <span className={styles.detailValue}>
                      {payment.payment_method || 'N/A'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Date:</span>
                    <span className={styles.detailValue}>
                      {new Date(payment.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}