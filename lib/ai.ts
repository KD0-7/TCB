import { Task, TaskMode, TaskPriority, SpiderSenseAnalysis } from './types';

interface BrainDumpPayload {
  text: string;
  existingTasks?: Task[];
}

export async function processSpiderSenseBrainDump(payload: BrainDumpPayload): Promise<SpiderSenseAnalysis> {
  const { text, existingTasks = [] } = payload;
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error('Brain dump text cannot be empty');
  }

  // 1. Try Google Gemini API if GEMINI_API_KEY is available
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    try {
      const result = await callGeminiAPI(trimmed, existingTasks, geminiKey);
      if (result) return result;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to OpenAI or Heuristic Engine:', err);
    }
  }

  // 2. Try OpenAI API if OPENAI_API_KEY is available
  const openAIKey = process.env.OPENAI_API_KEY;
  if (openAIKey) {
    try {
      const result = await callOpenAIAPI(trimmed, existingTasks, openAIKey);
      if (result) return result;
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to Heuristic Engine:', err);
    }
  }

  // 3. Robust Built-in Spider-Sense Heuristic NLP Engine (Guaranteed zero-crash demo for real people)
  return runHeuristicSpiderSense(trimmed, existingTasks);
}

// -------------------------------------------------------------
// OpenAI Implementation
// -------------------------------------------------------------
async function callOpenAIAPI(text: string, existingTasks: Task[], apiKey: string): Promise<SpiderSenseAnalysis> {
  const systemPrompt = buildSystemPrompt(existingTasks);
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Here is my daily to-do brain dump:\n"${text}"` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI HTTP ${response.status}: ${errorBody}`);
  }

  const json = await response.json();
  const rawContent = json.choices?.[0]?.message?.content;
  const parsed = JSON.parse(rawContent);

  return sanitizeAIOutput(parsed, text, existingTasks, 'openai');
}

// -------------------------------------------------------------
// Google Gemini Implementation
// -------------------------------------------------------------
async function callGeminiAPI(text: string, existingTasks: Task[], apiKey: string): Promise<SpiderSenseAnalysis> {
  const systemPrompt = buildSystemPrompt(existingTasks);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nUser Brain Dump:\n"${text}"\n\nProvide the response strictly as valid raw JSON matching the required schema.` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini HTTP ${response.status}: ${errorBody}`);
  }

  const json = await response.json();
  const candidate = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidate) throw new Error('No candidate returned from Gemini');

  const parsed = JSON.parse(candidate);
  return sanitizeAIOutput(parsed, text, existingTasks, 'gemini');
}

// -------------------------------------------------------------
// Shared Prompt Builder (For Everyday People, Spider-Man Themed)
// -------------------------------------------------------------
function buildSystemPrompt(existingTasks: Task[]): string {
  const existingSpider = existingTasks.filter(t => t.mode === 'SPIDER' && t.status === 'PENDING').length;
  const existingPeter = existingTasks.filter(t => t.mode === 'PETER' && t.status === 'PENDING').length;

  return `You are "Spider-Sense AI", an intelligent behavioral monitor and work-life balance guardian built for everyday people (professionals, students, creators, and busy parents).
The Spider-Man universe is used as an engaging, motivational theme and metaphor:
- "PETER" mode: Personal Life, Self-Care, Family & Friends, Health, Medical/Doctor, Groceries, Fitness, Errands, Chores, Hobbies, and Relaxation.
- "SPIDER" mode: Professional Work, Career Deadlines, Deep Work, Client Projects, Coding/Engineering, Meetings, Admin, and High-Priority Deliverables.

The user is a normal real-world person organizing their daily tasks.

Your mission:
1. Parse chaotic unstructured daily brain dumps into individual, clean, actionable tasks.
2. Auto-categorize each task into:
   - "PETER" mode: For personal life, home, self-care, family, health.
   - "SPIDER" mode: For career, job, projects, deadlines, clients.
3. Assign priority: "LOW", "MEDIUM", or "HIGH".
4. Extract explicit or implicit deadlines/times (e.g. "3 PM", "by 5", "tomorrow morning", or null).
5. Suggest realistic reminder times (e.g. 30 minutes before deadlines, or specific time if mentioned).
6. Assign a concise category tag (e.g. "Work / Strategy", "Work / Engineering", "Life / Health", "Life / Groceries", "Life / Family", "Life / Fitness").

WORKLOAD & BURNOUT MONITORING:
Current active workload already on the user's board:
- Work (Spider Mode) pending tasks: ${existingSpider}
- Personal Life (Peter Mode) pending tasks: ${existingPeter}

Analyze the combined workload of existing tasks + newly extracted tasks.
If the ratio of Work (Spider) tasks is >= 65% of total, OR if there are 4+ work tasks and 0-1 personal tasks, or if the user has zero rest/food/exercise scheduled:
- Set warningTriggered = true
- Set warningTitle = "SPIDER-SENSE WARNING: WORKAHOLIC OVERLOAD DETECTED!"
- Set warningMessage = A personalized, witty, and compassionate alert written in the authentic, humorous, inspiring voice of Spider-Man reminding the user: "With great responsibility comes great responsibility... to yourself. Take a break!" Reference their actual tasks.
If balanced:
- warningTriggered = false
- warningTitle = "Spider-Sense Equilibrium: In Harmony"
- warningMessage = Spider-Man praising their healthy work-life balance.

You MUST respond strictly with this JSON format:
{
  "extractedTasks": [
    {
      "title": "Finalize client presentation deck",
      "description": "Include Q4 growth metrics and send before 3 PM",
      "mode": "SPIDER",
      "priority": "HIGH",
      "category": "Work / Client",
      "deadline": "3:00 PM today",
      "reminderTime": "2:30 PM"
    },
    {
      "title": "Pick up groceries and prescription medicine",
      "description": "Stop by market on the way home",
      "mode": "PETER",
      "priority": "HIGH",
      "category": "Life / Health",
      "deadline": "6:00 PM",
      "reminderTime": "5:30 PM"
    }
  ],
  "warningTriggered": false,
  "warningTitle": "Spider-Sense Equilibrium: In Harmony",
  "warningMessage": "Awesome rhythm! You're taking care of business while protecting your personal wellness.",
  "workloadStats": {
    "workCount": 4,
    "personalCount": 3,
    "imbalanceRatio": 0.57,
    "equilibriumScore": 86,
    "diagnosis": "Healthy Work-Life Rhythm"
  },
  "spiderWisdomQuote": "With great responsibility comes great responsibility... to yourself."
}`;
}

