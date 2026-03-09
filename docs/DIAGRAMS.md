# 📊 Diagramet e Sistemit MailMind

Ky dokument përmban të gjitha diagramet teknike të nevojshme për temën e diplomës "Implementimi i Agjentit Inteligjent për Email-in Tuaj MailMind".

---

## Përmbajtja

1. [Arkitektura e Përgjithshme](#figura-1-arkitektura-e-përgjithshme)
2. [Rrjedha e Autentikimit OAuth 2.0](#figura-2-rrjedha-e-autentikimit-oauth-20)
3. [Rrjedha e të Dhënave (Data Flow)](#figura-3-rrjedha-e-të-dhënave)
4. [Përpunimi i Email-eve](#figura-4-përpunimi-i-email-eve)
5. [Përpunimi i Dokumenteve](#figura-5-përpunimi-i-dokumenteve)
6. [Diagrami i Sekuencës për API](#figura-6-diagrami-i-sekuencës)
7. [Gjendjet e Drafteve (State Diagram)](#figura-7-gjendjet-e-drafteve)
8. [Diagrami i Vendosjes (Deployment)](#figura-8-diagrami-i-vendosjes)
9. [Klasifikimi i Email-eve me NLP](#figura-9-klasifikimi-i-email-eve)
10. [Përmbledhja e Email-eve](#figura-10-përmbledhja-e-email-eve)
11. [Use Case Diagram](#figura-11-use-case-diagram)
12. [ER Diagram (Databaza)](#figura-12-er-diagram)
13. [AI Chatbot Flow](#figura-13-ai-chatbot-flow)
14. [Component Diagram](#figura-14-component-diagram)
15. [AI Proofreader Flow](#figura-15-ai-proofreader-flow)

---

## Figura 1: Arkitektura e Përgjithshme

**Përshkrimi:** Tregon të gjithë komponentët e sistemit dhe lidhjet mes tyre - nga frontend-i React deri te API-të e jashtme.

**Përdorimi:** Kapitulli 5 (Arkitektura e Sistemit)

```mermaid
flowchart TB
    subgraph Client["Klienti (Browser)"]
        React["React 18 + TypeScript"]
        Vite["Vite Build Tool"]
        Tailwind["Tailwind CSS"]
        ShadcnUI["shadcn/ui Components"]
    end

    subgraph Supabase["Supabase Backend"]
        Auth["Supabase Auth"]
        DB["PostgreSQL Database"]
        Storage["Supabase Storage"]
        Edge["Edge Functions (Deno)"]
    end

    subgraph EdgeFunctions["Edge Functions"]
        AIAssistant["ai-assistant"]
        SyncGmail["sync-gmail"]
        ProcessDoc["process-document"]
        DisconnectGmail["disconnect-gmail"]
    end

    subgraph ExternalAPIs["API te Jashtme"]
        Gmail["Gmail API"]
        Calendar["Google Calendar API"]
        Gemini["Google Gemini API"]
    end

    subgraph Database["Tabelat PostgreSQL"]
        profiles["profiles"]
        emails["emails"]
        gmail_tokens["gmail_tokens"]
        documents["documents"]
        calendar_events["calendar_events"]
        email_summaries["email_summaries"]
        ai_replies["ai_replies"]
    end

    React --> Auth
    React --> DB
    React --> Storage
    React --> Edge

    Edge --> EdgeFunctions
    AIAssistant --> Gemini
    SyncGmail --> Gmail
    ProcessDoc --> Storage

    Auth --> Gmail
    DB --> Database

    style Client fill:#e0f2fe,stroke:#0284c7
    style Supabase fill:#d1fae5,stroke:#059669
    style ExternalAPIs fill:#fef3c7,stroke:#d97706
```

---

## Figura 2: Rrjedha e Autentikimit OAuth 2.0

**Përshkrimi:** Flowchart i detajuar i procesit të autentikimit me Google OAuth 2.0, duke përfshirë të gjithë hapat nga klikimi deri te sesioni.

**Përdorimi:** Kapitulli 5 dhe Kapitulli 8 (Integrimet)

```mermaid
flowchart TD
    Start([Perdoruesi hap aplikacionin]) --> CheckAuth{Sesion aktiv?}
    CheckAuth -->|Po| Dashboard[Shfaq Dashboard]
    CheckAuth -->|Jo| LoginPage[Shfaq faqen e login-it]

    LoginPage --> ClickGoogle[Kliko 'Lidhu me Google']
    ClickGoogle --> SupabaseAuth[Supabase Auth inicializon OAuth]

    SupabaseAuth --> GoogleRedirect[Ridrejtim te Google]
    GoogleRedirect --> GoogleConsent[Google shfaq ekranin e autorizimit]

    GoogleConsent --> UserDecision{Perdoruesi pranon?}
    UserDecision -->|Jo| CancelAuth[Anulohet autentikimi]
    CancelAuth --> LoginPage

    UserDecision -->|Po| AuthCode[Google dergon authorization code]
    AuthCode --> TokenExchange[Supabase shkemben kodin per tokens]

    TokenExchange --> SaveTokens[Ruaj access_token dhe refresh_token]
    SaveTokens --> CreateProfile[Krijo/perditeso profilin]
    CreateProfile --> GenerateSession[Gjenero JWT session]
    GenerateSession --> RedirectApp[Ridrejto te aplikacioni]
    RedirectApp --> Dashboard

    style Start fill:#f0fdf4,stroke:#16a34a
    style Dashboard fill:#dbeafe,stroke:#2563eb
    style GoogleConsent fill:#fef3c7,stroke:#d97706
```

---

## Figura 3: Rrjedha e të Dhënave

**Përshkrimi:** Tregon si lëvizin të dhënat nëpër sistem - nga burimet e jashtme deri te përdoruesi.

**Përdorimi:** Kapitulli 5 (Arkitektura)

```mermaid
flowchart LR
    subgraph Sources["Burimet e te Dhenave"]
        Gmail["Gmail API"]
        Upload["File Upload"]
        Manual["Input Manual"]
    end

    subgraph Processing["Perpunimi"]
        Sync["sync-gmail"]
        DocProcess["process-document"]
        AI["ai-assistant"]
    end

    subgraph Storage["Ruajtja"]
        DB[(PostgreSQL)]
        Files[(Supabase Storage)]
    end

    subgraph Output["Output"]
        UI["React UI"]
        Export["Export/Download"]
    end

    Gmail --> Sync --> DB
    Upload --> Files --> DocProcess --> DB
    Manual --> DB

    DB --> AI --> DB
    DB --> UI
    Files --> UI
    DB --> Export

    style Sources fill:#fef3c7,stroke:#d97706
    style Processing fill:#e0f2fe,stroke:#0284c7
    style Storage fill:#d1fae5,stroke:#059669
    style Output fill:#f3e8ff,stroke:#9333ea
```

---

## Figura 4: Përpunimi i Email-eve

**Përshkrimi:** Flowchart i detajuar që tregon ciklin e plotë të një email-i nga marrja deri te përgjigja.

**Përdorimi:** Kapitulli 6 (NLP) dhe Kapitulli 7 (Implementimi)

```mermaid
flowchart TD
    Start([Email i ri nga Gmail]) --> Fetch[sync-gmail merr email-in]
    Fetch --> Store[Ruaj ne tabelen emails]
    Store --> Parse{Perdoruesi kerkon analize?}

    Parse -->|Po| EmailParser[Email Parser - ai-assistant]
    EmailParser --> ExtractInfo[Nxjerr: sender, intent, dates, priority]
    ExtractInfo --> SaveParsed[Ruaj rezultatet]

    Parse -->|Jo| Display[Shfaq ne Inbox]
    SaveParsed --> Display

    Display --> UserAction{Veprim i perdoruesit?}

    UserAction -->|Permblidh| Summarize[Summarizer - ai-assistant]
    Summarize --> SaveSummary[Ruaj ne email_summaries]
    SaveSummary --> ShowSummary[Shfaq permbledhjen]

    UserAction -->|Gjenero pergjigje| SelectTone[Zgjidh tonin]
    SelectTone --> ReplyGen[Reply Generator - ai-assistant]
    ReplyGen --> ShowReply[Shfaq pergjigjen e gjeneruar]
    ShowReply --> EditReply{Redakto?}
    EditReply -->|Po| Editor[Hap editorin]
    EditReply -->|Jo| SaveDraft[Ruaj si draft]

    UserAction -->|Kategorizo| Categorize[Categorizer - ai-assistant]
    Categorize --> UpdateCategory[Perditeso kategorine]
    UpdateCategory --> Display

    style Start fill:#f0fdf4,stroke:#16a34a
    style EmailParser fill:#e0f2fe,stroke:#0284c7
    style Summarize fill:#fef3c7,stroke:#d97706
    style ReplyGen fill:#f3e8ff,stroke:#9333ea
```

---

## Figura 5: Përpunimi i Dokumenteve

**Përshkrimi:** Tregon procesin e upload-it dhe analizimit të dokumenteve (PDF, Word, TXT).

**Përdorimi:** Kapitulli 7 dhe Kapitulli 8

```mermaid
flowchart TD
    Start([Perdoruesi klikon Upload]) --> SelectFile[Zgjidh dokumentin]
    SelectFile --> CheckType{Lloji i skedarit?}

    CheckType -->|PDF| UploadPDF[Ngarko ne Storage]
    CheckType -->|DOCX| UploadDOCX[Ngarko ne Storage]
    CheckType -->|TXT| UploadTXT[Ngarko ne Storage]
    CheckType -->|Tjeter| Error[Gabim: Format i pa-mbeshtetur]

    UploadPDF --> SaveMeta[Ruaj metadata ne documents]
    UploadDOCX --> SaveMeta
    UploadTXT --> SaveMeta

    SaveMeta --> CallEdge[Thirr process-document Edge Function]

    CallEdge --> ExtractType{Lloji?}
    ExtractType -->|PDF| PDFParse[pdf-parse library]
    ExtractType -->|DOCX| Mammoth[mammoth.js library]
    ExtractType -->|TXT| ReadDirect[Lexo direkt]

    PDFParse --> ExtractedText[Tekst i nxjerre]
    Mammoth --> ExtractedText
    ReadDirect --> ExtractedText

    ExtractedText --> UpdateDB[Perditeso extracted_text ne DB]
    UpdateDB --> ShowDoc[Shfaq ne Documents dhe Chat]

    ShowDoc --> UserQuery{Perdoruesi ben pyetje?}
    UserQuery -->|Po| SendToAI[Dergo te ai-assistant me kontekst]
    SendToAI --> AIResponse[Pergjigje e AI]
    AIResponse --> ShowResponse[Shfaq pergjigjen]

    style Start fill:#f0fdf4,stroke:#16a34a
    style CallEdge fill:#e0f2fe,stroke:#0284c7
    style ExtractedText fill:#d1fae5,stroke:#059669
```

---

## Figura 6: Diagrami i Sekuencës

**Përshkrimi:** Tregon komunikimin midis komponentëve për operacione të ndryshme.

**Përdorimi:** Kapitulli 8 (Integrimet)

```mermaid
sequenceDiagram
    participant U as Perdoruesi
    participant F as Frontend React
    participant S as Supabase
    participant E as Edge Functions
    participant G as Gmail API
    participant AI as Gemini API

    Note over U,AI: Rasti 1: Sinkronizimi i Email-eve

    U->>F: Kliko "Sinkronizo"
    F->>E: POST /sync-gmail
    E->>S: Merr gmail_tokens
    S-->>E: access_token, refresh_token
    E->>G: GET /messages
    G-->>E: Lista e email-eve
    E->>S: INSERT INTO emails
    S-->>E: OK
    E-->>F: {success: true, count: N}
    F-->>U: Shfaq email-et e reja

    Note over U,AI: Rasti 2: Gjenerimi i Pergjigjes

    U->>F: Kliko "Gjenero Pergjigje"
    F->>E: POST /ai-assistant {action: reply}
    E->>AI: Chat Completion Request
    AI-->>E: Pergjigja e gjeneruar
    E-->>F: {result: reply_text}
    F-->>U: Shfaq pergjigjen

    Note over U,AI: Rasti 3: Chat me Streaming

    U->>F: Dergon mesazh ne chat
    F->>E: POST /ai-assistant {action: chat, stream: true}
    E->>AI: Streaming Request
    loop SSE Stream
        AI-->>E: Delta chunk
        E-->>F: data: {delta}
        F-->>U: Shfaq chunk
    end
    E-->>F: data: [DONE]
```

---

## Figura 7: Gjendjet e Drafteve

**Përshkrimi:** State diagram që tregon gjendjet e mundshme të një drafti dhe kalimet.

**Përdorimi:** Kapitulli 5 dhe Kapitulli 7

```mermaid
stateDiagram-v2
    [*] --> DraftIRi: Krijohet nga AI ose manualisht

    DraftIRi --> Redaktim: Perdoruesi ndryshon
    Redaktim --> IRuajtur: Kliko "Ruaj"
    IRuajtur --> Redaktim: Ndryshime te reja

    Redaktim --> IDerguar: Kliko "Dergo"
    IRuajtur --> IDerguar: Kliko "Dergo"
    DraftIRi --> IDerguar: Dergo direkt

    DraftIRi --> IFshire: Kliko "Fshi"
    Redaktim --> IFshire: Kliko "Fshi"
    IRuajtur --> IFshire: Kliko "Fshi"

    IDerguar --> [*]
    IFshire --> [*]

    note right of DraftIRi: Gjendja fillestare
    note right of IDerguar: Email derguar me sukses
    note right of IFshire: Draft i fshire perfundimisht
```

---

## Figura 8: Diagrami i Vendosjes

**Përshkrimi:** Tregon shpërndarjen e komponentëve në infrastrukturën fizike/cloud.

**Përdorimi:** Kapitulli 5 (Arkitektura)

```mermaid
flowchart TB
    subgraph UserDevice["Pajisja e Perdoruesit"]
        Browser["Web Browser<br/>Chrome/Safari/Firefox"]
    end

    subgraph Vercel["Vercel Edge Network"]
        CDN["Global CDN"]
        Static["Static Assets<br/>HTML/JS/CSS"]
    end

    subgraph SupabaseCloud["Supabase Cloud"]
        subgraph Auth["Auth Service"]
            JWT["JWT Tokens"]
            OAuth["OAuth Provider"]
        end
        subgraph Database["Database"]
            Postgres["PostgreSQL 15"]
            RLS["Row Level Security"]
        end
        subgraph StorageService["Storage"]
            Buckets["Storage Buckets"]
        end
        subgraph Functions["Edge Functions"]
            Deno["Deno Runtime"]
        end
    end

    subgraph Google["Google Cloud"]
        GmailAPI["Gmail API"]
        CalendarAPI["Calendar API"]
        GeminiAPI["Gemini API"]
    end

    Browser <-->|HTTPS| CDN
    CDN <--> Static
    Browser <-->|HTTPS| Auth
    Browser <-->|HTTPS| Database
    Browser <-->|HTTPS| StorageService
    Browser <-->|HTTPS| Functions

    Functions <-->|HTTPS + OAuth| GmailAPI
    Functions <-->|HTTPS + OAuth| CalendarAPI
    Functions <-->|HTTPS + API Key| GeminiAPI

    style UserDevice fill:#f3e8ff,stroke:#9333ea
    style Vercel fill:#000000,stroke:#ffffff,color:#ffffff
    style SupabaseCloud fill:#d1fae5,stroke:#059669
    style Google fill:#fef3c7,stroke:#d97706
```

---

## Figura 9: Klasifikimi i Email-eve

**Përshkrimi:** Tregon procesin e klasifikimit të email-eve duke përdorur NLP/LLM.

**Përdorimi:** Kapitulli 6 (Teknikat NLP)

```mermaid
flowchart TD
    subgraph Input["Input"]
        Email["Email (subject + body)"]
    end

    subgraph Preprocessing["Para-perpunimi"]
        Clean["Pastrimi i tekstit"]
        Truncate["Shkurtimi ne 2000 karaktere"]
    end

    subgraph LLM["Google Gemini 1.5 Flash"]
        Prompt["System Prompt:<br/>Ti je nje kategorizes email-esh...<br/>Kategorite: Personale, Pune, Miqesore,<br/>Te rendesishme, Urgjente, Te tjera"]
        Analysis["Analiza e permbajtjes"]
        Classification["Klasifikimi"]
    end

    subgraph Output["Output"]
        Category["Kategoria e caktuar"]
        Confidence["Niveli i sigurise"]
    end

    subgraph UI["Nderfaqja"]
        Badge["Category Badge"]
        Filter["Filtrim sipas kategorise"]
    end

    Email --> Clean --> Truncate --> Prompt
    Prompt --> Analysis --> Classification
    Classification --> Category --> Badge
    Classification --> Confidence --> Filter

    style Input fill:#fef3c7,stroke:#d97706
    style LLM fill:#e0f2fe,stroke:#0284c7
    style Output fill:#d1fae5,stroke:#059669
```

### Shembull i Prompt-it për Kategorizim:

```
You are an email categorizer. For each email provided, assign exactly one category:
- Personale: from family, close friends, personal matters
- Punë: from colleagues, clients, work projects
- Miqësore: from friends, informal tone
- Të rëndësishme: contains deadlines, critical information
- Urgjente: requires action within 24 hours
- Të tjera: anything else

Return JSON: [{"id": "email_id", "category": "category_name"}]
```

---

## Figura 10: Përmbledhja e Email-eve

**Përshkrimi:** Tregon procesin e gjenerimit të përmbledhjeve me AI.

**Përdorimi:** Kapitulli 6 (Teknikat NLP)

```mermaid
flowchart TD
    subgraph Input["Email Thread"]
        Emails["1+ email-e ne thread"]
    end

    subgraph Processing["Perpunimi"]
        Combine["Kombinimi i permbajtjes"]
        Context["Shtimi i kontekstit:<br/>- Sender<br/>- Date<br/>- Subject"]
    end

    subgraph LLM["Google Gemini"]
        SumPrompt["System Prompt:<br/>Permblidh kete thread...<br/>Jep: titull, permbledhje 2-3 fjali,<br/>action items"]
        Generate["Gjenerimi i permbledhjes"]
    end

    subgraph Output["Output"]
        Title["Titulli i thread-it"]
        Summary["Permbledhja koncize"]
        Actions["Action Items"]
    end

    subgraph Storage["Ruajtja"]
        DB[(email_summaries)]
    end

    Emails --> Combine --> Context --> SumPrompt
    SumPrompt --> Generate
    Generate --> Title
    Generate --> Summary
    Generate --> Actions
    Summary --> DB
    Actions --> DB

    style Input fill:#fef3c7,stroke:#d97706
    style LLM fill:#e0f2fe,stroke:#0284c7
    style Output fill:#d1fae5,stroke:#059669
```

---

## Figura 11: Use Case Diagram

**Përshkrimi:** Tregon aktorët dhe rastet e përdorimit të sistemit.

**Përdorimi:** Kapitulli 5 (Arkitektura)

```mermaid
flowchart LR
    subgraph Actors["Aktoret"]
        User((Perdorues i<br/>Autentikuar))
        Guest((Vizitor))
        Gmail((Gmail API))
        AI((Gemini AI))
    end

    subgraph UseCases["Rastet e Perdorimit"]
        subgraph Auth["Autentikimi"]
            UC1[Login me Google]
            UC2[Logout]
        end

        subgraph EmailMgmt["Menaxhimi i Email-eve"]
            UC3[Sinkronizo Inbox]
            UC4[Lexo Email]
            UC5[Kategorizo Email]
            UC6[Permblidh Thread]
            UC7[Gjenero Pergjigje]
        end

        subgraph DocMgmt["Dokumentet"]
            UC8[Ngarko Dokument]
            UC9[Analizo Dokument]
        end

        subgraph Calendar["Kalendari"]
            UC10[Shiko Evente]
            UC11[Krijo Event]
        end

        subgraph AIChat["AI Chat"]
            UC12[Bisedo me AI]
            UC13[Pyet per Email]
        end
    end

    Guest --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9
    User --> UC10
    User --> UC11
    User --> UC12
    User --> UC13

    UC3 -.-> Gmail
    UC5 -.-> AI
    UC6 -.-> AI
    UC7 -.-> AI
    UC9 -.-> AI
    UC12 -.-> AI
    UC13 -.-> AI

    style User fill:#d1fae5,stroke:#059669
    style Guest fill:#fef3c7,stroke:#d97706
    style Gmail fill:#fee2e2,stroke:#dc2626
    style AI fill:#e0f2fe,stroke:#0284c7
```

---

## Figura 12: ER Diagram (Databaza)

**Përshkrimi:** Tregon strukturën e bazës së të dhënave dhe marrëdhëniet mes tabelave.

**Përdorimi:** Kapitulli 5 (Arkitektura)

```mermaid
erDiagram
    profiles {
        uuid id PK
        text email
        text full_name
        text avatar_url
        timestamp created_at
    }

    gmail_tokens {
        uuid id PK
        uuid user_id FK
        text access_token
        text refresh_token
        timestamp token_expires_at
        timestamp created_at
        timestamp updated_at
    }

    emails {
        uuid id PK
        uuid user_id FK
        text gmail_id
        text thread_id
        text from_email
        text to_email
        text subject
        text body
        text snippet
        text category
        boolean is_read
        boolean is_starred
        timestamp created_at
    }

    email_summaries {
        uuid id PK
        uuid user_id FK
        uuid email_id FK
        text summary
        timestamp created_at
    }

    ai_replies {
        uuid id PK
        uuid user_id FK
        uuid email_id FK
        text to_email
        text subject
        text reply_text
        timestamp created_at
    }

    documents {
        uuid id PK
        uuid user_id FK
        text name
        text file_url
        text file_type
        bigint file_size
        text extracted_text
        timestamp created_at
    }

    calendar_events {
        uuid id PK
        uuid user_id FK
        text title
        text description
        text location
        text category
        timestamp start_date
        timestamp end_date
        jsonb participants
        timestamp created_at
    }

    inbox_messages {
        uuid id PK
        uuid user_id FK
        uuid sender FK
        uuid recipient FK
        text subject
        text body
        boolean is_read
        timestamp created_at
    }

    user_settings {
        uuid id PK
        uuid user_id FK
        boolean gmail_connected
        boolean calendar_connected
        timestamp created_at
    }

    profiles ||--o{ gmail_tokens : "ka"
    profiles ||--o{ emails : "zoteron"
    profiles ||--o{ documents : "ngarkon"
    profiles ||--o{ calendar_events : "krijon"
    profiles ||--o{ user_settings : "konfiguren"
    profiles ||--o{ inbox_messages : "dergon/merr"
    emails ||--o{ email_summaries : "permbledhet"
    emails ||--o{ ai_replies : "pergjigjet"
```

---

## Figura 13: AI Chatbot Flow

**Përshkrimi:** Tregon logjikën e AI Chatbot me streaming dhe kontekst.

**Përdorimi:** Kapitulli 6 dhe Kapitulli 7

```mermaid
flowchart TD
    Start([Perdoruesi hap Chat]) --> LoadHistory[Ngarko historikun e bisedes]
    LoadHistory --> WaitInput[Prit per input]

    WaitInput --> UserMsg[Perdoruesi shkruan mesazh]
    UserMsg --> CheckContext{Ka kontekst?}

    CheckContext -->|Dokument i ngarkuar| AddDocContext[Shto tekstin e dokumentit]
    CheckContext -->|Email i zgjedhur| AddEmailContext[Shto permbajtjen e email-it]
    CheckContext -->|Jo| PrepareMsg[Pergatit mesazhin]

    AddDocContext --> PrepareMsg
    AddEmailContext --> PrepareMsg

    PrepareMsg --> BuildMessages[Nderzo array messages:<br/>system + history + user]
    BuildMessages --> CallAI[POST /ai-assistant<br/>action: chat, stream: true]

    CallAI --> InitStream[Inicializo SSE stream]
    InitStream --> ReadChunk{Lexo chunk}

    ReadChunk -->|Delta| AppendText[Shto tekstin ne UI]
    AppendText --> ReadChunk

    ReadChunk -->|DONE| SaveResponse[Ruaj pergjigjen ne historik]
    SaveResponse --> WaitInput

    ReadChunk -->|Error| ShowError[Shfaq gabimin]
    ShowError --> WaitInput

    style Start fill:#f0fdf4,stroke:#16a34a
    style CallAI fill:#e0f2fe,stroke:#0284c7
    style AppendText fill:#fef3c7,stroke:#d97706
```

---

## Figura 14: Component Diagram

**Përshkrimi:** Tregon organizimin e kodit në komponentë dhe module.

**Përdorimi:** Kapitulli 5 dhe Kapitulli 7

```mermaid
flowchart TB
    subgraph Frontend["Frontend Layer"]
        subgraph Pages["Faqet (src/pages)"]
            Index["Index.tsx"]
            AuthPage["Auth.tsx"]
            DashboardPage["Dashboard.tsx"]
            Privacy["Privacy.tsx"]
            Terms["Terms.tsx"]
        end

        subgraph DashboardComponents["Dashboard Components"]
            Inbox["InboxPage"]
            EmailParser["EmailParserPage"]
            ReplyGen["ReplyGeneratorPage"]
            Summaries["SummariesPage"]
            Calendar["CalendarPage"]
            Documents["DocumentsPage"]
            AIChat["AIChatbotPage"]
            Drafts["DraftsPage"]
            Settings["SettingsPage"]
        end

        subgraph UIComponents["UI Components (shadcn)"]
            Button["Button"]
            Card["Card"]
            Dialog["Dialog"]
            Input["Input"]
            Select["Select"]
            Table["Table"]
        end

        subgraph Lib["Utilities (src/lib)"]
            StreamChat["streamChat.ts"]
            Utils["utils.ts"]
        end
    end

    subgraph Backend["Backend Layer"]
        subgraph EdgeFunctions["Edge Functions"]
            AIAssistant["ai-assistant<br/>- chat<br/>- parse<br/>- reply<br/>- summarize<br/>- categorize<br/>- proofread"]
            SyncGmail["sync-gmail<br/>- fetch emails<br/>- refresh tokens"]
            ProcessDocument["process-document<br/>- extract text<br/>- parse PDF/DOCX"]
            DisconnectGmail["disconnect-gmail<br/>- revoke tokens"]
        end

        subgraph SupabaseServices["Supabase Services"]
            AuthService["Auth Service"]
            DatabaseService["Database Service"]
            StorageService["Storage Service"]
            RealtimeService["Realtime Service"]
        end
    end

    Pages --> DashboardComponents
    DashboardComponents --> UIComponents
    DashboardComponents --> Lib
    DashboardComponents --> EdgeFunctions
    DashboardComponents --> SupabaseServices

    style Frontend fill:#e0f2fe,stroke:#0284c7
    style Backend fill:#d1fae5,stroke:#059669
```

---

## Figura 15: AI Proofreader Flow

**Përshkrimi:** Tregon procesin e korrigjimit të drafteve me AI.

**Përdorimi:** Kapitulli 6 dhe Kapitulli 7

```mermaid
flowchart TD
    Start([Perdoruesi hap Draft]) --> LoadDraft[Ngarko tekstin e draftit]
    LoadDraft --> ClickProofread[Kliko 'Kontrollo me AI']

    ClickProofread --> SendToAI[POST /ai-assistant<br/>action: proofread]
    SendToAI --> AIAnalysis[Gemini analizon tekstin]

    AIAnalysis --> CheckErrors{Ka gabime?}

    CheckErrors -->|Jo| NoIssues[Shfaq: Teksti eshte i sakte]
    NoIssues --> End([Fund])

    CheckErrors -->|Po| ParseIssues[Analizo JSON response]
    ParseIssues --> ShowIssues[Shfaq listen e gabimeve]

    ShowIssues --> ForEachIssue[Per cdo gabim:]
    ForEachIssue --> ShowOriginal[Trego tekstin origjinal]
    ForEachIssue --> ShowSuggestion[Trego sugjerimin]
    ForEachIssue --> ShowExplanation[Trego shpjegimin]

    ForEachIssue --> UserChoice{Perdoruesi zgjedh?}
    UserChoice -->|Apliko| ApplyFix[Zevendeso ne tekst]
    UserChoice -->|Injoro| IgnoreFix[Kalo gabimin]
    UserChoice -->|Apliko te gjitha| ApplyAll[Zevendeso te gjitha]

    ApplyFix --> UpdateDraft[Perditeso draftin]
    ApplyAll --> UpdateDraft
    IgnoreFix --> NextIssue{Ka gabime te tjera?}
    UpdateDraft --> NextIssue

    NextIssue -->|Po| ForEachIssue
    NextIssue -->|Jo| SaveDraft[Ruaj draftin e korrigjuar]
    SaveDraft --> End

    style Start fill:#f0fdf4,stroke:#16a34a
    style AIAnalysis fill:#e0f2fe,stroke:#0284c7
    style ShowIssues fill:#fef3c7,stroke:#d97706
```

### Formati i JSON Response nga AI Proofreader:

```json
{
  "issues": [
    {
      "original": "teksti me gabim",
      "suggestion": "teksti i korrigjuar",
      "explanation": "Arsyeja e korrigjimit"
    }
  ],
  "corrected_text": "Teksti i plote i korrigjuar"
}
```

---

## Referencat e Kapitujve

| Figura | Kapitulli 5 | Kapitulli 6 | Kapitulli 7 | Kapitulli 8 |
|--------|-------------|-------------|-------------|-------------|
| 1. Arkitektura | ✅ | | | |
| 2. OAuth Flow | ✅ | | | ✅ |
| 3. Data Flow | ✅ | | | |
| 4. Email Processing | | ✅ | ✅ | |
| 5. Document Processing | | | ✅ | ✅ |
| 6. Sequence Diagram | | | | ✅ |
| 7. State Diagram | ✅ | | ✅ | |
| 8. Deployment | ✅ | | | |
| 9. NLP Classification | | ✅ | | |
| 10. Summarization | | ✅ | | |
| 11. Use Case | ✅ | | | |
| 12. ER Diagram | ✅ | | | |
| 13. Chatbot Flow | | ✅ | ✅ | |
| 14. Component Diagram | ✅ | | ✅ | |
| 15. Proofreader Flow | | ✅ | ✅ | |

---

## Si të Përdorni Këto Diagrame

1. **Në LaTeX/Word**: Kopjoni kodin Mermaid dhe përdorni një tool si [Mermaid Live Editor](https://mermaid.live/) për të eksportuar si PNG/SVG
2. **Në Markdown**: Diagramet renderohen automatikisht në GitHub dhe shumë platforma të tjera
3. **Për printim**: Eksportoni në rezolucion të lartë (2x) për cilësi optimale

---

*Dokumenti u krijua automatikisht për projektin MailMind - Tema e Diplomës 2024*
