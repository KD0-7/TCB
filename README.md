# 🕷️ Project Spider-Sense
### *Work-Life Balance Task Management System for Everyday People (Spider-Man Themed)*

> *"With great responsibility comes great responsibility... to yourself."*

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![GenAI](https://img.shields.io/badge/GenAI-Gemini%20%2F%20OpenAI-orange?logo=google)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Executive Summary

**Project Spider-Sense** is a full-stack task management and productivity application **built for everyday people** (professionals, developers, students, freelancers, and parents) who struggle to maintain healthy work-life balance.

Rather than being a fictional comic roleplay, **the application uses the Spider-Man universe as an engaging psychological metaphor and visual theme**:

1. 🏠 **Peter Parker Mode (Personal Life & Wellness):** For everyday human obligations—groceries, family calls, doctor/dentist checkups, home chores, gym workouts, hobbies, and relaxation.
2. 💼 **Spider-Man Mode (Career & Professional Work):** For high-focus deliverables—sprint deadlines, code reviews, client presentations, project budgets, and deep work sessions.

---

## 🌟 Key Features for Everyday Users

### 1. 🔄 Dual-Phase Mode Switcher & Theming
* **Peter Parker Theme:** Cozy Queens aesthetic with warm ambers, honey golds, and newsprint paper textures. Designed to evoke relaxation and personal life care.
* **Spider-Man Theme:** High-contrast Stark crimson red, deep midnight navy, and web-mesh patterns. Designed for high focus, ambition, and deep work.
* **Multiverse Dual-View:** A split-screen layout displaying both your personal errands and your professional deliverables side-by-side.

### 2. 🔔 Real-Time Reminders & Push Notifications
* **Schedule Reminders:** Add target deadlines and specific reminder times to any task (e.g. *"Today at 3:00 PM (30 min before)"*).
* **Browser Desktop Notifications:** Request desktop notification permissions to receive system push reminders when tasks are due.
* **In-App Spider-Sense Toasts:** Immediate visual alert with audio cues (`sound.playSpiderSenseTingle()`) when approaching deadlines.
* **Interactive 1-Click Complete:** Mark tasks complete directly from the reminder toast with a satisfying web sound (`THWIP!`) and celebratory confetti.

### 3. 🧠 GenAI "Spider-Sense AI" Task Ingestion & Monitor
* **Messy Brain-Dump Box:** Instead of creating tasks one-by-one, dump your disorganized thoughts (e.g. *"Need to finish client presentation slides by 3 PM, buy groceries for dinner, review code pull requests, and book a dentist appointment for tomorrow."*).
* **Automatic Separation:** The GenAI parses each item, auto-categorizes it into Work (`SPIDER`) or Personal (`PETER`), assigns priority (`HIGH`, `MEDIUM`, `LOW`), extracts deadlines, and sets up reminders.
* **Workaholic Overload Warning:** If work tasks heavily dominate (>= 70%) while personal wellness is neglected, the AI triggers a **Spider-Sense Tingling Alert** with witty, compassionate advice reminding you that *"with great responsibility comes great responsibility to yourself."*
* **Multi-Engine Support:** Works out of the box with **Google Gemini API**, **OpenAI API**, or the built-in **Offline Heuristic NLP Engine**.

### 4. 🕸️ Central "Web of Life" Balance Chart
* Dynamic SVG spider-web radar chart tracking 8 real-world dimensions:
  * *Career & Work:* Deadlines, Engineering, Strategy, Meetings/Clients
  * *Personal & Life:* Home & Errands, Family & Friends, Health & Wellness, Rest & Hobbies
* Displays a real-time **Equilibrium Score (0–100%)** so you always know if you're overworking.

### 5. 📊 Work Stamina & Wellness Meters
* **Work Stamina Meter:** Fills up as professional deliverables are completed.
* **Personal Wellness Meter:** Fills up as health, home errands, and family tasks are completed.
* **Audio Synthesizer:** Built-in Web Audio API generating comic `THWIP!` effects and alert chimes without external audio dependencies.

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

Set your API keys (optional; the offline heuristic engine works immediately without keys):
```env
# GenAI Provider (Google Gemini or OpenAI):
GEMINI_API_KEY="your-gemini-api-key"
# OR
OPENAI_API_KEY="your-openai-api-key"

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
