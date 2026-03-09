# 📡 Dokumentimi i API - MailMind Edge Functions

Ky dokument përshkruan të gjitha Edge Functions të projektit MailMind, duke përfshirë endpoints, parametrat, përgjigjet dhe shembujt e përdorimit.

---

## Përmbajtja

1. [ai-assistant](#1-ai-assistant)
2. [sync-gmail](#2-sync-gmail)
3. [process-document](#3-process-document)
4. [disconnect-gmail](#4-disconnect-gmail)

---

## Konfigurimi i Përgjithshëm

### Base URL
```
https://hyntffvtcvfpzfxdnhfk.supabase.co/functions/v1/
```

### Headers të Kërkuara
```http
Content-Type: application/json
Authorization: Bearer <SUPABASE_ANON_KEY>
```

### Sekretet e Nevojshme (Supabase Secrets)

| Sekreti | Përshkrimi | Përdorimi |
|---------|------------|-----------|
| `LOVABLE_API_KEY` | API key për Lovable AI Gateway | ai-assistant |
| `GOOGLE_CLIENT_ID` | OAuth Client ID nga Google Cloud | sync-gmail, disconnect-gmail |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret | sync-gmail, disconnect-gmail |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Të gjitha funksionet |
| `SUPABASE_URL` | URL e projektit Supabase | Të gjitha funksionet |

---

## 1. ai-assistant

Edge Function kryesore për të gjitha operacionet AI, duke përdorur Google Gemini 1.5 Flash përmes Lovable AI Gateway.

### Endpoint
```
POST /ai-assistant
```

### Veprimet e Mbështetura

#### 1.1 Chat (me Streaming)

Bisedë interaktive me AI assistant me mbështetje për SSE streaming.

**Kërkesa:**
```json
{
  "action": "chat",
  "messages": [
    {"role": "user", "content": "Si mund të organizoj inbox-in tim?"}
  ]
}
```

**Parametrat:**
| Parametri | Lloji | Kërkohet | Përshkrimi |
|-----------|-------|----------|------------|
| action | string | ✅ | Duhet të jetë `"chat"` |
| messages | array | ✅ | Array i mesazheve me role dhe content |

**Përgjigja (SSE Stream):**
```
data: {"choices":[{"delta":{"content":"Për"}}]}
data: {"choices":[{"delta":{"content":" të"}}]}
data: {"choices":[{"delta":{"content":" organizuar"}}]}
...
data: [DONE]
```

**Shembull JavaScript:**
```typescript
const response = await fetch('/functions/v1/ai-assistant', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({ action: 'chat', messages })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  // Parse SSE format and extract content
}
```

---

#### 1.2 Parse (Email Parser)

Analizon një email dhe nxjerr informacione strukturore.

**Kërkesa:**
```json
{
  "action": "parse",
  "emailContent": "From: john@company.com\nSubject: Meeting Tomorrow\n\nHi, can we meet at 3pm tomorrow to discuss the Q4 budget?"
}
```

**Parametrat:**
| Parametri | Lloji | Kërkohet | Përshkrimi |
|-----------|-------|----------|------------|
| action | string | ✅ | Duhet të jetë `"parse"` |
| emailContent | string | ✅ | Përmbajtja e plotë e email-it |

**Përgjigja:**
```json
{
  "result": {
    "sender": "john@company.com",
    "intent": "Request",
    "key_dates": ["tomorrow at 3pm"],
    "action_items": ["Schedule meeting", "Prepare Q4 budget discussion"],
    "sentiment": "Neutral",
    "priority": "Medium"
  }
}
```

**Fushat e Output:**
| Fusha | Lloji | Vlerat e Mundshme |
|-------|-------|-------------------|
| sender | string | Email address |
| intent | string | Request, Information, Action Required, Follow-up |
| key_dates | array | Datat e identifikuara |
| action_items | array | Veprimet e nevojshme |
| sentiment | string | Positive, Neutral, Negative |
| priority | string | High, Medium, Low |

---

#### 1.3 Reply (Gjenerimi i Përgjigjeve)

Gjeneron një përgjigje profesionale për email-in e dhënë.

**Kërkesa:**
```json
{
  "action": "reply",
  "emailContent": "Hi, could you send me the monthly report by Friday?",
  "tone": "Professional"
}
```

**Parametrat:**
| Parametri | Lloji | Kërkohet | Përshkrimi |
|-----------|-------|----------|------------|
| action | string | ✅ | Duhet të jetë `"reply"` |
| emailContent | string | ✅ | Email-i që duhet të përgjigjet |
| tone | string | ❌ | Toni (default: Professional) |

**Tonet e Mbështetura:**
- `Professional` - Profesional dhe formal
- `Friendly` - Miqësor dhe i ngrohtë
- `Concise` - Shkurt dhe në pikë
- `Detailed` - I detajuar dhe i plotë
- `Apologetic` - Kërkues falje

**Përgjigja:**
```json
{
  "result": "Thank you for your message. I will have the monthly report ready and sent to you by Friday as requested. Please let me know if you need any specific data points included.\n\nBest regards"
}
```

---

#### 1.4 Summarize (Përmbledhja e Thread-eve)

Përmbledh një ose më shumë email threads.

**Kërkesa:**
```json
{
  "action": "summarize",
  "emails": [
    {
      "id": "uuid-1",
      "subject": "Project Update",
      "from_email": "manager@company.com",
      "body": "The project is on track...",
      "thread_id": "thread-123"
    },
    {
      "id": "uuid-2",
      "subject": "Re: Project Update",
      "from_email": "developer@company.com",
      "body": "Thanks for the update...",
      "thread_id": "thread-123"
    }
  ]
}
```

**Parametrat:**
| Parametri | Lloji | Kërkohet | Përshkrimi |
|-----------|-------|----------|------------|
| action | string | ✅ | Duhet të jetë `"summarize"` |
| emails | array | ✅ | Array i email-eve për t'u përmbledhur |

**Përgjigja:**
```json
{
  "result": [
    {
      "thread_title": "Project Status Discussion",
      "email_count": 2,
      "summary": "Manager shared project is on track. Developer acknowledged and confirmed next steps.",
      "action_items": ["Review project timeline", "Prepare next milestone"]
    }
  ]
}
```

---

#### 1.5 Categorize (Kategorizimi)

Kategorizon email-et në 6 kategori të paracaktuara.

**Kërkesa:**
```json
{
  "action": "categorize",
  "emailsToCateg": [
    {
      "id": "uuid-1",
      "subject": "Urgent: Server Down",
      "from_email": "sysadmin@company.com",
      "body": "Production server is not responding..."
    },
    {
      "id": "uuid-2",
      "subject": "Happy Birthday!",
      "from_email": "mom@gmail.com",
      "body": "Wishing you a wonderful day..."
    }
  ]
}
```

**Parametrat:**
| Parametri | Lloji | Kërkohet | Përshkrimi |
|-----------|-------|----------|------------|
| action | string | ✅ | Duhet të jetë `"categorize"` |
| emailsToCateg | array | ✅ | Array i email-eve për kategorizim |

**Kategorit:**
| Kategoria | Përshkrimi |
|-----------|------------|
| Personale | Nga familja, miqtë e ngushtë, çështje personale |
| Punë | Nga kolegë, klientë, projekte pune |
| Miqësore | Nga miq, ton informal |
| Të rëndësishme | Përmbajnë afate, vendime kritike |
| Urgjente | Kërkojnë veprim brenda 24 orëve |
| Të tjera | Çdo gjë tjetër |

**Përgjigja:**
```json
{
  "result": [
    {"id": "uuid-1", "category": "Urgjente"},
    {"id": "uuid-2", "category": "Personale"}
  ]
}
```

---

#### 1.6 Proofread (Korrigjimi i Drafteve)

Kontrollon dhe korrigjon draftet për gabime gramatikore dhe stilistike.

**Kërkesa:**
```json
{
  "action": "proofread",
  "draftText": "I wanted to infrom you that the meeting has been postpond to next weak."
}
```

**Parametrat:**
| Parametri | Lloji | Kërkohet | Përshkrimi |
|-----------|-------|----------|------------|
| action | string | ✅ | Duhet të jetë `"proofread"` |
| draftText | string | ✅ | Teksti i draftit për korrigjim |

**Përgjigja:**
```json
{
  "result": {
    "issues": [
      {
        "original": "infrom",
        "suggestion": "inform",
        "explanation": "Spelling error - 'infrom' should be 'inform'"
      },
      {
        "original": "postpond",
        "suggestion": "postponed",
        "explanation": "Spelling error - missing 'e' at the end"
      },
      {
        "original": "weak",
        "suggestion": "week",
        "explanation": "Wrong word - 'weak' means not strong, 'week' is a time period"
      }
    ],
    "corrected_text": "I wanted to inform you that the meeting has been postponed to next week."
  }
}
```

---

#### 1.7 Chat-Single (Pyetje e Thjeshtë)

Për pyetje të thjeshta pa historik bisede.

**Kërkesa:**
```json
{
  "action": "chat-single",
  "prompt": "Çfarë është MailMind?"
}
```

**Përgjigja:**
```json
{
  "result": "MailMind është një aplikacion web që përdor inteligjencën artificiale për të ndihmuar në menaxhimin e email-eve..."
}
```

---

### Kodet e Gabimeve

| Kodi | Përshkrimi | Zgjidhja |
|------|------------|----------|
| 400 | Invalid action | Kontrolloni vlerën e fushës `action` |
| 402 | AI credits exhausted | Shtoni kredite AI në llogarinë tuaj |
| 429 | Rate limit exceeded | Prisni dhe provoni përsëri |
| 500 | LOVABLE_API_KEY not configured | Konfiguroni sekretin në Supabase |
| 500 | AI service error | Gabim i brendshëm - provoni përsëri |

---

## 2. sync-gmail

Sinkronizon email-et nga Gmail duke përdorur OAuth 2.0 tokens.

### Endpoint
```
POST /sync-gmail
```

### Kërkesa
```json
{
  "userId": "uuid-of-user"
}
```

**Parametrat:**
| Parametri | Lloji | Kërkohet | Përshkrimi |
|-----------|-------|----------|------------|
| userId | string (UUID) | ✅ | ID e përdoruesit nga auth.users |

### Procesi i Brendshëm

1. Merr `access_token` dhe `refresh_token` nga tabela `gmail_tokens`
2. Nëse token-i ka skaduar, përdor `refresh_token` për të marrë të ri
3. Thirr Gmail API për të marrë mesazhet e fundit
4. Ruan email-et e reja në tabelën `emails`
5. Përditëson `token_expires_at` nëse u rifreskua

### Përgjigjet

**Sukses:**
```json
{
  "success": true,
  "synced": 15,
  "message": "Successfully synced 15 emails"
}
```

**Kërkohet ri-autorizim:**
```json
{
  "success": false,
  "status": "REAUTH_REQUIRED",
  "message": "Gmail token expired or revoked. Please reconnect."
}
```

**Gabim:**
```json
{
  "success": false,
  "error": "Failed to fetch emails from Gmail"
}
```

### Kodet e Gabimeve

| Kodi | Përshkrimi | Veprim |
|------|------------|--------|
| 200 + REAUTH_REQUIRED | Token i pavlefshëm | Ridrejtoni përdoruesin te Settings për ri-lidhje |
| 400 | userId mungon | Sigurohuni që po dërgoni userId |
| 500 | Gabim i brendshëm | Kontrolloni logs në Supabase |

---

## 3. process-document

Përpunon dokumentet e ngarkuara dhe nxjerr tekstin.

### Endpoint
```
POST /process-document
```

### Kërkesa
```json
{
  "documentId": "uuid-of-document",
  "userId": "uuid-of-user"
}
```

**Parametrat:**
| Parametri | Lloji | Kërkohet | Përshkrimi |
|-----------|-------|----------|------------|
| documentId | string (UUID) | ✅ | ID e dokumentit nga tabela `documents` |
| userId | string (UUID) | ✅ | ID e përdoruesit (për RLS) |

### Llojet e Mbështetura

| Lloji | Extension | Libraria |
|-------|-----------|----------|
| PDF | .pdf | pdf-parse |
| Word | .docx | mammoth.js |
| Text | .txt | Native (UTF-8) |

### Procesi i Brendshëm

1. Merr metadata e dokumentit nga tabela `documents`
2. Shkarkon skedarin nga Supabase Storage
3. Identifikon llojin e skedarit
4. Nxjerr tekstin duke përdorur librarinë përkatëse
5. Përditëson kolonën `extracted_text` në databazë

### Përgjigjet

**Sukses:**
```json
{
  "success": true,
  "documentId": "uuid",
  "textLength": 4523,
  "message": "Document processed successfully"
}
```

**Gabim:**
```json
{
  "success": false,
  "error": "Unsupported file type: .xlsx"
}
```

### Kodet e Gabimeve

| Kodi | Përshkrimi |
|------|------------|
| 400 | documentId ose userId mungon |
| 404 | Dokumenti nuk u gjet |
| 415 | Lloj skedari i pambështetur |
| 500 | Gabim gjatë përpunimit |

---

## 4. disconnect-gmail

Shkëput lidhjen me Gmail duke revokuar token-in dhe fshirë të dhënat lokale.

### Endpoint
```
POST /disconnect-gmail
```

### Kërkesa

Nuk kërkohet body - përdoruesi identifikohet nga JWT session.

```http
POST /functions/v1/disconnect-gmail
Authorization: Bearer <user_jwt_token>
```

### Procesi i Brendshëm

1. Merr `user_id` nga JWT token
2. Merr `access_token` nga tabela `gmail_tokens`
3. Revokon token-in duke thirrur Google OAuth revoke endpoint
4. Fshin rreshtin nga `gmail_tokens`
5. (Opsional) Fshin email-et e sinkronizuara nga tabela `emails`

### Përgjigjet

**Sukses:**
```json
{
  "success": true,
  "message": "Gmail disconnected successfully"
}
```

**Token nuk ekziston:**
```json
{
  "success": true,
  "message": "No Gmail connection found"
}
```

**Gabim:**
```json
{
  "success": false,
  "error": "Failed to revoke Gmail token"
}
```

---

## Shembuj të Plotë

### Shembull 1: Analizimi i një Email-i

```typescript
import { supabase } from "@/integrations/supabase/client";

async function analyzeEmail(emailContent: string) {
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: {
      action: 'parse',
      emailContent
    }
  });

  if (error) throw error;
  
  const parsed = JSON.parse(data.result);
  console.log('Sender:', parsed.sender);
  console.log('Priority:', parsed.priority);
  console.log('Action Items:', parsed.action_items);
  
  return parsed;
}
```

### Shembull 2: Streaming Chat

```typescript
import { streamChat } from "@/lib/streamChat";

const messages = [
  { role: 'user', content: 'Si mund të shkruaj një email profesional?' }
];

let fullResponse = '';

await streamChat({
  messages,
  onDelta: (text) => {
    fullResponse += text;
    updateUI(fullResponse); // Update UI progressively
  },
  onDone: () => {
    saveToHistory(fullResponse);
  },
  onError: (err) => {
    showError(err.message);
  }
});
```

### Shembull 3: Sinkronizimi i Gmail

```typescript
async function syncEmails() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase.functions.invoke('sync-gmail', {
    body: { userId: user.id }
  });

  if (data?.status === 'REAUTH_REQUIRED') {
    // Redirect user to reconnect Gmail
    navigate('/dashboard/settings');
    toast.error('Ju lutem ri-lidhni Gmail-in tuaj');
    return;
  }

  if (error) {
    toast.error('Sinkronizimi dështoi');
    return;
  }

  toast.success(`U sinkronizuan ${data.synced} email-e`);
}
```

---

## Rate Limits dhe Kufizimet

| Endpoint | Rate Limit | Shënim |
|----------|------------|--------|
| ai-assistant (chat) | 60 req/min | Streaming konsumon 1 kërkesë |
| ai-assistant (other) | 100 req/min | Parse, reply, summarize, etc. |
| sync-gmail | 10 req/min | Per user |
| process-document | 30 req/min | Varësisht nga madhësia |
| disconnect-gmail | 5 req/min | Per user |

---

## Debugging

### Logs në Supabase Dashboard

Për të parë logs e Edge Functions:
1. Shkoni te [Supabase Dashboard](https://supabase.com/dashboard/project/hyntffvtcvfpzfxdnhfk/functions)
2. Zgjidhni funksionin
3. Klikoni "Logs" tab

### Testimi Lokal

```bash
# Test ai-assistant
curl -X POST "https://hyntffvtcvfpzfxdnhfk.supabase.co/functions/v1/ai-assistant" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"action": "chat-single", "prompt": "Hello"}'
```

---

*Dokumenti u krijua për projektin MailMind - Versioni 1.0*
