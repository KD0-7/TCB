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

  // 3. Robust Built-in Spider-Sense Heuristic NLP Engine (Guaranteed zero-crash demo)
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
        { role: 'user', content: `Here is my chaotic daily brain dump:\n"${text}"` }
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
// Shared Prompt Builder
// -------------------------------------------------------------
function buildSystemPrompt(existingTasks: Task[]): string {
  const existingSpider = existingTasks.filter(t => t.mode === 'SPIDER' && t.status === 'PENDING').length;
  const existingPeter = existingTasks.filter(t => t.mode === 'PETER' && t.status === 'PENDING').length;

  return `You are "Spider-Sense AI", an intelligent behavioral monitor and work-life balance guardian built for Peter Parker / Spider-Man.

Your job:
1. Parse chaotic unstructured daily brain dumps into distinct actionable tasks.
2. Auto-categorize each task into:
   - "PETER" mode: Personal, self-care, family, health, relationships, hobbies, chores, errands, rest.
   - "SPIDER" mode: Professional, work, career deadlines, high-priority projects, client deliverables, vigilante duties.
3. Assign priority: "LOW", "MEDIUM", or "HIGH".
4. Extract explicit or implicit deadlines/times (e.g. "3 PM", "by evening", "tomorrow", or null).
5. Assign a concise category tag (e.g. "Oscorp", "Daily Bugle", "Family", "Health", "Avengers Tech", "Self-Care", "Errands").

WORKLOAD & IMBALANCE MONITORING:
Current active workload already on the user's board:
- Spider-Man (Work) pending tasks: ${existingSpider}
- Peter Parker (Life) pending tasks: ${existingPeter}

Analyze the combined workload of existing tasks + newly extracted tasks.
If the ratio of SPIDER (Work) tasks is >= 65% of total, OR if there are 4+ work tasks and 0-1 personal tasks, or if the user is neglecting health/rest:
- Set warningTriggered = true
- Set warningTitle = "SPIDER-SENSE WARNING: TINGLING AT MAXIMUM!"
- Set warningMessage = A personalized, witty, and compassionate alert written in the authentic, humorous voice of Peter Parker / Spider-Man, reminding them that "with great power comes great responsibility... to yourself. Take a break!" Mention specific details from their tasks.
If balanced:
- warningTriggered = false
- warningTitle = "Spider-Sense Equilibrium: Stable"
- warningMessage = Spider-Man approving of good balance.

You MUST respond strictly with this JSON format:
{
  "extractedTasks": [
    {
      "title": "Finish Oscorp financial report",
      "description": "Board review deadline at 3 PM",
      "mode": "SPIDER",
      "priority": "HIGH",
      "category": "Oscorp",
      "deadline": "3:00 PM today"
    }
  ],
  "warningTriggered": true,
  "warningTitle": "Spider-Sense Warning: Extreme Workload Detected!",
  "warningMessage": "Whoa, hold your web-shooters! You've got 5 massive work deadlines and zero time for pizza with Aunt May. Even the Avengers need sleep!",
  "workloadStats": {
    "workCount": 5,
    "personalCount": 1,
    "imbalanceRatio": 0.83,
    "equilibriumScore": 34,
    "diagnosis": "Severe Work Overload"
  },
  "spiderWisdomQuote": "With great power comes great responsibility... to yourself."
}`;
}

interface ExtractedTaskItem {
  title: string;
  description?: string;
  mode: TaskMode;
  priority: TaskPriority;
  category?: string;
  deadline?: string;
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
    warningTitle: raw.warningTitle || (warningTriggered ? 'SPIDER-SENSE ALERT: CRITICAL WORK IMBALANCE!' : 'Spider-Sense: Balanced Web of Life'),
    warningMessage: raw.warningMessage || (warningTriggered
      ? 'Whoa there, web-slinger! My Spider-Sense is tingling off the charts. With great power comes great responsibility... to yourself. Take a break!'
      : 'Web of Life looking stable! You are balancing both the mask and the man.'),
    workloadStats: {
      workCount: totalSpider,
      personalCount: totalPeter,
      imbalanceRatio: ratio,
      equilibriumScore: eqScore,
      diagnosis: raw.workloadStats?.diagnosis || (warningTriggered ? 'Overclocked Work Stress' : 'Harmonious Equilibrium'),
    },
    spiderWisdomQuote: raw.spiderWisdomQuote || 'With great power comes great responsibility... to yourself.',
    providerUsed: provider,
  };
}

