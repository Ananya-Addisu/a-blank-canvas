// @ts-ignore: Deno runtime import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("cf-connecting-ip") || "";

    if (!clientIp) {
      return new Response(
        JSON.stringify({ vpn: false, blocked: false, reason: "no_ip" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use ipwho.is (HTTPS, free-tier, includes proxy/VPN signals + country)
    const res = await fetch(`https://ipwho.is/${clientIp}?security=1`);
    const data = await res.json();

    // ipwho.is returns { success: false, message: "..." } on failure
    if (!data || data.success === false) {
      return new Response(
        JSON.stringify({ vpn: false, blocked: false, reason: "lookup_failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const security = data.security || {};
    const isVpn =
      security.vpn === true ||
      security.proxy === true ||
      security.tor === true ||
      security.hosting === true;

    const countryCode = data.country_code || "";
    const isEthiopia = countryCode === "ET";

    // Block if VPN/proxy OR not in Ethiopia
    const shouldBlock = isVpn || !isEthiopia;

    return new Response(
      JSON.stringify({
        vpn: isVpn,
        blocked: shouldBlock,
        country: countryCode,
        countryName: data.country || "",
        ip: data.ip || clientIp,
        org: data.connection?.org || data.connection?.isp || "",
        reason: isVpn ? "vpn_detected" : !isEthiopia ? "outside_ethiopia" : "none",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("VPN check error:", error);
    // Fail open — don't block if the check fails
    return new Response(
      JSON.stringify({ vpn: false, blocked: false, reason: "check_failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
