// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeStoragePath(contentUrl: string | null) {
  if (!contentUrl) return null;

  if (!contentUrl.startsWith("http")) {
    return contentUrl
      .replace(/^\/+/, "")
      .replace(/^course-videos\//, "");
  }

  try {
    const url = new URL(contentUrl);
    const markers = [
      "/storage/v1/object/public/course-videos/",
      "/storage/v1/object/sign/course-videos/",
      "/storage/v1/object/authenticated/course-videos/",
      "/storage/v1/object/course-videos/",
    ];

    for (const marker of markers) {
      const markerIndex = url.pathname.indexOf(marker);
      if (markerIndex !== -1) {
        return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
      }
    }

    const bucketIndex = url.pathname.indexOf("/course-videos/");
    if (bucketIndex !== -1) {
      return decodeURIComponent(url.pathname.slice(bucketIndex + "/course-videos/".length));
    }
  } catch {
    // Fall through to null below.
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let lessonId: string | null = null;
    let libraryContentId: string | null = null;
    let studentId: string | null = null;

    if (req.method !== "GET") {
      const body = await req.json().catch(() => null);
      lessonId = body?.lessonId ?? null;
      libraryContentId = body?.libraryContentId ?? null;
      studentId = body?.studentId ?? null;
    }

    const url = new URL(req.url);
    lessonId = lessonId || url.searchParams.get("lessonId");
    libraryContentId = libraryContentId || url.searchParams.get("libraryContentId");
    studentId = studentId || url.searchParams.get("studentId");

    if (!lessonId && !libraryContentId) {
      return new Response(
        JSON.stringify({ error: "Missing lessonId or libraryContentId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let storagePath: string | null = null;

    const verifyEnrollmentAccess = async (courseId: string) => {
      if (!studentId || !UUID_PATTERN.test(studentId)) {
        return false;
      }

      const { data: directEnrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", studentId)
        .eq("course_id", courseId)
        .eq("status", "approved")
        .maybeSingle();

      if (directEnrollment) {
        return true;
      }

      const { data: bundleEnrollments } = await supabase
        .from("enrollments")
        .select("bundle_id")
        .eq("student_id", studentId)
        .eq("status", "approved")
        .not("bundle_id", "is", null);

      if (!bundleEnrollments?.length) {
        return false;
      }

      for (const enrollment of bundleEnrollments) {
        const { data: bundleCourse } = await supabase
          .from("bundle_courses")
          .select("id")
          .eq("bundle_id", enrollment.bundle_id)
          .eq("course_id", courseId)
          .maybeSingle();

        if (bundleCourse) {
          return true;
        }
      }

      return false;
    };

    if (lessonId) {
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select("id, content_url, video_source, chapter_id, is_preview")
        .eq("id", lessonId)
        .single();

      if (lessonError || !lesson) {
        return new Response(
          JSON.stringify({ error: "Lesson not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const uploadedVideo = !lesson.video_source || lesson.video_source === "upload" || lesson.video_source === "supabase";
      if (!uploadedVideo) {
        return new Response(
          JSON.stringify({ error: "Not an uploaded video" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      storagePath = normalizeStoragePath(lesson.content_url);
      if (!storagePath) {
        return new Response(
          JSON.stringify({ error: "Invalid video path" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: chapter } = await supabase
        .from("chapters")
        .select("course_id")
        .eq("id", lesson.chapter_id)
        .single();

      if (!chapter) {
        return new Response(
          JSON.stringify({ error: "Chapter not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!lesson.is_preview) {
        const hasAccess = await verifyEnrollmentAccess(chapter.course_id);
        if (!hasAccess) {
          return new Response(
            JSON.stringify({ error: "Access denied - no enrollment" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    } else if (libraryContentId) {
      const { data: libraryContent, error: libraryError } = await supabase
        .from("library_content")
        .select("id, file_url, video_source, course_id, requires_enrollment")
        .eq("id", libraryContentId)
        .single();

      if (libraryError || !libraryContent) {
        return new Response(
          JSON.stringify({ error: "Library content not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const uploadedVideo = !libraryContent.video_source || libraryContent.video_source === "upload" || libraryContent.video_source === "supabase";
      if (!uploadedVideo) {
        return new Response(
          JSON.stringify({ error: "Not an uploaded video" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      storagePath = normalizeStoragePath(libraryContent.file_url);
      if (!storagePath) {
        return new Response(
          JSON.stringify({ error: "Invalid video path" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (libraryContent.course_id || libraryContent.requires_enrollment) {
        if (!libraryContent.course_id) {
          return new Response(
            JSON.stringify({ error: "Access denied - missing linked course" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const hasAccess = await verifyEnrollmentAccess(libraryContent.course_id);
        if (!hasAccess) {
          return new Response(
            JSON.stringify({ error: "Access denied - no enrollment" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    if (!storagePath) {
      return new Response(
        JSON.stringify({ error: "Invalid video path" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a signed URL with 5 minute expiry
    const { data: signedData, error: signedError } = await supabase.storage
      .from("course-videos")
      .createSignedUrl(storagePath, 300); // 5 minutes

    if (signedError || !signedData) {
      return new Response(
        JSON.stringify({ error: "Failed to generate signed URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        signedUrl: signedData.signedUrl,
        expiresIn: 300,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("serve-video error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});