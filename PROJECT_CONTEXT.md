# Logio — Project Context

## What This Is
Logio is a gut health / poop tracking web app built with Next.js, intended to be wrapped with Capacitor for Play Store and App Store distribution.

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Nova preset, Stone palette) |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (via @supabase/ssr) |
| Forms | React Hook Form + Zod + @hookform/resolvers |
| Dates | date-fns |
| LLM | Configurable — Gemini or OpenAI (set via LLM_PROVIDER env var) |
| Mobile | Capacitor (future — wraps this Next.js app) |

## Folder Structure
```
src/
  app/          Next.js App Router pages and layouts
  components/   Shared UI components
  lib/          Utilities, Supabase client, LLM client
  types/        TypeScript type definitions
```

## Environment Variables
| Variable | Purpose |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous key (safe for browser) |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key (server-only) |
| LLM_PROVIDER | "gemini" or "openai" |
| GEMINI_API_KEY | Google Gemini API key |
| OPENAI_API_KEY | OpenAI API key |

## Key Decisions
- **shadcn/ui Nova preset + Stone color palette** — warm neutral tone chosen for health/wellness feel, avoids generic blue
- **legacy-peer-deps=true in .npmrc** — needed due to ESLint 8/9 version conflict between create-next-app@14 and shadcn's latest installer
- **src/ directory** — all source code lives under src/ for clean separation from config files