interface ExtractedTaskItem {
  title: string;
  description?: string;
  mode: TaskMode;
  priority: TaskPriority;
  category?: string;
  deadline?: string;
  reminderTime?: string;
}

// -------------------------------------------------------------
// Output Sanitizer
// -------------------------------------------------------------
function sanitizeAIOutput(
  raw: any,
  sourceText: string,
  existingTasks: Task[],
  provider: 'openai' | 'gemini'
): SpiderSenseAnalysis {
  const extracted = Array.isArray(raw?.extractedTasks) ? raw.extractedTasks : [];
  const sanitizedTasks: ExtractedTaskItem[] = extracted.map((t: any): ExtractedTaskItem => ({
    title: String(t.title || 'Untitled Task'),
    description: t.description ? String(t.description) : undefined,
    mode: (t.mode === 'SPIDER' || t.mode === 'PETER') ? (t.mode as TaskMode) : 'SPIDER',
    priority: (t.priority === 'HIGH' || t.priority === 'MEDIUM' || t.priority === 'LOW') ? (t.priority as TaskPriority) : 'MEDIUM',
    category: t.category ? String(t.category) : undefined,
    deadline: t.deadline ? String(t.deadline) : undefined,
    reminderTime: t.reminderTime ? String(t.reminderTime) : undefined,
  }));

  const existingSpider = existingTasks.filter(t => t.mode === 'SPIDER' && t.status === 'PENDING').length;
  const existingPeter = existingTasks.filter(t => t.mode === 'PETER' && t.status === 'PENDING').length;
  
  const newSpider = sanitizedTasks.filter((t: ExtractedTaskItem) => t.mode === 'SPIDER').length;
  const newPeter = sanitizedTasks.filter((t: ExtractedTaskItem) => t.mode === 'PETER').length;

  const totalSpider = existingSpider + newSpider;
  const totalPeter = existingPeter + newPeter;
  const total = totalSpider + totalPeter;

  const ratio = total > 0 ? Number((totalSpider / total).toFixed(2)) : 0.5;
  const eqScore = Math.max(0, Math.min(100, Math.round(100 - Math.abs(ratio - 0.5) * 200)));

  const warningTriggered = raw.warningTriggered ?? (ratio >= 0.7 || (totalSpider >= 4 && totalPeter <= 1));

  return {
    extractedTasks: sanitizedTasks,
    warningTriggered,
    warningTitle: raw.warningTitle || (warningTriggered ? 'SPIDER-SENSE ALERT: WORKAHOLIC OVERLOAD DETECTED!' : 'Spider-Sense: Balanced Web of Life'),
    warningMessage: raw.warningMessage || (warningTriggered
      ? 'Whoa there! Your Spider-Sense is tingling at maximum! You have stacked up heavy work deadlines with zero personal time or self-care. With great responsibility comes great responsibility to yourself. Step away from the screen and take a breather!'
      : 'Your Web of Life is looking great! You are balancing both career output and personal well-being.'),
    workloadStats: {
      workCount: totalSpider,
      personalCount: totalPeter,
      imbalanceRatio: ratio,
      equilibriumScore: eqScore,
      diagnosis: raw.workloadStats?.diagnosis || (warningTriggered ? 'High Burnout Risk' : 'Healthy Equilibrium'),
    },
    spiderWisdomQuote: raw.spiderWisdomQuote || 'With great responsibility comes great responsibility... to yourself.',
    providerUsed: provider,
  };
}

