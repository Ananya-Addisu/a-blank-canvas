import { supabase } from '~/lib/supabase.server';

export async function getTeacherEarnings(teacherId: string) {
  const { data, error } = await supabase
    .from('teacher_earnings')
    .select(`
      *,
      enrollment:enrollments(
        id,
        student:students(id, full_name),
        course:courses(id, name)
      )
    `)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching teacher earnings:', error);
    return [];
  }

  return data || [];
}

export async function getTotalEarnings(teacherId: string) {
  const { data, error } = await supabase
    .from('teacher_earnings')
    .select('amount, status, type')
    .eq('teacher_id', teacherId);

  if (error) {
    console.error('Error fetching total earnings:', error);
    return {
      total: 0,
      pending: 0,
      paid: 0,
      available: 0
    };
  }

  const total = data?.reduce((sum, e) => {
    if (e.type !== 'withdrawal') {
      return sum + Number(e.amount);
    }
    return sum;
  }, 0) || 0;

  const withdrawn = data?.reduce((sum, e) => {
    if (e.type === 'withdrawal' && e.status === 'paid') {
      return sum + Number(e.amount);
    }
    return sum;
  }, 0) || 0;

  const pending = data?.reduce((sum, e) => {
    if (e.type !== 'withdrawal' && e.status === 'pending') {
      return sum + Number(e.amount);
    }
    return sum;
  }, 0) || 0;

  const paid = data?.reduce((sum, e) => {
    if (e.type !== 'withdrawal' && e.status === 'paid') {
      return sum + Number(e.amount);
    }
    return sum;
  }, 0) || 0;

  const available = paid - withdrawn;

  return {
    total,
    pending,
    paid,
    available,
    withdrawn
  };
}

export async function recordEnrollmentEarning(
  teacherId: string,
  enrollmentId: string,
  amount: number
) {
  const { data, error } = await supabase
    .from('teacher_earnings')
    .insert({
      teacher_id: teacherId,
      enrollment_id: enrollmentId,
      amount,
      type: 'enrollment',
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording earning:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function recordBonus(
  teacherId: string,
  amount: number,
  notes?: string
) {
  const { data, error } = await supabase
    .from('teacher_earnings')
    .insert({
      teacher_id: teacherId,
      amount,
      type: 'bonus',
      status: 'pending',
      notes
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording bonus:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function requestWithdrawal(
  teacherId: string,
  amount: number
) {
  // Check if teacher has enough available balance
  const earnings = await getTotalEarnings(teacherId);

  if (earnings.available < amount) {
    return { 
      success: false, 
      error: 'Insufficient balance' 
    };
  }

  // Check minimum withdrawal amount (500 ETB)
  if (amount < 500) {
    return { 
      success: false, 
      error: 'Minimum withdrawal amount is 500 ETB' 
    };
  }

  const { data, error } = await supabase
    .from('teacher_earnings')
    .insert({
      teacher_id: teacherId,
      amount: -amount, // Negative for withdrawal
      type: 'withdrawal',
      status: 'pending',
      withdrawal_request_date: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error requesting withdrawal:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function approveEarning(earningId: string, adminId?: string) {
  const { data, error } = await supabase
    .from('teacher_earnings')
    .update({ 
      status: 'approved',
      paid_at: new Date().toISOString()
    })
    .eq('id', earningId)
    .select()
    .single();

  if (error) {
    console.error('Error approving earning:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function markEarningAsPaid(earningId: string, notes?: string) {
  const updateData: any = {
    status: 'paid',
    paid_at: new Date().toISOString()
  };

  if (notes) updateData.notes = notes;

  const { data, error } = await supabase
    .from('teacher_earnings')
    .update(updateData)
    .eq('id', earningId)
    .select()
    .single();

  if (error) {
    console.error('Error marking earning as paid:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function getPendingWithdrawals() {
  const { data, error } = await supabase
    .from('teacher_earnings')
    .select(`
      *,
      teacher:teachers(id, full_name, phone_number, email)
    `)
    .eq('type', 'withdrawal')
    .eq('status', 'pending')
    .order('withdrawal_request_date', { ascending: true });

  if (error) {
    console.error('Error fetching pending withdrawals:', error);
    return [];
  }

  return data || [];
}

export async function getEarningsByStatus(status: 'pending' | 'approved' | 'paid') {
  const { data, error } = await supabase
    .from('teacher_earnings')
    .select(`
      *,
      teacher:teachers(id, full_name, phone_number, email),
      enrollment:enrollments(
        id,
        course:courses(id, name)
      )
    `)
    .eq('status', status)
    .neq('type', 'withdrawal')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching earnings by status:', error);
    return [];
  }

  return data || [];
}
