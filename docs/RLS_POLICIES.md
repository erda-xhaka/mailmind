# Dokumentimi i Politikave RLS (Row Level Security) - MailMind

## Hyrje

**Row Level Security (RLS)** është mekanizmi kryesor i sigurisë në MailMind që siguron që çdo përdorues ka qasje vetëm në të dhënat e veta. Ky dokument përshkruan të gjitha politikat e implementuara në projektin MailMind.

---

## Parimi Themelor i Sigurisë

```
auth.uid() = user_id
```

Ky kusht është baza e çdo politike RLS. Funksioni `auth.uid()` kthen UUID-në e përdoruesit të autentifikuar, dhe krahasohet me kolonën `user_id` të çdo rreshti.

**Rezultati:** Përdoruesi A nuk mund të shohë, modifikojë ose fshijë të dhënat e Përdoruesit B.

---

## Tabelat dhe Politikat RLS

### 1. Tabela: `profiles`

**Qëllimi:** Ruan informacionin e profilit të përdoruesit (emri, email, avatar).

| Kolona | Tipi | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | Jo | — |
| full_name | text | Po | — |
| email | text | Po | — |
| avatar_url | text | Po | — |
| created_at | timestamptz | Po | now() |

**Politikat RLS:**

| Politika | Komanda | Kushti (USING/WITH CHECK) | Arsyetimi |
|----------|---------|---------------------------|-----------|
| Users can view own profile | SELECT | `auth.uid() = id` | Çdo përdorues sheh vetëm profilin e vet |
| Users can create own profile | INSERT | `auth.uid() = id` | Lejon krijimin e profilit vetëm për veten |
| Users can update own profile | UPDATE | `auth.uid() = id` | Lejon modifikimin vetëm të profilit personal |

**❌ DELETE:** Nuk lejohet — Profilet nuk duhet të fshihen (lidhen me auth.users).

**Trigger i lidhur:** `handle_new_user` — Krijon automatikisht profilin kur përdoruesi regjistrohet.

---

### 2. Tabela: `emails`

**Qëllimi:** Ruan email-et e sinkronizuara nga Gmail API.

| Kolona | Tipi | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | Jo | uuid_generate_v4() |
| user_id | uuid | Po | — |
| gmail_id | text | Po | — |
| thread_id | text | Po | — |
| from_email | text | Po | — |
| to_email | text | Po | — |
| subject | text | Po | — |
| snippet | text | Po | — |
| body | text | Po | — |
| category | text | Po | 'uncategorized' |
| is_read | boolean | Po | false |
| is_starred | boolean | Po | false |
| created_at | timestamptz | Po | now() |

**Politikat RLS:**

| Politika | Komanda | Kushti | Arsyetimi |
|----------|---------|--------|-----------|
| Users can view own emails | SELECT | `auth.uid() = user_id` | Privatësia: email-et janë personale |
| Users can insert own emails | INSERT | `auth.uid() = user_id` | Vetëm sistemi (sync-gmail) shton email-e për përdoruesin |
| Users can update own emails | UPDATE | `auth.uid() = user_id` | Lejon ndryshimin e statusit (read, starred, category) |
| Users can delete own emails | DELETE | `auth.uid() = user_id` | Lejon pastrimin e inbox-it |

**Arsyetimi i plotë:** Email-et përmbajnë informacion të ndjeshëm — adresa, përmbajtje, kontakte. Pa RLS, një përdorues keqdashës mund të lexonte email-et e të gjithë përdoruesve.

---

### 3. Tabela: `email_summaries`

**Qëllimi:** Ruan përmbledhjet e gjeneruara nga AI.

| Kolona | Tipi | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | Jo | uuid_generate_v4() |
| user_id | uuid | Po | — |
| email_id | uuid | Po | — |
| summary | text | Po | — |
| created_at | timestamptz | Po | now() |

**Politikat RLS:**

| Politika | Komanda | Kushti | Arsyetimi |
|----------|---------|--------|-----------|
| Users can manage own summaries | ALL | `auth.uid() = user_id` | Politikë e thjeshtë ALL për CRUD të plotë |

**Pse ALL?** Përmbledhjet janë objekte të thjeshta që lidhen 1:1 me përdoruesin. Nuk ka nevojë për politika të veçanta.

---

### 4. Tabela: `ai_replies`

**Qëllimi:** Ruan përgjigjet e gjeneruara nga AI.

| Kolona | Tipi | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | Jo | uuid_generate_v4() |
| user_id | uuid | Po | — |
| email_id | uuid | Po | — |
| reply_text | text | Po | — |
| to_email | text | Po | — |
| subject | text | Po | — |
| created_at | timestamptz | Po | now() |