// -------------------------------------------------------------
// Offline / Fallback Heuristic Spider-Sense NLP Engine
// -------------------------------------------------------------
export function runHeuristicSpiderSense(text: string, existingTasks: Task[] = []): SpiderSenseAnalysis {
  // Normalize honorifics to protect them from period splitting (e.g., Mr. Smith, Dr. Patel)
  let cleanText = text
    .replace(/Mr\.\s*/gi, 'Mr ')
    .replace(/Dr\.\s*/gi, 'Dr ')
    .replace(/Ms\.\s*/gi, 'Ms ')
    .replace(/Mrs\.\s*/gi, 'Mrs ');

  // Split into individual task clauses by punctuation, bullet points, commas, and conjunctions
  const rawSegments = cleanText
    .split(/\n|\r|;|\band then\b|\band also\b|,\s*and\s+|\band\b|,\s*|\.\s+(?=[A-Z])|\bneed to\b|\bhave to\b|\bi should\b|\bmust\b/gi)
    .map(s => s.trim().replace(/^[,.\-•*]\s*/, '').replace(/[.,;]+$/, ''))
    .filter(s => s.length > 3 && !/^(and|also|then|or)$/i.test(s));

  const clauses = rawSegments.length > 0 ? rawSegments : [text.trim()];

  // Everyday Work / Professional Keywords
  const workKeywords = [
    'report', 'deadline', 'meeting', 'client', 'presentation', 'pitch', 'code', 'deploy',
    'finance', 'financial', 'bug', 'ticket', 'sprint', 'boss', 'contract', 'audit', 'email',
    'slides', 'project', 'server', 'job', 'deck', 'interview', 'marketing', 'sales', 'strategy',
    'review', 'pr', 'pull request', 'architecture', 'retro', 'invoice', 'taxes', 'spreadsheet',
    'standup', 'q1', 'q2', 'q3', 'q4', 'kpi', 'customer', 'deliverable', 'jira', 'github',
    'slack', 'zoom', 'sync', 'exam', 'assignment', 'coursework', 'thesis', 'study'
  ];

  // Everyday Personal / Life / Health / Errands Keywords
  const personalKeywords = [
    'groceries', 'grocery', 'supermarket', 'dinner', 'lunch', 'breakfast', 'meal prep',
    'cooking', 'pharmacy', 'medicine', 'prescription', 'dentist', 'doctor', 'clinic', 'health',
    'workout', 'gym', 'run', 'running', 'stretch', 'yoga', 'walk', 'dog', 'cat', 'pet',
    'laundry', 'clean', 'cleaning', 'dishes', 'trash', 'apartment', 'house', 'rent', 'bank',
    'family', 'mom', 'dad', 'parents', 'sister', 'brother', 'kids', 'call', 'relax', 'rest',
    'nap', 'sleep', 'pizza', 'coffee', 'read', 'book', 'movie', 'show', 'netflix', 'haircut',
    'car', 'mechanic', 'oil change', 'shopping', 'birthday', 'gift', 'vacation', 'hobby'
  ];

  const extractedTasks = clauses.map(clause => {
    const lower = clause.toLowerCase();

    // Check deadlines & times
    let deadline: string | undefined = undefined;
    let reminderTime: string | undefined = undefined;

    const timeMatch = lower.match(/(?:by|at|before)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (timeMatch) {
      deadline = timeMatch[1].toUpperCase();
      reminderTime = `${timeMatch[1].toUpperCase()} (30 min before)`;
    } else if (lower.includes('today')) {
      deadline = 'Today (EOD)';
      reminderTime = '5:00 PM';
    } else if (lower.includes('tomorrow')) {
      deadline = 'Tomorrow';
      reminderTime = 'Tomorrow 9:00 AM';
    } else if (lower.includes('tonight')) {
      deadline = 'Tonight';
      reminderTime = '7:00 PM';
    }

    // Determine mode
    let spiderScore = 0;
    let peterScore = 0;

    for (const kw of workKeywords) {
      if (lower.includes(kw)) spiderScore += 2;
    }
    for (const kw of personalKeywords) {
      if (lower.includes(kw)) peterScore += 2;
    }

    let mode: TaskMode = 'SPIDER';
    let category = 'Work & Career';

    if (peterScore > spiderScore) {
      mode = 'PETER';
      if (lower.includes('grocery') || lower.includes('groceries') || lower.includes('supermarket') || lower.includes('meal')) {
        category = 'Life / Groceries & Food';
      } else if (lower.includes('medicine') || lower.includes('doctor') || lower.includes('dentist') || lower.includes('health') || lower.includes('pharmacy')) {
        category = 'Life / Health & Wellness';
      } else if (lower.includes('gym') || lower.includes('workout') || lower.includes('run') || lower.includes('yoga')) {
        category = 'Life / Fitness';
      } else if (lower.includes('mom') || lower.includes('dad') || lower.includes('parents') || lower.includes('family') || lower.includes('call')) {
        category = 'Life / Family & Friends';
      } else if (lower.includes('laundry') || lower.includes('clean') || lower.includes('errand') || lower.includes('bank') || lower.includes('rent')) {
        category = 'Life / Home & Errands';
      } else {
        category = 'Life / Self-Care & Hobbies';
      }
    } else {
      mode = 'SPIDER';
      if (lower.includes('code') || lower.includes('deploy') || lower.includes('bug') || lower.includes('pr') || lower.includes('server')) {
        category = 'Work / Engineering';
      } else if (lower.includes('deck') || lower.includes('presentation') || lower.includes('slides') || lower.includes('pitch')) {
        category = 'Work / Presentations';
      } else if (lower.includes('client') || lower.includes('meeting') || lower.includes('sync') || lower.includes('interview')) {
        category = 'Work / Meetings';
      } else if (lower.includes('report') || lower.includes('financial') || lower.includes('budget') || lower.includes('invoice')) {
        category = 'Work / Finance & Reports';
      } else {
        category = 'Work / Core Projects';
      }
    }

    // Determine priority
    let priority: TaskPriority = 'MEDIUM';
    if (
      lower.includes('urgent') || lower.includes('asap') || lower.includes('critical') ||
      lower.includes('medicine') || lower.includes('doctor') || lower.includes('today') ||
      lower.includes('deadline') || lower.includes('client')
    ) {
      priority = 'HIGH';
    } else if (lower.includes('maybe') || lower.includes('spare') || lower.includes('later') || lower.includes('relax') || lower.includes('read')) {
      priority = 'LOW';
    }

    // Clean title
    let title = clause.charAt(0).toUpperCase() + clause.slice(1);
    title = title.replace(/^(i need to|i have to|i should|must|gotta|please|remember to)\s+/i, '');

    return {
      title,
      mode,
      priority,
      category,
      deadline,
      reminderTime,
    };
  });

  const existingSpider = existingTasks.filter(t => t.mode === 'SPIDER' && t.status === 'PENDING').length;
  const existingPeter = existingTasks.filter(t => t.mode === 'PETER' && t.status === 'PENDING').length;

  const newSpider = extractedTasks.filter(t => t.mode === 'SPIDER').length;
  const newPeter = extractedTasks.filter(t => t.mode === 'PETER').length;

  const totalSpider = existingSpider + newSpider;
  const totalPeter = existingPeter + newPeter;
  const total = totalSpider + totalPeter;

  const ratio = total > 0 ? Number((totalSpider / total).toFixed(2)) : 0.5;
  const eqScore = Math.max(0, Math.min(100, Math.round(100 - Math.abs(ratio - 0.5) * 200)));

  const warningTriggered = ratio >= 0.7 || (totalSpider >= 4 && totalPeter <= 1);

  let warningTitle = 'Spider-Sense Equilibrium: In Harmony';
  let warningMessage = 'Great rhythm! Your professional career focus and personal well-being are in healthy equilibrium.';

  if (warningTriggered) {
    warningTitle = '⚡ SPIDER-SENSE WARNING: WORKAHOLIC OVERLOAD DETECTED!';
    warningMessage = `Whoa there! Your Spider-Sense is tingling with alarm! You've stacked up ${totalSpider} demanding work tasks with only ${totalPeter} personal tasks scheduled. Remember: "With great responsibility comes great responsibility... to yourself." Take a breather, hydrate, and schedule time for rest!`;
  }

  return {
    extractedTasks,
    warningTriggered,
    warningTitle,
    warningMessage,
    workloadStats: {
      workCount: totalSpider,
      personalCount: totalPeter,
      imbalanceRatio: ratio,
      equilibriumScore: eqScore,
      diagnosis: warningTriggered ? 'High Burnout & Overwork Risk' : 'Healthy Equilibrium',
    },
    spiderWisdomQuote: 'With great responsibility comes great responsibility... to yourself.',
    providerUsed: 'heuristic-engine',
  };
}
