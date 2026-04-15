import { supabase } from '~/lib/supabase.client';

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'mark_read') {
    const notificationId = formData.get('notificationId') as string;
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  if (intent === 'mark_all_read') {
    const userId = formData.get('userId') as string;
    const userType = formData.get('userType') as string;
    if (userId && userType) {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('user_type', userType).eq('is_read', false);
      if (error) return { success: false, error: error.message };
    }
    return { success: true };
  }

  if (intent === 'delete') {
    const notificationId = formData.get('notificationId') as string;
    const { error } = await supabase.from('notifications').delete().eq('id', notificationId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  return { success: false, error: 'Unknown intent' };
}

export default function ApiNotifications() {
  return null;
}
