# MailMind 📧🤖

**Agjenti Inteligjent për Menaxhimin e Email-it me AI**

MailMind është një aplikacion web modern që përdor inteligjencën artificiale për të automatizuar dhe thjeshtuar menaxhimin e email-eve. Duke integruar modele të avancuara gjuhësore (LLM), MailMind ndihmon përdoruesit të kursejnë kohë duke kategorizuar, përmbledhur dhe gjeneruar përgjigje automatike për email-et e tyre.

---

## 🚀 Funksionalitetet Kryesore

| Funksionaliteti | Përshkrimi |
|-----------------|------------|
| **📥 Sinkronizimi Gmail** | Lidhu me llogarinë Google dhe sinkronizo email-et automatikisht |
| **🏷️ Kategorizimi AI** | Klasifikimi automatik i email-eve në 6 kategori (Personale, Punë, Miqësore, etj.) |
| **📝 Përmbledhja** | Përmbledhje e thread-eve të email-eve me një klik |
| **✉️ Gjenerimi i Përgjigjeve** | Krijoni përgjigje profesionale me tone të ndryshme |
| **🔍 Email Parser** | Nxjerrja automatike e datave, detyrave dhe prioriteteve |
| **💬 AI Chat** | Bisedoni me asistentin AI për ndihmë me email-et |
| **📅 Kalendar** | Menaxhoni eventet dhe takimet |
| **📄 Dokumentet** | Ngarkoni dhe analizoni dokumente (TXT, DOCX, PDF) |
| **✏️ Draftet** | Shkruani dhe korrigjoni draft-et me AI proofreader |

---

## 🛠️ Teknologjitë e Përdorura

### Frontend
- **React 18** — Libraria kryesore UI
- **TypeScript** — Type safety dhe developer experience
- **Vite** — Build tool i shpejtë
- **Tailwind CSS** — Utility-first CSS framework
- **shadcn/ui** — Komponentë UI të ripërdorshme
- **Framer Motion** — Animacione të buta
- **React Router v6** — Routing client-side
- **TanStack Query** — Server state management
- **React Hook Form + Zod** — Form handling dhe validim

### Backend (Supabase)
- **Supabase Auth** — Autentifikimi (Email/Password + Google OAuth)
- **PostgreSQL** — Databaza relacionale
- **Row Level Security (RLS)** — Siguria në nivel rreshti
- **Supabase Storage** — Ruajtja e dokumenteve
- **Edge Functions (Deno)** — Serverless functions

### AI & Integrime
- **Lovable AI Gateway** — Qasje në Google Gemini
- **Gmail API** — Leximi i email-eve
- **mammoth.js** — Përpunimi i dokumenteve Word

### Deployment
- **Vercel** / **Lovable** — Hosting dhe CI/CD
- **Environment Variables** — Menaxhimi i sekreteve

---

## 📦 Instalimi

### Parakushtet
- Node.js 18+ dhe npm/bun
- Llogari Supabase (falas në [supabase.com](https://supabase.com))
- Projekt në Google Cloud Console (për Gmail API)

### Hapat e Instalimit

```bash
# 1. Klono repository-n
git clone https://github.com/your-username/mailmind.git
cd mailmind

# 2. Instalo varësitë
npm install
# ose
bun install

# 3. Krijo skedarin .env (shiko më poshtë)
cp .env.example .env

# 4. Starto serverin e zhvillimit
npm run dev
```

---

## ⚙️ Konfigurimi i Environment Variables

Krijo një skedar `.env` në root të projektit me variablat e mëposhtme:

```env
# Supabase Configuration
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-key"
VITE_SUPABASE_PROJECT_ID="your-project-id"
```

### Sekretet në Supabase Dashboard

Këto sekrete duhet të vendosen në **Supabase Dashboard → Settings → Edge Functions → Secrets**:

| Sekreti | Përshkrimi |
|---------|------------|
| `GOOGLE_CLIENT_ID` | OAuth Client ID nga Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret nga Google Cloud Console |
| `LOVABLE_API_KEY` | API key për Lovable AI Gateway |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (vetëm për Edge Functions) |

### Konfigurimi i Google OAuth

1. Shko te [Google Cloud Console](https://console.cloud.google.com/)
2. Krijo një projekt të ri ose zgjedh ekzistuesin
3. Aktivizo **Gmail API** nga Library
4. Shko te **APIs & Services → Credentials**
5. Krijo **OAuth 2.0 Client ID** (Web application)
6. Shto Authorized redirect URI:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
7. Kopjo Client ID dhe Client Secret në Supabase Secrets

---

## 🗄️ Struktura e Databazës

```
Tabelat kryesore:
├── profiles          → Profilet e përdoruesve
├── emails            → Email-et e sinkronizuara
├── email_summaries   → Përmbledhjet e gjeneruara
├── ai_replies        → Përgjigjet e gjeneruara me AI
├── documents         → Dokumentet e ngarkuara
├── calendar_events   → Eventet e kalendarit
├── gmail_tokens      → Token-et OAuth për Gmail
├── inbox_messages    → Mesazhet e brendshme
└── user_settings     → Cilësimet e përdoruesit
```

---

## 📁 Struktura e Projektit

```
mailmind/
├── src/
│   ├── components/
│   │   ├── dashboard/       # Faqet e dashboard-it
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/               # Custom React hooks
│   ├── integrations/
│   │   └── supabase/        # Supabase client & types
│   ├── lib/                 # Utilities
│   ├── pages/               # Route pages
│   └── main.tsx             # Entry point
├── supabase/
│   ├── functions/           # Edge Functions
│   │   ├── ai-assistant/    # AI processing
│   │   ├── sync-gmail/      # Gmail sync
│   │   ├── process-document/# Document processing
│   │   └── disconnect-gmail/# Gmail disconnect
│   └── migrations/          # Database migrations
├── public/                  # Static assets
└── .env                     # Environment variables
```

---

## 🚀 Deployment

### Me Lovable
1. Hap projektin në [lovable.dev](https://lovable.dev)
2. Kliko **Share → Publish**
3. Projekti do të deployohet automatikisht

### Me Vercel
1. Lidh repository-n me Vercel
2. Shto environment variables në Vercel Dashboard
3. Deploy automatikisht me çdo push në main

---

## 🔒 Siguria

- **Row Level Security (RLS)** — Çdo përdorues ka qasje vetëm në të dhënat e veta
- **OAuth 2.0** — Autentifikim i sigurt me Google
- **Signed URLs** — Dokumentet qasen vetëm me URL të nënshkruara me afat
- **Environment Variables** — Sekretet nuk ruhen në kod
- **HTTPS** — Të gjitha komunikimet janë të enkriptuara

---

## 📝 Skriptet e Disponueshme

```bash
npm run dev      # Starto serverin e zhvillimit
npm run build    # Ndërto për prodhim
npm run preview  # Shiko build-in e prodhimit
npm run lint     # Kontrollo kodin me ESLint
npm run test     # Ekzekuto testet
```

---

## 🤝 Kontributi

Kontributet janë të mirëpritura! Për ndryshime të mëdha, hapni një issue së pari për të diskutuar ndryshimin e propozuar.

---

## 📄 Licensa

Ky projekt është zhvilluar si pjesë e një teme diplome.

---

## 👨‍💻 Autori

Zhvilluar me ❤️ duke përdorur [Lovable](https://lovable.dev)