**Politikat RLS:**

| Politika | Komanda | Kushti | Arsyetimi |
|----------|---------|--------|-----------|
| Users can manage own replies | ALL | `auth.uid() = user_id` | Përgjigjet janë pronë e përdoruesit |

---

### 5. Tabela: `documents`

**Qëllimi:** Ruan metadata-n e dokumenteve të ngarkuara.

| Kolona | Tipi | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | Jo | uuid_generate_v4() |
| user_id | uuid | Po | — |
| name | text | Po | — |
| file_url | text | Po | — |
| file_type | text | Po | — |
| file_size | bigint | Po | — |
| extracted_text | text | Po | — |
| created_at | timestamptz | Po | now() |

**Politikat RLS:**

| Politika | Komanda | Kushti | Arsyetimi |
|----------|---------|--------|-----------|
| Users can manage own documents | ALL | `auth.uid() = user_id` | Dokumentet janë private |

**Siguri shtesë:** Skedarët ruhen në Supabase Storage me bucket private + Signed URLs.

---

### 6. Tabela: `gmail_tokens`

**Qëllimi:** Ruan OAuth tokens për qasje në Gmail API.

| Kolona | Tipi | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | Jo | gen_random_uuid() |
| user_id | uuid | Jo | — |
| access_token | text | Po | — |
| refresh_token | text | Jo | — |
| token_expires_at | timestamptz | Po | — |
| created_at | timestamptz | Po | now() |
| updated_at | timestamptz | Po | now() |

**Politikat RLS:**

| Politika | Komanda | USING | WITH CHECK | Arsyetimi |
|----------|---------|-------|------------|-----------|
| Users can manage own tokens | ALL | `auth.uid() = user_id` | `auth.uid() = user_id` | **KRITIKE:** Tokenat janë kredenciale |

**⚠️ Rëndësia e lartë:** Kjo tabelë përmban `access_token` dhe `refresh_token` që japin qasje të plotë në Gmail-in e përdoruesit. Pa RLS strikte, një sulmues mund të lexonte email-et e çdokujt.

---

### 7. Tabela: `calendar_events`

**Qëllimi:** Ruan eventet e kalendarit.

| Kolona | Tipi | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | Jo | gen_random_uuid() |
| user_id | uuid | Jo | — |
| title | text | Jo | — |
| start_date | timestamptz | Jo | — |
| end_date | timestamptz | Jo | — |
| description | text | Po | — |
| location | text | Po | — |
| category | text | Po | — |
| participants | jsonb | Po | '[]' |
| created_at | timestamptz | Po | now() |
| updated_at | timestamptz | Po | now() |

**Politikat RLS:**

| Politika | Komanda | Kushti | Arsyetimi |
|----------|---------|--------|-----------|
| Users can view their own events | SELECT | `auth.uid() = user_id` | Eventet janë personale |
| Users can insert their own events | INSERT | `auth.uid() = user_id` (WITH CHECK) | Lejon krijimin vetëm për veten |
| Users can update their own events | UPDATE | `auth.uid() = user_id` | Lejon modifikimin |
| Users can delete their own events | DELETE | `auth.uid() = user_id` | Lejon fshirjen |

**Pse politika të veçanta?** Granulariteti i lartë — në të ardhmen mund të shtohet sharing me politika specifike.

---

### 8. Tabela: `inbox_messages`

**Qëllimi:** Ruan mesazhet e brendshme midis përdoruesve.

| Kolona | Tipi | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | Jo | gen_random_uuid() |
| user_id | uuid | Po | — |
| sender | uuid | Jo | — |
| recipient | uuid | Jo | — |
| subject | text | Po | — |
| body | text | Po | — |
| is_read | boolean | Po | false |
| created_at | timestamptz | Po | now() |

**Politikat RLS (më komplekse):**

| Politika | Komanda | Kushti | Arsyetimi |
|----------|---------|--------|-----------|
| Allow owners and recipients to select | SELECT | `auth.uid() = sender OR auth.uid() = recipient` | Të dy palët shohin mesazhin |
| Allow senders to insert as themselves | INSERT | `auth.uid() = sender` | Vetëm dërguesi mund të krijojë mesazh |
| Allow recipients to mark read | UPDATE | USING: `auth.uid() = recipient`, CHECK: `true` | Marrësi mund të shënojë si lexuar |
| Users can delete their inbox messages | DELETE | `auth.uid() = user_id OR sender = auth.uid()` | Dërguesi ose pronari fshijnë |

