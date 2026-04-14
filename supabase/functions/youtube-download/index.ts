// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY is not configured');
    }

    const { videoUrl, format = 'mp3', audioQuality = '128' } = await req.json();

    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: 'videoUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const params = new URLSearchParams({
      format,
      add_info: '0',
      url: videoUrl,
      audio_quality: audioQuality,
      allow_extended_duration: 'false',
      no_merge: 'false',
      audio_language: 'en',
    });

    const response = await fetch(
      `https://youtube-info-download-api.p.rapidapi.com/ajax/download.php?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'youtube-info-download-api.p.rapidapi.com',
          'x-rapidapi-key': RAPIDAPI_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`RapidAPI call failed [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({
      success: true,
      progressUrl: data.progress_url || null,
      title: data.title || data.info?.title || null,
      downloadUrl: data.download_url || data.downloadUrl || data.link || null,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('YouTube download error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