// -------------------------------------------------------------
// Offline / Fallback Heuristic Spider-Sense NLP Engine
// -------------------------------------------------------------
export function runHeuristicSpiderSense(text: string, existingTasks: Task[] = []): SpiderSenseAnalysis {
  // Normalize honorifics to protect them from period splitting (e.g., Mr. Stark, Dr. Connors)
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

  const workKeywords = [
    'oscorp', 'stark', 'report', 'deadline', 'meeting', 'client', 'presentation',
    'pitch', 'code', 'deploy', 'finance', 'financial', 'bug', 'ticket', 'sprint',
    'avengers', 'web-shooters', 'web shooters', 'suit', 'patrol', 'patrolling',
    'boss', 'contract', 'audit', 'email', 'slides', 'project', 'server', 'firm', 'job'
  ];

  const personalKeywords = [
    'aunt may', 'may', 'medicine', 'prescription', 'pharmacy', 'wheatcakes', 'pizza',
    'joe\'s', 'dinner', 'lunch', 'breakfast', 'groceries', 'supermarket', 'family',
    'rest', 'sleep', 'nap', 'relax', 'gym', 'workout', 'laundry', 'clothes',
    'apartment', 'rent', 'camera', 'photo', 'bugle', 'photos', 'ned', 'mj',
    'homework', 'study', 'exam', 'class', 'backpack', 'movie', 'doctor', 'walk'
  ];

  const extractedTasks = clauses.map(clause => {
    const lower = clause.toLowerCase();

    // Check deadlines
    let deadline: string | undefined = undefined;
    const timeMatch = lower.match(/(?:by|at|before)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (timeMatch) {
      deadline = timeMatch[1].toUpperCase();
    } else if (lower.includes('today')) {
      deadline = 'By End of Day';
    } else if (lower.includes('tomorrow')) {
      deadline = 'Tomorrow';
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

    // Bias check
    let mode: TaskMode = 'SPIDER';
    let category = 'Heroics & Work';

    if (peterScore > spiderScore) {
      mode = 'PETER';
      if (lower.includes('aunt may') || lower.includes('family')) category = 'Aunt May & Family';
      else if (lower.includes('medicine') || lower.includes('pharmacy') || lower.includes('health')) category = 'Health & Care';
      else if (lower.includes('pizza') || lower.includes('dinner') || lower.includes('lunch')) category = 'Joe\'s Pizza & Food';
      else if (lower.includes('camera') || lower.includes('photo') || lower.includes('bugle')) category = 'Daily Bugle Photos';
      else if (lower.includes('backpack') || lower.includes('laundry') || lower.includes('rent')) category = 'Queens Errands';
      else category = 'Personal & Self-Care';
    } else {
      mode = 'SPIDER';
      if (lower.includes('oscorp')) category = 'Oscorp Industries';
      else if (lower.includes('stark') || lower.includes('avengers')) category = 'Stark / Avengers Tech';
      else if (lower.includes('web-shooters') || lower.includes('web shooters') || lower.includes('suit')) category = 'Spidey Tech & Lab';
      else if (lower.includes('report') || lower.includes('financial') || lower.includes('audit')) category = 'Oscorp Deadlines';
      else category = 'Professional Mission';
    }

    // Determine priority
    let priority: TaskPriority = 'MEDIUM';
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('3 pm') || lower.includes('medicine') || lower.includes('critical') || lower.includes('report')) {
      priority = 'HIGH';
    } else if (lower.includes('maybe') || lower.includes('spare') || lower.includes('later') || lower.includes('pizza') || lower.includes('relax')) {
      priority = 'LOW';
    }

    // Clean title
    let title = clause.charAt(0).toUpperCase() + clause.slice(1);
    title = title.replace(/^(i need to|i have to|i should|must|gotta|please)\s+/i, '');

    return {
      title,
      mode,
      priority,
      category,
      deadline,
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

  let warningTitle = 'Spider-Sense Equilibrium: Stable';
  let warningMessage = 'Great job web-head! Your personal and professional webs are harmoniously aligned.';

  if (warningTriggered) {
    warningTitle = '⚡ SPIDER-SENSE WARNING: CRITICAL WORK IMBALANCE!';
    warningMessage = `Whoa there, web-slinger! My Spider-Sense is tingling at hazardous frequencies. You have ${totalSpider} high-stakes work missions stacked up and barely ${totalPeter} personal tasks. Remember what Uncle Ben said: "With great power comes great responsibility... to yourself." Go grab a slice of Joe's Pizza and take a breather!`;
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
      diagnosis: warningTriggered ? 'Dangerous Workaholic Imbalance' : 'Equilibrium Maintained',
    },
    spiderWisdomQuote: 'With great power comes great responsibility... to yourself.',
    providerUsed: 'heuristic-engine',
  };
}
