import { supabaseAdmin as supabase } from '~/lib/supabase.server';
import { validateAndFormatYouTubeUrl } from '~/utils/youtube';

export async function getLibraryCategories() {
  const { data, error } = await supabase
    .from('library_items')
    .select('*')
    .eq('status', 'active')
    .order('name');

  if (error) {
    console.error('Error fetching library categories:', error);
    return [];
  }

  return data || [];
}

export async function getLibraryContent(filters?: {
  categoryId?: string;
  contentType?: 'book' | 'exam' | 'video';
  subject?: string;
  searchQuery?: string;
}) {
  let query = supabase
    .from('library_content')
    .select(`
      *,
      category:library_items(id, name, icon)
    `)
    .eq('approval_status', 'approved');

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters?.contentType) {
    query = query.eq('content_type', filters.contentType);
  }

  if (filters?.subject) {
    query = query.eq('subject', filters.subject);
  }

  if (filters?.searchQuery) {
    query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching library content:', error);
    return [];
  }

  return data || [];
}

export async function getLibraryContentById(contentId: string) {
  const { data, error } = await supabase
    .from('library_content')
    .select(`
      *,
      category:library_items(id, name, icon)
    `)
    .eq('id', contentId)
    .single();

  if (error) {
    console.error('Error fetching library content:', error);
    return null;
  }

  return data;
}

export async function incrementDownloadCount(contentId: string) {
  // Get current count
  const { data: content } = await supabase
    .from('library_content')
    .select('download_count')
    .eq('id', contentId)
    .single();

  if (!content) return;

  // Increment
  await supabase
    .from('library_content')
    .update({ download_count: (content.download_count || 0) + 1 })
    .eq('id', contentId);
}

export async function createLibraryContent(contentData: {
  categoryId: string;
  title: string;
  description: string;
  contentType: 'book' | 'exam' | 'video';
  subject: string;
  author?: string;
  fileUrl?: string;
  youtubeUrl?: string;
  videoSource?: 'upload' | 'youtube';
  thumbnailUrl?: string;
  fileSize?: number;
  pageCount?: number;
  duration?: number;
  requiresEnrollment?: boolean;
}) {
  // Validate YouTube URL if provided
  let youtubeData: any = null;
  if (contentData.videoSource === 'youtube' && contentData.youtubeUrl) {
    const validation = validateAndFormatYouTubeUrl(contentData.youtubeUrl);
    if (!validation.isValid) {
      return { success: false, error: validation.error || 'Invalid YouTube URL' };
    }
    youtubeData = validation;
  }

  const { data, error } = await supabase
    .from('library_content')
    .insert({
      category_id: contentData.categoryId,
      title: contentData.title,
      description: contentData.description,
      content_type: contentData.contentType,
      subject: contentData.subject,
      author: contentData.author,
      file_url: contentData.videoSource === 'upload' ? contentData.fileUrl : (youtubeData?.embedUrl || contentData.fileUrl || ''),
      youtube_url: youtubeData?.embedUrl || null,
      video_source: contentData.videoSource || 'upload',
      thumbnail_url: contentData.thumbnailUrl || youtubeData?.thumbnailUrl,
      file_size: contentData.fileSize,
      page_count: contentData.pageCount,
      duration: contentData.duration,
      requires_enrollment: contentData.requiresEnrollment || false,
      approval_status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating library content:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateLibraryContent(
  contentId: string,
  contentData: Partial<{
    title: string;
    description: string;
    subject: string;
    author: string;
    fileUrl: string;
    youtubeUrl: string;
    videoSource: 'upload' | 'youtube';
    thumbnailUrl: string;
    requiresEnrollment: boolean;
  }>
) {
  const updateData: any = {};
  if (contentData.title) updateData.title = contentData.title;
  if (contentData.description !== undefined) updateData.description = contentData.description;
  if (contentData.subject) updateData.subject = contentData.subject;
  if (contentData.author !== undefined) updateData.author = contentData.author;
  
  // Handle YouTube URL update
  if (contentData.videoSource === 'youtube' && contentData.youtubeUrl) {
    const validation = validateAndFormatYouTubeUrl(contentData.youtubeUrl);
    if (!validation.isValid) {
      return { success: false, error: validation.error || 'Invalid YouTube URL' };
    }
    updateData.youtube_url = validation.embedUrl;
    updateData.video_source = 'youtube';
    updateData.file_url = validation.embedUrl;
    if (!contentData.thumbnailUrl && validation.thumbnailUrl) {
      updateData.thumbnail_url = validation.thumbnailUrl;
    }
    updateData.approval_status = 'pending';
  } else if (contentData.fileUrl) {
    updateData.file_url = contentData.fileUrl;
    updateData.video_source = 'upload';
    updateData.youtube_url = null;
    updateData.approval_status = 'pending';
  }
  
  if (contentData.thumbnailUrl !== undefined) updateData.thumbnail_url = contentData.thumbnailUrl;
  if (contentData.requiresEnrollment !== undefined) {
    updateData.requires_enrollment = contentData.requiresEnrollment;
  }

  const { data, error } = await supabase
    .from('library_content')
    .update(updateData)
    .eq('id', contentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating library content:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteLibraryContent(contentId: string) {
  const { error } = await supabase
    .from('library_content')
    .delete()
    .eq('id', contentId);

  if (error) {
    console.error('Error deleting library content:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getLibrarySubjects() {
  const { data, error } = await supabase
    .from('library_content')
    .select('subject')
    .order('subject');

  if (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }

  // Get unique subjects
  const subjects = [...new Set(data?.map(item => item.subject) || [])];
  return subjects;
}
