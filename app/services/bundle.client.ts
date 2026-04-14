import { supabase } from '~/lib/supabase.client';

export async function getAllBundles() {
  const { data, error } = await supabase.from('bundles').select('*, bundle_courses:bundle_courses(course:courses(id, name, description, category, thumbnail_url, teacher:teachers(id, full_name)))').eq('is_active', true).order('year_level').order('semester');
  if (error) { console.error('Error fetching bundles:', error); return []; }
  return (data || []).map(bundle => ({ ...bundle, courses: bundle.bundle_courses?.map((bc: any) => bc.course) || [], course_count: bundle.bundle_courses?.length || 0 }));
}

export async function getBundleById(bundleId: string) {
  const { data, error } = await supabase.from('bundles').select('*, bundle_courses:bundle_courses(course:courses(id, name, description, category, department, price, thumbnail_url, syllabus, teacher:teachers(id, full_name, specialization), chapters:chapters(id, title, description, order_index, lessons:lessons(id, title, lesson_type))))').eq('id', bundleId).single();
  if (error) { console.error('Error fetching bundle:', error); return null; }
  const courses = data.bundle_courses?.map((bc: any) => bc.course) || [];
  const totalLessons = courses.reduce((sum: number, course: any) => { const lc = course.chapters?.reduce((cs: number, ch: any) => cs + (ch.lessons?.length || 0), 0) || 0; return sum + lc; }, 0);
  return { ...data, courses, course_count: courses.length, total_lessons: totalLessons };
}

export async function createBundle(bundleData: { name: string; description: string; semester: string; yearLevel: string; price: number; discountPercentage?: number; thumbnailUrl?: string; courseIds: string[]; }) {
  const { data: bundle, error: bundleError } = await supabase.from('bundles').insert({ name: bundleData.name, description: bundleData.description, semester: bundleData.semester, year_level: bundleData.yearLevel, price: bundleData.price, discount_percentage: bundleData.discountPercentage || 0, thumbnail_url: bundleData.thumbnailUrl, is_active: true }).select().single();
  if (bundleError) return { success: false, error: bundleError.message };

  if (bundleData.courseIds?.length > 0) {
    const bundleCourses = bundleData.courseIds.map(courseId => ({ bundle_id: bundle.id, course_id: courseId }));
    const { error: coursesError } = await supabase.from('bundle_courses').insert(bundleCourses);
    if (coursesError) { await supabase.from('bundles').delete().eq('id', bundle.id); return { success: false, error: coursesError.message }; }
  }
  return { success: true, data: bundle };
}

export async function updateBundle(bundleId: string, bundleData: Partial<{ name: string; description: string; semester: string; yearLevel: string; price: number; discountPercentage: number; thumbnailUrl: string; isActive: boolean; courseIds: string[]; }>) {
  const updateData: any = {};
  if (bundleData.name) updateData.name = bundleData.name;
  if (bundleData.description) updateData.description = bundleData.description;
  if (bundleData.semester) updateData.semester = bundleData.semester;
  if (bundleData.yearLevel) updateData.year_level = bundleData.yearLevel;
  if (bundleData.price !== undefined) updateData.price = bundleData.price;
  if (bundleData.discountPercentage !== undefined) updateData.discount_percentage = bundleData.discountPercentage;
  if (bundleData.thumbnailUrl !== undefined) updateData.thumbnail_url = bundleData.thumbnailUrl;
  if (bundleData.isActive !== undefined) updateData.is_active = bundleData.isActive;

  const { data, error } = await supabase.from('bundles').update(updateData).eq('id', bundleId).select().single();
  if (error) return { success: false, error: error.message };

  if (bundleData.courseIds) {
    await supabase.from('bundle_courses').delete().eq('bundle_id', bundleId);
    if (bundleData.courseIds.length > 0) {
      await supabase.from('bundle_courses').insert(bundleData.courseIds.map(courseId => ({ bundle_id: bundleId, course_id: courseId })));
    }
  }
  return { success: true, data };
}

export async function deleteBundle(bundleId: string) {
  const { error } = await supabase.from('bundles').delete().eq('id', bundleId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function addCourseToBundle(bundleId: string, courseId: string) {
  const { data, error } = await supabase.from('bundle_courses').insert({ bundle_id: bundleId, course_id: courseId }).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function removeCourseFromBundle(bundleId: string, courseId: string) {
  const { error } = await supabase.from('bundle_courses').delete().eq('bundle_id', bundleId).eq('course_id', courseId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getBundlesBySemester(semester: string) {
  const { data, error } = await supabase.from('bundles').select('*, bundle_courses:bundle_courses(course:courses(id, name, thumbnail_url))').eq('semester', semester).eq('is_active', true).order('year_level');
  if (error) return [];
  return (data || []).map(bundle => ({ ...bundle, courses: bundle.bundle_courses?.map((bc: any) => bc.course) || [], course_count: bundle.bundle_courses?.length || 0 }));
}

export async function getBundlesByYearLevel(yearLevel: string) {
  const { data, error } = await supabase.from('bundles').select('*, bundle_courses:bundle_courses(course:courses(id, name, thumbnail_url))').eq('year_level', yearLevel).eq('is_active', true).order('semester');
  if (error) return [];
  return (data || []).map(bundle => ({ ...bundle, courses: bundle.bundle_courses?.map((bc: any) => bc.course) || [], course_count: bundle.bundle_courses?.length || 0 }));
}

export function calculateBundlePrice(bundle: any): { original: number; discounted: number; savings: number } {
  const originalPrice = Number(bundle.price || 0);
  const discountPercentage = Number(bundle.discount_percentage || 0);
  const discountedPrice = originalPrice * (1 - discountPercentage / 100);
  return { original: originalPrice, discounted: discountedPrice, savings: originalPrice - discountedPrice };
}
