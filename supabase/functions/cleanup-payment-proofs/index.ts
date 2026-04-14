// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find payment submissions approved/rejected more than 3 days ago that still have screenshot URLs
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    const { data: submissions, error: fetchError } = await supabase
      .from("payment_submissions")
      .select("id, screenshot_urls")
      .in("status", ["approved", "rejected"])
      .lt("reviewed_at", threeDaysAgo)
      .not("screenshot_urls", "eq", "{}");

    if (fetchError) {
      throw new Error(`Failed to fetch submissions: ${fetchError.message}`);
    }

    let deletedCount = 0;

    for (const submission of submissions || []) {
      if (!submission.screenshot_urls || submission.screenshot_urls.length === 0) continue;

      // Delete files from storage bucket
      for (const url of submission.screenshot_urls) {
        if (!url) continue;
        // Extract file path from the URL (after /payment-proofs/)
        const match = url.match(/payment-proofs\/(.+)$/);
        if (match) {
          await supabase.storage.from("payment-proofs").remove([match[1]]);
        }
      }

      // Clear the screenshot_urls array in the database
      await supabase
        .from("payment_submissions")
        .update({ screenshot_urls: [] })
        .eq("id", submission.id);

      deletedCount++;
    }

    return new Response(
      JSON.stringify({ success: true, cleaned: deletedCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
