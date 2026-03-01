import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const normalizePrivacy = (value?: string | null) => {
  const normalized = (value || "public").toLowerCase();
  if (normalized === "hidden" || normalized === "private") return "hidden";
  if (normalized === "link_only" || normalized === "unlisted") return "link_only";
  return "public";
};

const extractStoragePath = (value?: string | null) => {
  if (!value) return null;
  if (!value.startsWith("http")) return value;

  const marker = "/cvs/";
  const markerIndex = value.indexOf(marker);
  if (markerIndex === -1) return null;

  return decodeURIComponent(value.slice(markerIndex + marker.length));
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Backend secrets are not configured");
    }

    const url = new URL(req.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const username = segments[segments.length - 1]?.toLowerCase();

    if (!username) {
      return new Response(JSON.stringify({ error: "Username is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: profile, error } = await admin
      .from("job_seeker_profiles")
      .select("username, full_name, privacy, allow_cv_download, cv_file_url")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile || normalizePrivacy(profile.privacy) === "hidden") {
      return new Response(JSON.stringify({ error: "الملف غير متاح" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (profile.allow_cv_download !== true) {
      return new Response(JSON.stringify({ error: "تنزيل السيرة غير متاح لهذا الملف" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const path = extractStoragePath(profile.cv_file_url);
    if (!path) {
      return new Response(JSON.stringify({ error: "لا يوجد ملف سيرة متاح للتنزيل" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: signed, error: signError } = await admin.storage
      .from("cvs")
      .createSignedUrl(path, 90, {
        download: `${(profile.full_name || username).trim()}-kawader-cv.pdf`,
      });

    if (signError || !signed?.signedUrl) {
      return new Response(JSON.stringify({ error: "تعذر إنشاء رابط تنزيل آمن" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: signed.signedUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("api-cv-download error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
