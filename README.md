# 🕷️ Project Spider-Sense
### *Work-Life Balance Task Management System for Everyday People (Spider-Man Themed)*
#### *Powered by Autonomous AI Agents, Multimodal Vision, Tool Calling, and Local LLMs*

> *"With great responsibility comes great responsibility... to yourself."*

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Multimodal AI](https://img.shields.io/badge/AI-Multimodal%20Vision-purple?logo=google)](https://deepmind.google/technologies/gemini/)
[![AI Agents](https://img.shields.io/badge/AI%20Agent-Tool%20Calling-red?logo=openai)](https://openai.com/)
[![Local LLMs](https://img.shields.io/badge/Local%20LLM-Ollama%20Ready-green?logo=ollama)](https://ollama.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Executive Summary

**Project Spider-Sense** is a full-stack task management and productivity application **built for everyday people** (professionals, developers, students, freelancers, and parents) who struggle to maintain healthy work-life balance.

The application uses the Spider-Man universe as an engaging psychological metaphor and visual theme:

1. 🏠 **Peter Parker Mode (Personal Life & Wellness):** Everyday human obligations—groceries, family calls, doctor checkups, home chores, gym workouts, hobbies, and relaxation.
2. 💼 **Spider-Man Mode (Career & Professional Work):** High-focus deliverables—sprint deadlines, code reviews, client presentations, project budgets, and deep work sessions.

---

## 🧠 Advanced GenAI Architecture

Project Spider-Sense incorporates the most cutting-edge GenAI paradigms:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Spider-Sense Autonomous Agent                        │
├────────────────────────────────┬───────────────────────────────────────┤
│ 👁️ Multimodal Vision           │ Transcribes handwritten sticky notes, │
│    (Gemini / GPT-4o Vision)    │ whiteboards, paper planners & screens │
├────────────────────────────────┼───────────────────────────────────────┤
│ 📚 Contextual Retrieval (RAG)  │ Ingests active database workload state│
│    (Task History & Balance)    │ into real-time reasoning memory       │
├────────────────────────────────┼───────────────────────────────────────┤
│ 🛠️ Tool Calling Pipeline       │ • retrieve_task_context               │
│    (Structured Action Exec)    │ • multimodal_vision_ocr               │
│                                │ • route_dual_persona                  │
│                                │ • schedule_smart_reminders            │
│                                │ • evaluate_equilibrium_burnout        │
├────────────────────────────────┼───────────────────────────────────────┤
│ 💻 Local LLM & Cloud Hybrid    │ Cloud (Gemini/OpenAI) + Local (Ollama)│
│    (Zero-Latency Resilience)   │ + Offline Heuristic NLP Engine        │
└────────────────────────────────┴───────────────────────────────────────┘
```

### 1. 👁️ Multimodal AI (Vision Ingestion)
* **Photo Ingestion:** Snap or upload a photo of handwritten notes, sticky notes on your monitor, a paper planner, or a whiteboard brainstorm.
* **Vision Transcription:** The multimodal model reads the handwriting, isolates tasks, categorizes them into Peter vs. Spider modes, and populates your dashboard automatically.

### 2. 🤖 Autonomous Agent & Tool Calling
* Rather than a generic text chatbot, the **Spider-Sense Agent** executes discrete tools:
  * `multimodal_vision_ocr`: Reads visual input.
  * `retrieve_task_context`: Pulls active pending tasks from the database.
  * `route_dual_persona`: Classifies each item into Life (`PETER`) or Work (`SPIDER`).
  * `schedule_smart_reminders`: Automatically sets reminder offsets prior to deadlines.
  * `evaluate_equilibrium_burnout`: Triggers proactive preventative burnout alerts.

### 3. 📚 Contextual Retrieval (RAG)
* When you submit a brain dump or note photo, the agent retrieves your active database context (pending work ratio, overdue personal tasks, completion velocity) so it reasons with full context of your current week.

### 4. 💻 Local LLM & Ollama Ready
* **Local Privacy First:** Configure `OLLAMA_BASE_URL="http://localhost:11434/v1"` to run models like Llama 3.2, Mistral, or Gemma 2 locally with 100% data privacy.
* **Offline Fallback Engine:** Built-in heuristic NLP processor ensures zero-crash performance even without internet or API keys.

---

## 🌟 Key Application Features

### 1. 🔄 Dual-Phase Mode Switcher
* **Peter Parker Theme:** Cozy Queens aesthetic with warm ambers, honey golds, and newsprint paper textures. Designed to evoke relaxation and personal care.
* **Spider-Man Theme:** High-contrast Stark crimson red, deep midnight navy, and web-mesh patterns. Designed for high focus, ambition, and deep work.
* **Multiverse Dual-View:** A split-screen layout displaying both your personal errands and your professional deliverables side-by-side.

### 2. 🔔 Real-Time Reminders & Desktop Push
* **Schedule Reminders:** Add target deadlines and specific reminder times to any task.
* **Browser Desktop Notifications:** Native push alerts when deadlines approach.
* **In-App Spider-Sense Toast:** Visual popups with sound alerts (`sound.playSpiderSenseTingle()`).

### 3. 🕸️ Central "Web of Life" Balance Chart
* Dynamic SVG spider-web radar chart tracking 8 real-world dimensions:
  * *Career & Work:* Deadlines, Engineering, Strategy, Meetings/Clients
  * *Personal & Life:* Home & Errands, Family & Friends, Health & Wellness, Rest & Hobbies
* Displays a real-time **Equilibrium Score (0–100%)** so you always know if you're overworking.

### 4. 📊 Work Stamina & Wellness Meters
* **Work Stamina Meter:** Fills up as professional deliverables are completed.
* **Personal Wellness Meter:** Fills up as health, home errands, and family tasks are completed.
* **Synthesized Audio:** Built-in Web Audio API generating comic `THWIP!` effects and alert chimes without external audio dependencies.

---

## 🗄️ Database Schema (`prisma/schema.prisma`)

```prisma
enum Mode {
  PETER   // Personal, Family, Self-Care, Errands, Health, Hobbies
  SPIDER  // Work, Career, Deadlines, Deep Work, Deliverables
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
  id           String    @id @default(cuid())
  title        String
  description  String?
  mode         Mode      @default(PETER)
  status       Status    @default(PENDING)
  priority     Priority  @default(MEDIUM)
  category     String?
  deadline     DateTime?
  reminderTime DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([mode])
  @@index([status])
}
```

---

## 🚀 Getting Started

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/KD0-7/TCB.git
cd TCB

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

```env
# Cloud Vision & Reasoning (Gemini or OpenAI):
GEMINI_API_KEY="your-gemini-api-key"
# OR
OPENAI_API_KEY="your-openai-api-key"

# Optional: Local LLM (Ollama)
OLLAMA_BASE_URL="http://localhost:11434/v1"
LOCAL_LLM_MODEL="llama3.2"

# Optional Database (PostgreSQL / Neon / Supabase):
DATABASE_URL="postgresql://user:password@localhost:5432/spidersense?schema=public"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🌐 Deploy to Vercel

1. Push your changes to GitHub: `https://github.com/KD0-7/TCB`.
2. Connect your repository on [Vercel](https://vercel.com/new).
3. Add environment variables: `GEMINI_API_KEY` or `OPENAI_API_KEY`.
4. Click **Deploy**.

---

## 📄 License
Released under the [MIT License](LICENSE). Built for everyday heroes striving for work-life balance.
