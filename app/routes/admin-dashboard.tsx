import { useLoaderData, Link } from 'react-router';
import type { Route } from './+types/admin-dashboard';
import { Users, BookOpen, DollarSign, Award, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card/card';
import { useCachedData } from '~/hooks/use-cached-data';
import styles from './admin-dashboard.module.css';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';


export async function clientLoader() {
  const { getDashboardStats, getPendingStudents, getAllStudents } = await import('~/services/admin.client');
  const [stats, pendingStudents, pendingTeachers] = await Promise.all([
    getDashboardStats(),
    getPendingStudents(),
    supabase.from('teachers').select('*').eq('is_approved', false).order('created_at', { ascending: false }).then(r => r.data || []),
  ]);
  const { data: recentUsers } = await supabase.from('students').select('*').order('created_at', { ascending: false }).limit(10);
  // Revenue calculations
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
  const { data: thisMonthPayments } = await supabase.from('payment_submissions').select('amount').eq('status', 'approved').gte('submitted_at', startOfMonth);
  const { data: prevMonthPayments } = await supabase.from('payment_submissions').select('amount').eq('status', 'approved').gte('submitted_at', startOfPrevMonth).lte('submitted_at', endOfPrevMonth);
  const thisMonthRevenue = (thisMonthPayments || []).reduce((s: number, p: any) => s + Number(p.amount), 0);
  const prevMonthRevenue = (prevMonthPayments || []).reduce((s: number, p: any) => s + Number(p.amount), 0);
  const revenueGrowth = prevMonthRevenue > 0 ? Math.round(((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : 0;
  // Student growth
  const { count: thisMonthStudents } = await supabase.from('students').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth);
  const { count: prevMonthStudents } = await supabase.from('students').select('*', { count: 'exact', head: true }).gte('created_at', startOfPrevMonth).lte('created_at', endOfPrevMonth);
  const studentsGrowth = (prevMonthStudents || 0) > 0 ? Math.round((((thisMonthStudents || 0) - (prevMonthStudents || 0)) / (prevMonthStudents || 1)) * 100) : 0;
  return { stats, recentUsers: recentUsers || [], pendingStudents, pendingTeachers, studentsGrowth, revenueGrowth, thisMonthRevenue };
}


export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { data: cachedLoaderData } = useCachedData('admin_dashboard', loaderData as any);
  const { stats, recentUsers, pendingStudents, pendingTeachers, studentsGrowth, revenueGrowth, thisMonthRevenue } = (cachedLoaderData || loaderData) as any;

  const dashboardStats = [
    {
      title: 'Total Students',
      value: (stats?.totalStudents ?? 0).toLocaleString(),
      icon: Users,
      change: studentsGrowth,
      color: '#3b82f6'
    },
    {
      title: 'Active Courses',
      value: (stats?.totalCourses ?? 0).toLocaleString(),
      icon: BookOpen,
      change: 0,
      color: '#8b5cf6'
    },
    {
      title: 'Revenue (Month)',
      value: `ETB ${(thisMonthRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      change: revenueGrowth ?? 0,
      color: '#10b981'
    },
    {
      title: 'Teachers',
      value: (stats?.totalTeachers ?? 0).toLocaleString(),
      icon: Award,
      change: 0,
      color: '#f59e0b'
    },
  ];

  const pendingItems = [
    {
      title: 'Pending Students',
      value: stats?.pendingStudents ?? 0,
      icon: Clock,
      link: '/admin/users'
    },
    {
      title: 'Pending Teachers',
      value: stats?.pendingTeachers ?? 0,
      icon: Clock,
      link: '/admin/teachers'
    },
    {
      title: 'Pending Payments',
      value: stats?.pendingPayments ?? 0,
      icon: Clock,
      link: '/admin/payment-approvals'
    }
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>Welcome back! Here's what's happening.</p>

      {/* Show alert if there are pending approvals */}
      {(pendingStudents.length > 0 || pendingTeachers.length > 0) && (
        <Card className={styles.alertCard} style={{ backgroundColor: '#fff3cd', borderColor: '#ffc107', marginBottom: '24px' }}>
          <CardContent style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={24} color="#856404" />
              <div>
                <p style={{ fontWeight: 600, color: '#856404', marginBottom: '4px' }}>
                  {pendingStudents.length + pendingTeachers.length} Pending Approvals
                </p>
                <p style={{ fontSize: '14px', color: '#856404' }}>
                  {pendingStudents.length > 0 && `${pendingStudents.length} student${pendingStudents.length > 1 ? 's' : ''} waiting for approval. `}
                  {pendingTeachers.length > 0 && `${pendingTeachers.length} teacher${pendingTeachers.length > 1 ? 's' : ''} waiting for approval.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className={styles.stats}>
        {dashboardStats.map((stat) => (
          <Card key={stat.title} className={styles.statCard}>
            <CardContent className={styles.statContent}>
              <div className={styles.statIcon} style={{ backgroundColor: stat.color + '20' }}>
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div className={styles.statInfo}>
                <p className={styles.statLabel}>{stat.title}</p>
                <h3 className={styles.statValue}>{stat.value}</h3>
              </div>
              {stat.change !== 0 && (
                <span className={`${styles.statChange} ${stat.change >= 0 ? styles.positive : styles.negative}`}>
                  <TrendingUp size={16} />
                  {stat.change >= 0 ? '+' : ''}{stat.change}%
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className={styles.grid}>
        <Card className={styles.pendingCard}>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.pendingList}>
              {pendingItems.map((item) => (
                <Link key={item.title} to={item.link} className={styles.pendingItem}>
                  <div className={styles.pendingInfo}>
                    <item.icon size={20} />
                    <span>{item.title}</span>
                  </div>
                  <span className={styles.pendingCount}>{item.value}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={styles.recentUsers}>
          <CardHeader>
            <CardTitle>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Recent Students</span>
                <Link to="/admin/users" className={styles.viewAll}>View All</Link>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <div className={styles.emptyState}>
                <Users size={48} />
                <p>No students yet</p>
              </div>
            ) : (
              <div className={styles.usersList}>
                {recentUsers.map((user) => {
                  const initials = user.full_name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase() || 'U';
                  
                  const daysAgo = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
                  const timeText = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
                  
                  return (
                    <div key={user.id} className={styles.userItem}>
                      <div className={styles.userAvatar}>{initials}</div>
                      <div className={styles.userInfo}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <p className={styles.userName}>{user.full_name}</p>
                          {!user.is_approved && (
                            <span style={{ 
                              fontSize: '11px', 
                              padding: '2px 6px', 
                              backgroundColor: '#ffc107', 
                              color: '#000', 
                              borderRadius: '4px',
                              fontWeight: 600
                            }}>
                              PENDING
                            </span>
                          )}
                        </div>
                        <p className={styles.userPhone}>{user.phone_number}</p>
                      </div>
                      <p className={styles.userDate}>{timeText}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
