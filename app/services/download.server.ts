import { supabase } from '~/lib/supabase.server';

export async function trackDownload(
  userId: string,
  userType: 'student' | 'teacher',
  contentId: string,
  contentType: 'video' | 'pdf' | 'document',
  filePath: string,
  fileSize: number
) {
  const { data, error } = await supabase
    .from('user_downloads')
    .insert({
      user_id: userId,
      user_type: userType,
      content_id: contentId,
      content_type: contentType,
      file_path: filePath,
      file_size: fileSize,
      encrypted: true,
      downloaded_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error tracking download:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function getUserDownloads(
  userId: string,
  userType: 'student' | 'teacher'
) {
  const { data, error } = await supabase
    .from('user_downloads')
    .select('*')
    .eq('user_id', userId)
    .eq('user_type', userType)
    .eq('is_deleted', false)
    .order('downloaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching downloads:', error);
    return { success: false, data: [] };
  }

  // Calculate total storage used
  const totalStorage = data?.reduce((sum, item) => sum + (item.file_size || 0), 0) || 0;

  return { 
    success: true, 
    data: data || [],
    totalStorage,
    downloadCount: data?.length || 0
  };
}

export async function deleteDownload(downloadId: string, userId: string) {
  // Soft delete - mark as deleted
  const { error } = await supabase
    .from('user_downloads')
    .update({ is_deleted: true })
    .eq('id', downloadId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting download:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateLastAccessed(downloadId: string) {
  const { error } = await supabase
    .from('user_downloads')
    .update({ last_accessed: new Date().toISOString() })
    .eq('id', downloadId);

  if (error) {
    console.error('Error updating last accessed:', error);
  }
}

export async function getDownloadById(downloadId: string, userId: string) {
  const { data, error } = await supabase
    .from('user_downloads')
    .select('*')
    .eq('id', downloadId)
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .single();

  if (error) {
    console.error('Error fetching download:', error);
    return null;
  }

  // Update last accessed
  await updateLastAccessed(downloadId);

  return data;
}

export async function clearAllDownloads(userId: string, userType: 'student' | 'teacher') {
  const { error } = await supabase
    .from('user_downloads')
    .update({ is_deleted: true })
    .eq('user_id', userId)
    .eq('user_type', userType);

  if (error) {
    console.error('Error clearing downloads:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
