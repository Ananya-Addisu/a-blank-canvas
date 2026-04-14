import { supabaseAdmin } from "~/lib/supabase.server";

export interface TutorialVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration: number | null;
  target_audience: 'student' | 'teacher' | 'all';
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get active tutorial videos for a specific audience
 */
export async function getTutorialVideos(
  request: Request,
  audience: 'student' | 'teacher' | 'all' = 'student'
): Promise<TutorialVideo[]> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from('tutorial_videos')
    .select('*')
    .eq('is_active', true)
    .or(`target_audience.eq.${audience},target_audience.eq.all`)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching tutorial videos:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single tutorial video by ID
 */
export async function getTutorialVideo(
  request: Request,
  videoId: string
): Promise<TutorialVideo | null> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from('tutorial_videos')
    .select('*')
    .eq('id', videoId)
    .single();

  if (error) {
    console.error('Error fetching tutorial video:', error);
    return null;
  }

  return data;
}

/**
 * Create a new tutorial video (Admin only)
 */
export async function createTutorialVideo(
  request: Request,
  videoData: {
    title: string;
    description?: string;
    video_url: string;
    thumbnail_url?: string;
    duration?: number;
    target_audience: 'student' | 'teacher' | 'all';
    display_order?: number;
  },
  adminId: string
): Promise<{ success: boolean; video?: TutorialVideo; error?: string }> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from('tutorial_videos')
    .insert({
      ...videoData,
      uploaded_by: adminId,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating tutorial video:', error);
    return { success: false, error: error.message };
  }

  return { success: true, video: data };
}

/**
 * Update tutorial video (Admin only)
 */
export async function updateTutorialVideo(
  request: Request,
  videoId: string,
  updates: Partial<{
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    duration: number;
    target_audience: 'student' | 'teacher' | 'all';
    display_order: number;
    is_active: boolean;
  }>
): Promise<{ success: boolean; video?: TutorialVideo; error?: string }> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from('tutorial_videos')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', videoId)
    .select()
    .single();

  if (error) {
    console.error('Error updating tutorial video:', error);
    return { success: false, error: error.message };
  }

  return { success: true, video: data };
}

/**
 * Delete tutorial video (Admin only)
 */
export async function deleteTutorialVideo(
  request: Request,
  videoId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = supabaseAdmin;

  const { error } = await supabase
    .from('tutorial_videos')
    .delete()
    .eq('id', videoId);

  if (error) {
    console.error('Error deleting tutorial video:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get all tutorial videos for admin management
 */
export async function getAllTutorialVideosForAdmin(
  request: Request
): Promise<TutorialVideo[]> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from('tutorial_videos')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching all tutorial videos:', error);
    return [];
  }

  return data || [];
}
