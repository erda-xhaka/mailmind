# 🔧 Detajet e Implementimit - MailMind

Ky dokument shpjegon aspektet teknike të implementimit të sistemit MailMind me shembuj konkretë të kodit.

---

## Përmbajtja

1. [Arkitektura e Frontend-it](#1-arkitektura-e-frontend-it)
2. [Integrimi me Supabase](#2-integrimi-me-supabase)
3. [Edge Functions](#3-edge-functions)
4. [AI Processing Pipeline](#4-ai-processing-pipeline)
5. [Gmail Integration](#5-gmail-integration)
6. [State Management](#6-state-management)
7. [Komponentët UI](#7-komponentët-ui)
8. [Siguria dhe RLS](#8-siguria-dhe-rls)

---

## 1. Arkitektura e Frontend-it

### 1.1 Struktura e Projektit

```
src/
├── components/
│   ├── dashboard/          # Faqet kryesore të dashboard-it
│   │   ├── InboxPage.tsx
│   │   ├── AIChatbotPage.tsx
│   │   ├── EmailParserPage.tsx
│   │   ├── ReplyGeneratorPage.tsx
│   │   ├── SummariesPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── DocumentsPage.tsx
│   │   └── DraftsPage.tsx
│   └── ui/                  # shadcn/ui components
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities
├── pages/                   # Route pages
└── integrations/
    └── supabase/            # Supabase client & types
```

### 1.2 Routing Configuration

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
```

### 1.3 Protected Route Pattern

```typescript
// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
      if (!session) navigate("/auth");
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        if (!session) navigate("/auth");
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return null;
  return <>{children}</>;
};
```

---

## 2. Integrimi me Supabase

### 2.1 Client Initialization

```typescript
// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

### 2.2 Database Operations

**Leximi i email-eve:**

```typescript
// Fetch emails for current user
const fetchEmails = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("emails")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};
```

**Ruajtja e draftit:**

```typescript
// Save AI-generated reply as draft
const saveDraft = async (replyData: {
  emailId: string;
  replyText: string;
  toEmail: string;
  subject: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("ai_replies")
    .insert({
      user_id: user?.id,
      email_id: replyData.emailId,
      reply_text: replyData.replyText,
      to_email: replyData.toEmail,
      subject: `Re: ${replyData.subject}`,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### 2.3 Real-time Subscriptions

```typescript
// Subscribe to new emails
useEffect(() => {
  const channel = supabase
    .channel("emails-changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "emails",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        setEmails((prev) => [payload.new as Email, ...prev]);
        toast.info("Email i ri u shtua!");
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [userId]);
```

---

## 3. Edge Functions

### 3.1 AI Assistant Function

```typescript
// supabase/functions/ai-assistant/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, ...",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, messages, emailContent, tone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    let systemPrompt = "";
    let stream = false;

    switch (action) {
      case "chat":
        systemPrompt = "Ti je MailMind AI, një asistent emaili...";
        stream = true;
        break;
      case "parse":
        systemPrompt = "Extract key information from email...";
        break;
      case "reply":
        systemPrompt = `Generate a ${tone} reply...`;
        break;
      // ... other actions
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...],
        stream,
      }),
    });

    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ result: data.choices[0].message.content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

### 3.2 Gmail Sync Function

```typescript
// supabase/functions/sync-gmail/index.ts
Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Get user's Gmail token
  const { data: tokenData } = await supabase
    .from("gmail_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Refresh token if expired
  if (new Date(tokenData.token_expires_at) < new Date()) {
    const newTokens = await refreshGoogleToken(tokenData.refresh_token);
    await supabase
      .from("gmail_tokens")
      .update({
        access_token: newTokens.access_token,
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      })
      .eq("user_id", userId);
  }

  // Fetch emails from Gmail API
  const gmailResponse = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  // Process and store emails
  for (const message of messages) {
    const fullMessage = await fetchFullMessage(message.id, accessToken);
    await supabase.from("emails").upsert({
      gmail_id: message.id,
      user_id: userId,
      subject: extractHeader(fullMessage, "Subject"),
      from_email: extractHeader(fullMessage, "From"),
      body: extractBody(fullMessage),
      // ...
    });
  }

  return new Response(JSON.stringify({ synced: messages.length }));
});
```

---

## 4. AI Processing Pipeline

### 4.1 Email Parsing Flow

```typescript
// Thirrja e AI për parsing
const parseEmail = async (emailContent: string) => {
  const { data, error } = await supabase.functions.invoke("ai-assistant", {
    body: {
      action: "parse",
      emailContent,
    },
  });

  if (error) throw error;

  // Parse JSON response
  const parsed = JSON.parse(data.result);
  return {
    sender: parsed.sender,
    intent: parsed.intent,
    keyDates: parsed.key_dates,
    actionItems: parsed.action_items,
    sentiment: parsed.sentiment,
    priority: parsed.priority,
  };
};
```

### 4.2 Streaming Chat Implementation

```typescript
// src/lib/streamChat.ts
export const streamChat = async (
  messages: Message[],
  onChunk: (text: string) => void,
  onComplete: () => void
) => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-assistant`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "chat", messages }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

    for (const line of lines) {
      const data = line.replace("data: ", "");
      if (data === "[DONE]") {
        onComplete();
        return;
      }
      const parsed = JSON.parse(data);
      const content = parsed.choices[0]?.delta?.content;
      if (content) onChunk(content);
    }
  }
};
```

### 4.3 Përdorimi në Chatbot

```tsx
// src/components/dashboard/AIChatbotPage.tsx
const handleSendMessage = async () => {
  if (!input.trim()) return;

  const userMessage = { role: "user", content: input };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setIsStreaming(true);

  // Add empty assistant message for streaming
  const assistantMessage = { role: "assistant", content: "" };
  setMessages((prev) => [...prev, assistantMessage]);

  await streamChat(
    [...messages, userMessage],
    // onChunk - append text incrementally
    (text) => {
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          ...updated[lastIndex],
          content: updated[lastIndex].content + text,
        };
        return updated;
      });
    },
    // onComplete
    () => setIsStreaming(false)
  );
};
```

---

## 5. Gmail Integration

### 5.1 OAuth Flow

```typescript
// Initiate Google OAuth
const connectGmail = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      scopes: "https://www.googleapis.com/auth/gmail.readonly",
      redirectTo: `${window.location.origin}/dashboard/settings`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error) toast.error("Gabim gjatë lidhjes: " + error.message);
};
```

### 5.2 Token Storage

```typescript
// Store tokens after OAuth callback
const handleOAuthCallback = async (session: Session) => {
  const { provider_token, provider_refresh_token } = session;

  if (provider_refresh_token) {
    await supabase.from("gmail_tokens").upsert({
      user_id: session.user.id,
      access_token: provider_token,
      refresh_token: provider_refresh_token,
      token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
    });
  }
};
```

### 5.3 Disconnect Gmail

```typescript
const disconnectGmail = async () => {
  const { error } = await supabase.functions.invoke("disconnect-gmail");
  if (error) throw error;

  // Update local state
  setGmailConnected(false);
  toast.success("Gmail u shkëput me sukses");
};
```

---

## 6. State Management

### 6.1 TanStack Query Setup

```typescript
// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 6.2 Custom Hooks