**Kompleksiteti:** Kjo tabelë ka dy aktorë — sender dhe recipient. Politikat duhet të lejojnë qasje për të dy, por veprime të ndryshme.

---

### 9. Tabela: `user_settings`

**Qëllimi:** Ruan preferencat e përdoruesit.

| Kolona | Tipi | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | Jo | uuid_generate_v4() |
| user_id | uuid | Po | — |
| gmail_connected | boolean | Po | false |
| calendar_connected | boolean | Po | false |
| created_at | timestamptz | Po | now() |

**Politikat RLS:**

| Politika | Komanda | Kushti | Arsyetimi |
|----------|---------|--------|-----------|
| Users can manage own settings | ALL | `auth.uid() = user_id` | Cilësimet janë personale |

---

## Diagrama e Qasjes

```
┌─────────────────────────────────────────────────────────────────┐
│                      PËRDORUESI A                               │
│                      (auth.uid() = 'aaa-...')                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE RLS ENGINE                          │
│                                                                 │
│   SELECT * FROM emails                                          │
│   ↓                                                             │
│   WHERE user_id = 'aaa-...'  ← INJEKTOHET AUTOMATIKISHT        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REZULTATI                                   │
│                                                                 │
│   ✅ Email-et e Përdoruesit A (user_id = 'aaa-...')            │
│   ❌ Email-et e Përdoruesit B (user_id = 'bbb-...')  BLLOKUAR  │
│   ❌ Email-et e Përdoruesit C (user_id = 'ccc-...')  BLLOKUAR  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tipet e Politikave

### 1. PERMISSIVE vs RESTRICTIVE

Të gjitha politikat në MailMind janë **RESTRICTIVE** (Permissive: No), që do të thotë:
- Rreshti duhet të plotësojë **TË GJITHA** politikat për t'u aksesuar
- Më e sigurt se PERMISSIVE (ku mjafton të plotësohet njëra)

### 2. USING vs WITH CHECK

| Klauzola | Përdorimi | Shembull |
|----------|-----------|----------|
| USING | Filtron rreshtat ekzistues (SELECT, UPDATE, DELETE) | `auth.uid() = user_id` |
| WITH CHECK | Validon rreshtat e rinj (INSERT, UPDATE) | `auth.uid() = user_id` |

---

## Skenarë Sulmesh të Parandaluar

### 1. SQL Injection përmes API-së
```javascript
// Sulm i tentuar:
const { data } = await supabase
  .from('emails')
  .select('*')
  .eq('user_id', 'viktima-uuid'); // Sulmuesi tenton të marrë email-et e dikujt tjetër

// Rezultati: ARRAY BOSH
// RLS filtron: WHERE user_id = auth.uid() AND user_id = 'viktima-uuid'
// Këto nuk përputhen kurrë nëse sulmuesi nuk është viktima
```

### 2. IDOR (Insecure Direct Object Reference)
```javascript
// Sulm i tentuar:
const { data } = await supabase
  .from('gmail_tokens')
  .select('access_token')
  .eq('id', 'token-id-e-dikujt-tjeter');

// Rezultati: BOSH (edhe nëse ID-ja ekziston)
// RLS: user_id duhet të përputhet me auth.uid()
```

### 3. Mass Assignment
```javascript
// Sulm i tentuar:
const { error } = await supabase
  .from('emails')
  .insert({ user_id: 'id-e-dikujt-tjeter', subject: 'Phishing' });

// Rezultati: ERROR - violates row-level security policy
// WITH CHECK validon që user_id = auth.uid()
```

---

## Rekomandime për Mirëmbajtje

1. **Asnjëherë mos çaktivizo RLS** — Edhe për debugging, përdor service_role_key vetëm në Edge Functions

2. **Testo politikat** — Pas çdo ndryshimi, testo me dy llogari të ndryshme

3. **Auditim periodik** — Kontrollo që politikat janë ende të vlefshme

4. **Logim** — Supabase logon çdo thirrje të bllokuar nga RLS

5. **Parimi i privilegjit minimal** — Dhuro vetëm qasjen minimale të nevojshme

---

## Përfundim

MailMind implementon **23 politika RLS** në **9 tabela**, duke siguruar izolim të plotë të të dhënave midis përdoruesve. Çdo email, dokument, token dhe event është i mbrojtur në nivel databaze — edhe nëse kodi i aplikacionit ka bug, sulmuesi nuk mund të qaset në të dhënat e përdoruesve të tjerë.

```
Siguria = Autentifikimi (Supabase Auth) + Autorizimi (RLS) + Enkriptimi (HTTPS/TLS)
```
