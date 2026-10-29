# 🕷️ Project Spider-Sense
### *Dual-Phase Work-Life Balance Task Management System with GenAI Behavioral Monitoring*

> *"With great power comes great responsibility... to yourself."*

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/GenAI-Gemini%20%2F%20OpenAI-orange?logo=google)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Executive Summary

**Project Spider-Sense** is an intelligent, dual-phase task management web application designed to solve the critical modern problem of work-life burnout. Heavily themed around the Spider-Man universe, the app separates tasks into two global operating modes:

1. 📸 **Peter Parker Mode (Life / Self-Care):** Personal wellness, family obligations (Aunt May), hobbies, freelance photography, apartment errands, and Joe's Pizza runs.
2. 🕷️ **Spider-Man Mode (Work / Heroics):** High-priority Oscorp deliverables, Avengers nanotech collaboration, emergency deadlines, and city patrols.

Beyond simple CRUD lists, the app introduces **"Spider-Sense AI"**—an LLM-powered behavioral monitor that transforms chaotic morning brain dumps into structured tasks and **actively warns users in real-time when work-life imbalance becomes hazardous**.

---

## 🌟 Key Features

### 1. 🔄 Global Animated Dual-Phase Mode Switcher
* **Peter Parker Theme:** Cozy Queens apartment aesthetic, warm amber/yellow and newsprint palette, friendly casual typography, camera/pizza/backpack iconography.
* **Spider-Man Theme:** High-contrast Stark crimson red, deep midnight navy, web patterns, sleek futuristic HUD styling.
* **Multiverse Split View:** Side-by-side dual columns displaying Peter's life errands alongside Spider-Man's work missions simultaneously.

### 2. 🕸️ Central "Web of Life" Balance Chart
* Dynamic SVG concentric spider-web radar chart tracking 8 life and career dimensions.
* Real-time **Equilibrium Score (0–100%)** and visual dual-sided balance gauge.
* Tracks pending vs. completed tasks across both dimensions.

### 3. ⚡ The Spider-Sense GenAI Brain-Dump
* **Chaos Ingestion:** Users drop a single disorganized paragraph of daily to-dos.
* **Intelligent Parsing:** The GenAI extracts distinct tasks, auto-assigns mode (`PETER` vs `SPIDER`), determines priority (`HIGH`, `MEDIUM`, `LOW`), extracts deadlines, and tags categories.
* **Spider-Sense Workload & Burnout Warning:** If work missions exceed 70% of total workload or personal wellness is neglected, a comic-book style tingling alert fires with personalized, witty voice-of-Spider-Man advice.
* **Zero-Crash Resilience:** Works with **Google Gemini API**, **OpenAI API**, or the high-performance **Offline Spider-Sense Heuristic Engine** if no API keys are present.

### 4. 📊 Biometric Productivity Trackers
* **Web-Shooter Fluid Gauge:** 0–100% capacity bar that charges as work tasks are completed.
* **Aunt May's Peace of Mind Meter:** Visual heart meter tracking personal wellness and family errands.
* **Synthesized Web Audio Effects:** Built-in Web Audio API synthesizer for the comic-book `THWIP!` sound and Spider-Sense pulse alerts.

---

## 🏗️ Architecture & Tech Stack

```
                                  ┌───────────────────────────────┐
                                  │      Client Web Interface     │
                                  │  (Next.js App Router + React) │
                                  └───────────────┬───────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
   ┌───────────────────────────┐                                     ┌───────────────────────────┐
   │    Task CRUD API Engine   │                                     │   Spider-Sense GenAI AI   │
   │      (/api/tasks)         │                                     │   (/api/spider-sense)     │
   └─────────────┬─────────────┘                                     └─────────────┬─────────────┘
                 │                                                                 │
                 ▼                                                                 ▼
   ┌───────────────────────────┐                                     ┌───────────────────────────┐
   │  Prisma / Storage Engine  │                                     │  Gemini / OpenAI / Heur.  │
   │ (PostgreSQL + Local Cache)│                                     │  (Behavioral Monitor)     │
   └───────────────────────────┘                                     └───────────────────────────┘
```

* **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, Canvas-Confetti, Web Audio API.
* **Backend:** Next.js Route Handlers (`/api/tasks`, `/api/tasks/[id]`, `/api/spider-sense`, `/api/tasks/seed`).
* **Database & ORM:** Prisma Schema (`prisma/schema.prisma`) configured for PostgreSQL, with an automatic resilient local storage engine for instant offline demoing.
* **GenAI Providers:** Google Gemini 1.5/2.5 Flash, OpenAI GPT-4o-mini, and built-in Spider-Sense NLP Heuristic fallback.

---

## 🗄️ Database Schema (`prisma/schema.prisma`)

```prisma
enum Mode {
  PETER
  SPIDER
}

enum Status {
  PENDING
  COMPLETED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  mode        Mode      @default(PETER)
  status      Status    @default(PENDING)
  priority    Priority  @default(MEDIUM)
  category    String?
  deadline    DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([mode])
  @@index([status])
}
```

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js 18.18+ or 20+ (Node v24 supported)
* npm, pnpm, or yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/KD0-7/TCB.git
cd TCB

# Install dependencies
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
# Optional: Database Connection for PostgreSQL (Neon / Supabase / Render / Vercel Postgres)
DATABASE_URL="postgresql://spiderman:webshooter123@localhost:5432/spidersense?schema=public"

# GenAI Integration (Provide at least one; falls back gracefully to Heuristic Engine if omitted):
GEMINI_API_KEY="your-gemini-api-key"
# OR
OPENAI_API_KEY="your-openai-api-key"
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 🌐 Deploy to Vercel

Deploying to Vercel takes under 2 minutes:

1. Push this repository to your GitHub account (`https://github.com/KD0-7/TCB`).
2. Visit [vercel.com/new](https://vercel.com/new) and import your `TCB` repository.
3. In **Environment Variables**, add:
   * `GEMINI_API_KEY` or `OPENAI_API_KEY`
   * *(Optional)* `DATABASE_URL` (e.g. from Vercel Postgres, Neon, or Supabase)
4. Click **Deploy**. Vercel will build and launch Project Spider-Sense globally on the Edge Network!

---

## 🎤 Strategic Advice for Hackathon Pitch & Live Demo

1. **The Hook:**
   * Start your pitch by showing a chaotic, unformatted paragraph of daily tasks on screen.
   * Ask the judges: *"Who feels like this every morning?"*
2. **The Demo:**
   * Click **"🎯 The Classic Chaos"** preset in the Spider-Sense Brain Dump box.
   * Hit **"Activate Spider-Sense AI"**. Watch it instantly parse and partition tasks into Peter (Life) and Spider-Man (Work) cards.
3. **The "Aha" Moment:**
   * Click the **"⚡ Crunch Overload"** preset (or click *⚡ Trigger Overload Scenario Now* in the floating Pitch Guide).
   * Demonstrate the **Spider-Sense Tingling Alert** firing with live audio/visual effects and Spider-Man's witty advice reminding the user that *"with great power comes great responsibility... to yourself."*
4. **The Architecture Pitch:**
   * Explain to the judges: GenAI isn't just a chatbot widget—it acts as an active **behavioral governor** enforcing equilibrium in real time.

---

## 📄 License
Released under the [MIT License](LICENSE). Built for hackathons, developers, and friendly neighborhood heroes everywhere!
