import { supabaseAdmin as supabase } from '~/lib/supabase.server';

export async function createNotification(
  userId: string,
  userType: 'student' | 'teacher' | 'admin',
  notificationData: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    actionUrl?: string;
  }
) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      user_type: userType,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      action_url: notificationData.actionUrl,
      is_read: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function getUserNotifications(
  userId: string,
  userType: 'student' | 'teacher' | 'admin',
  unreadOnly: boolean = false
) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('user_type', userType);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function markAllNotificationsAsRead(
  userId: string,
  userType: 'student' | 'teacher' | 'admin'
) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('user_type', userType)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteNotification(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getUnreadCount(
  userId: string,
  userType: 'student' | 'teacher' | 'admin'
) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('user_type', userType)
    .eq('is_read', false);

  if (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }

  return count || 0;
}

// Bulk notification creation (for admin broadcasts)
export async function createBulkNotifications(
  userIds: string[],
  userType: 'student' | 'teacher' | 'admin',
  notificationData: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    actionUrl?: string;
  }
) {
  const notifications = userIds.map(userId => ({
    user_id: userId,
    user_type: userType,
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type,
    action_url: notificationData.actionUrl,
    is_read: false
  }));

  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications)
    .select();

  if (error) {
    console.error('Error creating bulk notifications:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
