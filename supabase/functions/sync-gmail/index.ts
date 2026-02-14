import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

    // Create client with user's token
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to read gmail_tokens (RLS blocks client access)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get provider token from user's identity
    const googleIdentity = user.identities?.find((i) => i.provider === "google");
    if (!googleIdentity) {
      return new Response(JSON.stringify({ error: "Google account not linked" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for existing refresh token
    const { data: tokenRow } = await supabaseAdmin
      .from("gmail_tokens")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    let accessToken: string | null = null;

    if (tokenRow) {
      // Check if token is expired
      const isExpired = tokenRow.token_expires_at
        ? new Date(tokenRow.token_expires_at) <= new Date()
        : true;

      if (isExpired && tokenRow.refresh_token) {
        // Refresh the access token
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: googleClientId,
            client_secret: googleClientSecret,
            refresh_token: tokenRow.refresh_token,
            grant_type: "refresh_token",
          }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          accessToken = tokenData.access_token;
          const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();
          await supabaseAdmin
            .from("gmail_tokens")
            .update({ access_token: accessToken, token_expires_at: expiresAt, updated_at: new Date().toISOString() })
            .eq("user_id", user.id);
        } else {
          console.error("Token refresh failed:", tokenData);
          return new Response(JSON.stringify({ error: "Failed to refresh Google token", details: tokenData }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        accessToken = tokenRow.access_token;
      }
    } else {
      // First time: get the provider token from session
      // The provider_token is available right after OAuth login
      const body = await req.json().catch(() => ({}));
      const providerToken = body.provider_token;
      const providerRefreshToken = body.provider_refresh_token;

      if (!providerToken) {
        return new Response(JSON.stringify({ error: "No Gmail token available. Please re-login with Google." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      accessToken = providerToken;

      // Store refresh token if available
      if (providerRefreshToken) {
        await supabaseAdmin.from("gmail_tokens").upsert({
          user_id: user.id,
          access_token: providerToken,
          refresh_token: providerRefreshToken,
          token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      }
    }

    if (!accessToken) {
      return new Response(JSON.stringify({ error: "No valid access token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch emails from Gmail API
    const gmailRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=in:inbox",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const gmailData = await gmailRes.json();

    if (!gmailData.messages || gmailData.messages.length === 0) {
      return new Response(JSON.stringify({ synced: 0, message: "No messages found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get existing gmail_ids to avoid duplicates
    const { data: existingEmails } = await supabaseAdmin
      .from("emails")
      .select("gmail_id")
      .eq("user_id", user.id)
      .in("gmail_id", gmailData.messages.map((m: any) => m.id));

    const existingIds = new Set((existingEmails || []).map((e: any) => e.gmail_id));
    const newMessages = gmailData.messages.filter((m: any) => !existingIds.has(m.id));

    let synced = 0;

    // Fetch full details for new messages (batch of 10)
    const batch = newMessages.slice(0, 10);
    for (const msg of batch) {
      try {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const detail = await detailRes.json();

        const headers = detail.payload?.headers || [];
        const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || null;

        const subject = getHeader("Subject");
        const from = getHeader("From");
        const to = getHeader("To");
        const snippet = detail.snippet || null;

        // Extract body
        let body = "";
        const extractText = (part: any): string => {
          if (part.mimeType === "text/plain" && part.body?.data) {
            return atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"));
          }
          if (part.parts) {
            for (const p of part.parts) {
              const text = extractText(p);
              if (text) return text;
            }
          }
          return "";
        };
        body = extractText(detail.payload) || snippet || "";

        const isRead = !detail.labelIds?.includes("UNREAD");

        await supabaseAdmin.from("emails").insert({
          user_id: user.id,
          gmail_id: msg.id,
          thread_id: detail.threadId || null,
          from_email: from,
          to_email: to,
          subject,
          snippet,
          body,
          is_read: isRead,
          is_starred: detail.labelIds?.includes("STARRED") || false,
          category: "uncategorized",
        });

        synced++;
      } catch (err) {
        console.error(`Failed to sync message ${msg.id}:`, err);
      }
    }

    return new Response(JSON.stringify({ synced, total: gmailData.messages.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