```typescript
// hooks/useEmails.ts
export const useEmails = () => {
  return useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

// hooks/useCalendarEvents.ts
export const useCalendarEvents = (month: Date) => {
  return useQuery({
    queryKey: ["calendar-events", month],
    queryFn: async () => {
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .gte("start_date", startOfMonth.toISOString())
        .lte("end_date", endOfMonth.toISOString());

      if (error) throw error;
      return data;
    },
  });
};
```

### 6.3 Mutations

```typescript
// Mutation for creating calendar event
const createEventMutation = useMutation({
  mutationFn: async (event: NewCalendarEvent) => {
    const { data, error } = await supabase
      .from("calendar_events")
      .insert(event)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    toast.success("Eventi u krijua me sukses!");
  },
  onError: (error) => {
    toast.error("Gabim: " + error.message);
  },
});
```

---

## 7. Komponentët UI

### 7.1 Design System Tokens

```css
/* src/index.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --muted: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  /* ... */
}
```

### 7.2 Reusable Components

```tsx
// Email Card Component
const EmailCard = ({ email, onClick }: EmailCardProps) => {
  const categoryColors = {
    Personale: "bg-green-100 text-green-800",
    Punë: "bg-blue-100 text-blue-800",
    Urgjente: "bg-red-100 text-red-800",
    // ...
  };

  return (
    <Card
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base line-clamp-1">
            {email.subject}
          </CardTitle>
          {email.category && (
            <Badge className={categoryColors[email.category]}>
              {email.category}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{email.from_email}</p>
        <p className="text-sm line-clamp-2 mt-1">{email.snippet}</p>
      </CardContent>
    </Card>
  );
};
```

### 7.3 Loading States

```tsx
// Skeleton for email list
const EmailListSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <Card key={i}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);
```

---

## 8. Siguria dhe RLS

### 8.1 RLS Policies

```sql
-- Emails: users can only see their own
CREATE POLICY "Users can view own emails"
ON emails FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Documents: full CRUD for owners
CREATE POLICY "Users can manage own documents"
ON documents FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Calendar events: isolated per user
CREATE POLICY "Users can manage own events"
ON calendar_events FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### 8.2 Input Validation

```typescript
// Zod schema for calendar event
const eventSchema = z.object({
  title: z.string().min(1, "Titulli është i detyrueshëm").max(100),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  category: z.enum(["Akademike", "Punë", "Personale", "Shëndetësi", "Udhëtime"]),
});

// Validate before submission
const handleSubmit = (data: EventFormData) => {
  const result = eventSchema.safeParse(data);
  if (!result.success) {
    toast.error(result.error.errors[0].message);
    return;
  }
  createEventMutation.mutate(result.data);
};
```

### 8.3 Error Handling Pattern

```typescript
// Centralized error handler
const handleError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error);

  if (error instanceof AuthError) {
    if (error.status === 401) {
      toast.error("Sesioni ka skaduar. Ju lutemi hyni përsëri.");
      navigate("/auth");
      return;
    }
  }

  if (error instanceof PostgrestError) {
    if (error.code === "PGRST116") {
      toast.error("Të dhënat nuk u gjetën.");
      return;
    }
  }

  toast.error("Ndodhi një gabim. Provoni përsëri.");
};
```

---

## Përfundim

Ky dokument mbulon aspektet kryesore teknike të implementimit të MailMind. Për detaje të mëtejshme, referojuni kodit burimor dhe dokumentacionit të API-ve.

---

*Dokumenti i Implementimit - MailMind v1.0 - Shkurt 2024*
