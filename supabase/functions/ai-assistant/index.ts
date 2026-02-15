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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, messages, emailContent, tone, emails, draftText } = body;

    let systemPrompt = "";
    let userContent = "";
    let stream = false;

    switch (action) {
      case "chat":
        systemPrompt = "Ti je MailMind AI, një asistent i dobishëm emaili. Ndihmon përdoruesit të menaxhojnë inbox-in, të hartojnë përgjigje, të përmbledhin thread-et dhe të përgjigjen pyetjeve rreth emaileve. Përgjigju gjithmonë në gjuhën shqipe. Jep përgjigje të qarta, koncize dhe të zbatueshme.";
        stream = true;
        break;

      case "parse":
        systemPrompt = "You are an email parser. Extract key information from the email provided. Return a JSON object with these fields: sender (string), intent (string - e.g. Request, Information, Action Required, Follow-up), key_dates (array of strings), action_items (array of strings), sentiment (string - Positive, Neutral, Negative), priority (string - High, Medium, Low). Only return valid JSON, no other text.";
        userContent = emailContent;
        break;

      case "reply":
        systemPrompt = `You are a professional email reply generator. Generate a reply to the email provided. Use a ${tone || "Professional"} tone. Write the reply directly without subject line or greeting format - just the reply text. Keep it concise and natural.`;
        userContent = emailContent;
        break;

      case "summarize":
        systemPrompt = "You are an email thread summarizer. Summarize the email threads provided. For each thread, provide: thread_title (string), email_count (number), summary (string - 2-3 sentences), action_items (array of strings). Return a JSON array of these objects. Only return valid JSON, no other text.";
        userContent = JSON.stringify(emails);
        break;

      case "proofread":
        systemPrompt = `You are an expert email proofreader. Analyze the provided email draft for grammar errors, clarity, tone, sentence structure, and language consistency. Return a JSON object with: { "issues": [ { "original": "exact text with issue", "suggestion": "corrected text", "explanation": "why this change improves the text" } ], "corrected_text": "the full corrected version of the text" }. Only return valid JSON, no other text.`;
        userContent = draftText;
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const aiMessages = action === "chat"
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        stream,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
