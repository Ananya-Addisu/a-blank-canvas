import { supabase } from '~/lib/supabase.client';

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

export async function getTutorialVideos(audience: 'student' | 'teacher' | 'all' = 'student'): Promise<TutorialVideo[]> {
  const { data, error } = await supabase.from('tutorial_videos').select('*').eq('is_active', true).or(`target_audience.eq.${audience},target_audience.eq.all`).order('display_order', { ascending: true });
  if (error) return [];
  return data || [];
}

export async function getTutorialVideo(videoId: string): Promise<TutorialVideo | null> {
  const { data, error } = await supabase.from('tutorial_videos').select('*').eq('id', videoId).single();
  if (error) return null;
  return data;
}

export async function createTutorialVideo(videoData: { title: string; description?: string; video_url: string; thumbnail_url?: string; duration?: number; target_audience: 'student' | 'teacher' | 'all'; display_order?: number; }, adminId: string): Promise<{ success: boolean; video?: TutorialVideo; error?: string }> {
  const { data, error } = await supabase.from('tutorial_videos').insert({ ...videoData, uploaded_by: adminId, is_active: true }).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, video: data };
}

export async function updateTutorialVideo(videoId: string, updates: Partial<{ title: string; description: string; video_url: string; thumbnail_url: string; duration: number; target_audience: 'student' | 'teacher' | 'all'; display_order: number; is_active: boolean; }>): Promise<{ success: boolean; video?: TutorialVideo; error?: string }> {
  const { data, error } = await supabase.from('tutorial_videos').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', videoId).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, video: data };
}

export async function deleteTutorialVideo(videoId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('tutorial_videos').delete().eq('id', videoId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getAllTutorialVideosForAdmin(): Promise<TutorialVideo[]> {
  const { data, error } = await supabase.from('tutorial_videos').select('*').order('display_order', { ascending: true });
  if (error) return [];
  return data || [];
}
