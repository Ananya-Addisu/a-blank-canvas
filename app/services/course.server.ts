import { supabaseAdmin as supabase } from '~/lib/supabase.server';
import { validateAndFormatYouTubeUrl } from '~/utils/youtube';

export async function getAllCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      teacher:teachers(id, full_name, specialization),
      bundle_courses(
        bundle:bundles(
          id,
          name,
          year_level,
          semester
        )
      )
    `)
    .eq('status', 'active')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }

  return (data || []).map(course => {
    // Get the first bundle (a course might be in multiple bundles)
    const firstBundle = course.bundle_courses?.[0]?.bundle;
    
    return {
      ...course,
      bundle_name: firstBundle?.name || 'Other',
      year_level: firstBundle?.year_level,
      semester: firstBundle?.semester,
      originalPrice: Number(course.price),
      discountedPrice: calculateDiscountedPrice(Number(course.price), course.discount_percentage || 0),
      hasDiscount: (course.discount_percentage || 0) > 0
    };
  });
}

export async function getCourseById(courseId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      teacher:teachers(id, full_name, email, specialization, bio),
      chapters:chapters(
        id,
        title,
        description,
        order_index,
        is_published,
        lessons:lessons(
          id,
          title,
          description,
          lesson_type,
          content_url,
          youtube_url,
          video_source,
          download_url,
          is_downloadable,
          duration,
          page_count,
          order_index,
          is_published,
          is_preview,
          approval_status
        )
      )
    `)
    .eq('id', courseId)
    .single();

  if (error) {
    console.error('Error fetching course:', error);
    return null;
  }

  // Sort chapters and lessons by order_index
  if (data?.chapters) {
    data.chapters.sort((a: any, b: any) => a.order_index - b.order_index);
    data.chapters.forEach((chapter: any) => {
      if (chapter.lessons) {
        // Filter out unapproved lessons for students
        chapter.lessons = chapter.lessons.filter((lesson: any) => 
          lesson.approval_status === 'approved' || lesson.is_preview
        );
        chapter.lessons.sort((a: any, b: any) => a.order_index - b.order_index);
      }
    });
  }

  // Add discount calculations
  return {
    ...data,
    originalPrice: Number(data.price),
    discountedPrice: calculateDiscountedPrice(Number(data.price), data.discount_percentage || 0),
    hasDiscount: (data.discount_percentage || 0) > 0,
    savings: Number(data.price) - calculateDiscountedPrice(Number(data.price), data.discount_percentage || 0)
  };
}

export async function getCoursesByTeacher(teacherId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      chapters:chapters(id),
      enrollments:enrollments(id, student_id)
    `)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching teacher courses:', error);
    return [];
  }

  // Add computed fields
  return (data || []).map(course => ({
    ...course,
    chapter_count: course.chapters?.length || 0,
    student_count: course.enrollments?.length || 0,
    originalPrice: Number(course.price),
    discountedPrice: calculateDiscountedPrice(Number(course.price), course.discount_percentage || 0),
    hasDiscount: (course.discount_percentage || 0) > 0
  }));
}

export async function createCourse(teacherId: string, courseData: {
  name: string;
  description: string;
  category: string;
  department: string;
  price: number;
  discountPercentage?: number;
  thumbnailUrl?: string;
  syllabus?: string;
}) {
  const { data, error } = await supabase
    .from('courses')
    .insert({
      teacher_id: teacherId,
      name: courseData.name,
      description: courseData.description,
      category: courseData.category,
      department: courseData.department,
      price: courseData.price,
      discount_percentage: courseData.discountPercentage || 0,
      thumbnail_url: courseData.thumbnailUrl,
      syllabus: courseData.syllabus,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating course:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateCourse(courseId: string, courseData: Partial<{
  name: string;
  description: string;
  category: string;
  department: string;
  price: number;
  discountPercentage: number;
  thumbnailUrl: string;
  syllabus: string;
  status: string;
}>) {
  const updateData: any = {};
  if (courseData.name) updateData.name = courseData.name;
  if (courseData.description) updateData.description = courseData.description;
  if (courseData.category) updateData.category = courseData.category;
  if (courseData.department) updateData.department = courseData.department;
  if (courseData.price !== undefined) updateData.price = courseData.price;
  if (courseData.discountPercentage !== undefined) updateData.discount_percentage = courseData.discountPercentage;
  if (courseData.thumbnailUrl) updateData.thumbnail_url = courseData.thumbnailUrl;
  if (courseData.syllabus) updateData.syllabus = courseData.syllabus;
  if (courseData.status) updateData.status = courseData.status;

  const { data, error } = await supabase
    .from('courses')
    .update(updateData)
    .eq('id', courseId)
    .select()
    .single();

  if (error) {
    console.error('Error updating course:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteCourse(courseId: string) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) {
    console.error('Error deleting course:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Chapter management
export async function createChapter(courseId: string, chapterData: {
  title: string;
  description?: string;
  orderIndex: number;
}) {
  const { data, error } = await supabase
    .from('chapters')
    .insert({
      course_id: courseId,
      title: chapterData.title,
      description: chapterData.description,
      order_index: chapterData.orderIndex,
      is_published: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chapter:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateChapter(chapterId: string, chapterData: Partial<{
  title: string;
  description: string;
  orderIndex: number;
  isPublished: boolean;
}>) {
  const updateData: any = {};
  if (chapterData.title) updateData.title = chapterData.title;
  if (chapterData.description !== undefined) updateData.description = chapterData.description;
  if (chapterData.orderIndex !== undefined) updateData.order_index = chapterData.orderIndex;
  if (chapterData.isPublished !== undefined) updateData.is_published = chapterData.isPublished;

  const { data, error } = await supabase
    .from('chapters')
    .update(updateData)
    .eq('id', chapterId)
    .select()
    .single();

  if (error) {
    console.error('Error updating chapter:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteChapter(chapterId: string) {
  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', chapterId);

  if (error) {
    console.error('Error deleting chapter:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Lesson management
export async function createLesson(chapterId: string, lessonData: {
  title: string;
  description?: string;
  lessonType: 'video' | 'pdf' | 'quiz';
  contentUrl?: string;
  youtubeUrl?: string;
  videoSource?: 'upload' | 'youtube';
  duration?: number;
  pageCount?: number;
  orderIndex: number;
  isPreview?: boolean;
}) {
  // Validate YouTube URL if provided
  let youtubeData: any = null;
  if (lessonData.videoSource === 'youtube' && lessonData.youtubeUrl) {
    const validation = validateAndFormatYouTubeUrl(lessonData.youtubeUrl);
    if (!validation.isValid) {
      return { success: false, error: validation.error || 'Invalid YouTube URL' };
    }
    youtubeData = validation;
  }

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      chapter_id: chapterId,
      title: lessonData.title,
      description: lessonData.description,
      lesson_type: lessonData.lessonType,
      content_url: lessonData.videoSource === 'upload' ? lessonData.contentUrl : null,
      youtube_url: youtubeData?.embedUrl || null,
      video_source: lessonData.videoSource || 'upload',
      duration: lessonData.duration,
      page_count: lessonData.pageCount,
      order_index: lessonData.orderIndex,
      is_preview: lessonData.isPreview || false,
      is_published: false,
      approval_status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating lesson:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateLesson(lessonId: string, lessonData: Partial<{
  title: string;
  description: string;
  contentUrl: string;
  youtubeUrl: string;
  videoSource: 'upload' | 'youtube';
  duration: number;
  pageCount: number;
  orderIndex: number;
  isPublished: boolean;
  isPreview: boolean;
}>) {
  const updateData: any = {};
  if (lessonData.title) updateData.title = lessonData.title;
  if (lessonData.description !== undefined) updateData.description = lessonData.description;
  
  // Handle YouTube URL update
  if (lessonData.videoSource === 'youtube' && lessonData.youtubeUrl) {
    const validation = validateAndFormatYouTubeUrl(lessonData.youtubeUrl);
    if (!validation.isValid) {
      return { success: false, error: validation.error || 'Invalid YouTube URL' };
    }
    updateData.youtube_url = validation.embedUrl;
    updateData.video_source = 'youtube';
    updateData.content_url = null;
    updateData.approval_status = 'pending';
  } else if (lessonData.contentUrl) {
    updateData.content_url = lessonData.contentUrl;
    updateData.video_source = 'upload';
    updateData.youtube_url = null;
    updateData.approval_status = 'pending';
  }
  
  if (lessonData.duration !== undefined) updateData.duration = lessonData.duration;
  if (lessonData.pageCount !== undefined) updateData.page_count = lessonData.pageCount;
  if (lessonData.orderIndex !== undefined) updateData.order_index = lessonData.orderIndex;
  if (lessonData.isPublished !== undefined) updateData.is_published = lessonData.isPublished;
  if (lessonData.isPreview !== undefined) updateData.is_preview = lessonData.isPreview;

  const { data, error } = await supabase
    .from('lessons')
    .update(updateData)
    .eq('id', lessonId)
    .select()
    .single();

  if (error) {
    console.error('Error updating lesson:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteLesson(lessonId: string) {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) {
    console.error('Error deleting lesson:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Helper function to calculate discounted price
function calculateDiscountedPrice(price: number, discountPercentage: number): number {
  if (!discountPercentage || discountPercentage <= 0) return price;
  return Math.round(price * (1 - discountPercentage / 100));
}
