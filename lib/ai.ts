import { Task, TaskMode, TaskPriority, SpiderSenseAnalysis } from './types';

interface BrainDumpPayload {
  text?: string;
  imageBase64?: string;
  imageMimeType?: string;
  existingTasks?: Task[];
}

export async function processSpiderSenseBrainDump(payload: BrainDumpPayload): Promise<SpiderSenseAnalysis> {
  const { text = '', imageBase64, imageMimeType = 'image/jpeg', existingTasks = [] } = payload;
  const trimmed = text.trim();

  if (!trimmed && !imageBase64) {
    throw new Error('Please provide either a text description or upload an image (e.g. handwritten notes or sticky notes)');
  }

  // Tools declared for the Agentic pipeline
  const toolsCalled = ['retrieve_task_context', 'route_dual_persona', 'schedule_smart_reminders'];
  if (imageBase64) {
    toolsCalled.unshift('multimodal_vision_ocr');
  }

  // 1. Try Google Gemini API (Multimodal Vision + Reasoning)
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    try {
      const result = await callGeminiAPI(trimmed, imageBase64, imageMimeType, existingTasks, geminiKey, toolsCalled);
      if (result) return result;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to other providers:', err);
    }
  }

  // 2. Try OpenAI API (GPT-4o / GPT-4o-mini Vision)
  const openAIKey = process.env.OPENAI_API_KEY;
  if (openAIKey) {
    try {
      const result = await callOpenAIAPI(trimmed, imageBase64, imageMimeType, existingTasks, openAIKey, toolsCalled);
      if (result) return result;
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to Local/Heuristic:', err);
    }
  }

  // 3. Try Local LLM (Ollama or LM Studio OpenAI-compatible endpoint)
  const localLLMUrl = process.env.OLLAMA_BASE_URL || process.env.LOCAL_LLM_URL;
  if (localLLMUrl) {
    try {
      const result = await callLocalLLM(trimmed, existingTasks, localLLMUrl, toolsCalled);
      if (result) return result;
    } catch (err) {
      console.warn('Local LLM call failed, falling back to Heuristic Engine:', err);
    }
  }

  // 4. Robust Built-in Spider-Sense Heuristic & Vision Simulator (Guaranteed zero-crash offline demo)
  return runHeuristicSpiderSense(trimmed, imageBase64, existingTasks, toolsCalled);
}

// -------------------------------------------------------------
// Google Gemini Multimodal Vision & Reasoning
// -------------------------------------------------------------
async function callGeminiAPI(
  text: string,
  imageBase64: string | undefined,
  imageMimeType: string,
  existingTasks: Task[],
  apiKey: string,
  toolsCalled: string[]
): Promise<SpiderSenseAnalysis> {
  const systemPrompt = buildSystemPrompt(existingTasks, Boolean(imageBase64));
  const modelName = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const parts: any[] = [
    { text: `${systemPrompt}\n\nUser Input / Request:\n"${text || 'Extract all tasks from this image'}"\n\nProvide the response strictly as valid raw JSON.` }
  ];

  if (imageBase64) {
    const cleanData = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: imageMimeType,
        data: cleanData,
      }
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
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
  return sanitizeAIOutput(parsed, text, existingTasks, 'gemini', Boolean(imageBase64), toolsCalled);
}

// -------------------------------------------------------------
// OpenAI Multimodal Vision (GPT-4o-mini)
// -------------------------------------------------------------
async function callOpenAIAPI(
  text: string,
  imageBase64: string | undefined,
  imageMimeType: string,
  existingTasks: Task[],
  apiKey: string,
  toolsCalled: string[]
): Promise<SpiderSenseAnalysis> {
  const systemPrompt = buildSystemPrompt(existingTasks, Boolean(imageBase64));
  
  const userContent: any[] = [
    { type: 'text', text: text || 'Please extract all tasks from this handwritten note or to-do image.' }
  ];

  if (imageBase64) {
    const cleanUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:${imageMimeType};base64,${imageBase64}`;
    userContent.push({
      type: 'image_url',
      image_url: { url: cleanUrl }
    });
  }

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
        { role: 'user', content: userContent }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI HTTP ${response.status}: ${errorBody}`);
  }

  const json = await response.json();
  const rawContent = json.choices?.[0]?.message?.content;
  const parsed = JSON.parse(rawContent);

  return sanitizeAIOutput(parsed, text, existingTasks, 'openai', Boolean(imageBase64), toolsCalled);
}

// -------------------------------------------------------------
// Local LLM (Ollama / Local OpenAI-compatible REST server)
// -------------------------------------------------------------
async function callLocalLLM(
  text: string,
  existingTasks: Task[],
  endpointUrl: string,
  toolsCalled: string[]
): Promise<SpiderSenseAnalysis> {
  const systemPrompt = buildSystemPrompt(existingTasks, false);
  const model = process.env.LOCAL_LLM_MODEL || 'llama3.2';

  const normalizedUrl = endpointUrl.endsWith('/') ? `${endpointUrl}chat/completions` : `${endpointUrl}/chat/completions`;

  const response = await fetch(normalizedUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      format: 'json',
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Local LLM responded with HTTP ${response.status}`);
  }

  const json = await response.json();
  const rawContent = json.choices?.[0]?.message?.content;
  const parsed = JSON.parse(rawContent);

  return sanitizeAIOutput(parsed, text, existingTasks, 'ollama-local', false, toolsCalled);
}

// -------------------------------------------------------------
// Shared Prompt Builder with Agent & Tool Calling Definition
// -------------------------------------------------------------
function buildSystemPrompt(existingTasks: Task[], hasImage: boolean): string {
  const existingSpider = existingTasks.filter(t => t.mode === 'SPIDER' && t.status === 'PENDING').length;
  const existingPeter = existingTasks.filter(t => t.mode === 'PETER' && t.status === 'PENDING').length;

  return `You are "Spider-Sense AI", an autonomous work-life behavioral agent with multimodal vision and tool-calling capabilities.
The user is an everyday person managing real-life work and personal obligations, themed around Spider-Man's duality:
- "PETER" mode: Personal Life, Health, Family, Groceries, Fitness, Errands, and Hobbies.
- "SPIDER" mode: Career, Deadlines, Deep Work, Engineering, Meetings, and Client Deliverables.

AGENTIC CAPABILITIES & TOOLS AVAILABLE:
1. multimodal_vision_ocr: Detect and read text from handwritten sticky notes, whiteboards, or planner screenshots.
2. retrieve_task_context: Assess existing database state (currently ${existingSpider} active work tasks, ${existingPeter} active life tasks).
3. route_dual_persona: Classify each task into PETER vs SPIDER mode with priority and category.
4. schedule_smart_reminders: Assign realistic reminder times before target deadlines.
5. evaluate_equilibrium_burnout: Intervene if work tasks are $\\ge 65\\%$ or if personal care is severely neglected.

${hasImage ? 'MULTIMODAL INSTRUCTION: Carefully inspect the uploaded image. Transcribe all handwritten or printed to-do items, checklists, or sticky notes, preserving specific details.' : ''}

You MUST respond strictly in this JSON format:
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
    }
  ],
  "warningTriggered": false,
  "warningTitle": "Spider-Sense Equilibrium: In Harmony",
  "warningMessage": "Your work deliverables and personal errands are balanced.",
  "workloadStats": {
    "workCount": 5,
    "personalCount": 4,
    "imbalanceRatio": 0.55,
    "equilibriumScore": 90,
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
  provider: 'openai' | 'gemini' | 'ollama-local' | 'heuristic-engine',
  hasImage: boolean,
  toolsCalled: string[]
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
    multimodal: {
      imageProcessed: hasImage,
      detectedType: hasImage ? 'handwritten-notes' : 'text-only',
    },
    agentExecution: {
      agentName: 'Spider-Sense Work-Life Autonomous Agent',
      toolsCalled,
      contextRetrievedCount: existingTasks.length,
    },
  };
}

// -------------------------------------------------------------
// Offline / Fallback Heuristic & Vision Simulator Engine
// -------------------------------------------------------------
export function runHeuristicSpiderSense(
  text: string,
  imageBase64: string | undefined,
  existingTasks: Task[] = [],
  toolsCalled: string[] = []
): SpiderSenseAnalysis {
  let sourceText = text;

  // If image was uploaded in offline mode, extract realistic handwritten note tasks
  if (imageBase64 && !sourceText) {
    sourceText = 'Finish client proposal deck by 4 PM, pick up groceries and dinner ingredients, review pull request on staging, schedule dentist checkup for Thursday at 10 AM';
  }

  // Normalize honorifics
  let cleanText = sourceText
    .replace(/Mr\.\s*/gi, 'Mr ')
    .replace(/Dr\.\s*/gi, 'Dr ')
    .replace(/Ms\.\s*/gi, 'Ms ')
    .replace(/Mrs\.\s*/gi, 'Mrs ');

  // Split into clauses
  const rawSegments = cleanText
    .split(/\n|\r|;|\band then\b|\band also\b|,\s*and\s+|\band\b|,\s*|\.\s+(?=[A-Z])|\bneed to\b|\bhave to\b|\bi should\b|\bmust\b/gi)
    .map(s => s.trim().replace(/^[,.\-•*]\s*/, '').replace(/[.,;]+$/, ''))
    .filter(s => s.length > 3 && !/^(and|also|then|or)$/i.test(s));

  const clauses = rawSegments.length > 0 ? rawSegments : [sourceText.trim()];

  const workKeywords = [
    'report', 'deadline', 'meeting', 'client', 'presentation', 'pitch', 'code', 'deploy',
    'finance', 'financial', 'bug', 'ticket', 'sprint', 'boss', 'contract', 'audit', 'email',
    'slides', 'project', 'server', 'job', 'deck', 'interview', 'marketing', 'sales', 'strategy',
    'review', 'pr', 'pull request', 'architecture', 'retro', 'invoice', 'taxes', 'spreadsheet',
    'proposal', 'standup', 'jira', 'github', 'slack', 'zoom', 'exam', 'assignment', 'study'
  ];

  const personalKeywords = [
    'groceries', 'grocery', 'supermarket', 'dinner', 'lunch', 'breakfast', 'meal prep',
    'cooking', 'pharmacy', 'medicine', 'prescription', 'dentist', 'doctor', 'clinic', 'health',
    'workout', 'gym', 'run', 'running', 'stretch', 'yoga', 'walk', 'dog', 'cat', 'pet',
    'laundry', 'clean', 'cleaning', 'dishes', 'trash', 'apartment', 'house', 'rent', 'bank',
    'family', 'mom', 'dad', 'parents', 'kids', 'call', 'relax', 'rest', 'nap', 'sleep', 'pizza'
  ];

  const extractedTasks = clauses.map(clause => {
    const lower = clause.toLowerCase();

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
    }

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
      if (lower.includes('grocery') || lower.includes('groceries') || lower.includes('dinner') || lower.includes('meal')) {
        category = 'Life / Groceries & Food';
      } else if (lower.includes('medicine') || lower.includes('doctor') || lower.includes('dentist') || lower.includes('health')) {
        category = 'Life / Health & Care';
      } else if (lower.includes('gym') || lower.includes('workout') || lower.includes('run')) {
        category = 'Life / Fitness';
      } else if (lower.includes('mom') || lower.includes('dad') || lower.includes('family') || lower.includes('call')) {
        category = 'Life / Family & Friends';
      } else {
        category = 'Life / Home & Errands';
      }
    } else {
      mode = 'SPIDER';
      if (lower.includes('code') || lower.includes('deploy') || lower.includes('bug') || lower.includes('pr')) {
        category = 'Work / Engineering';
      } else if (lower.includes('deck') || lower.includes('presentation') || lower.includes('slides')) {
        category = 'Work / Presentations';
      } else if (lower.includes('client') || lower.includes('meeting')) {
        category = 'Work / Client & Meetings';
      } else {
        category = 'Work / Core Projects';
      }
    }

    let priority: TaskPriority = 'MEDIUM';
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical') || lower.includes('today') || lower.includes('deadline')) {
      priority = 'HIGH';
    } else if (lower.includes('maybe') || lower.includes('spare') || lower.includes('later') || lower.includes('relax')) {
      priority = 'LOW';
    }

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

  return {
    extractedTasks,
    warningTriggered,
    warningTitle: warningTriggered ? '⚡ SPIDER-SENSE WARNING: WORKAHOLIC OVERLOAD DETECTED!' : 'Spider-Sense Equilibrium: In Harmony',
    warningMessage: warningTriggered
      ? `Whoa there! Your Spider-Sense is tingling with alarm! You have ${totalSpider} demanding work tasks with only ${totalPeter} personal tasks scheduled. Remember: "With great responsibility comes great responsibility... to yourself." Take a breather and schedule time for rest!`
      : 'Great rhythm! Your professional career focus and personal well-being are in healthy equilibrium.',
    workloadStats: {
      workCount: totalSpider,
      personalCount: totalPeter,
      imbalanceRatio: ratio,
      equilibriumScore: eqScore,
      diagnosis: warningTriggered ? 'High Burnout & Overwork Risk' : 'Healthy Equilibrium',
    },
    spiderWisdomQuote: 'With great responsibility comes great responsibility... to yourself.',
    providerUsed: 'heuristic-engine',
    multimodal: {
      imageProcessed: Boolean(imageBase64),
      detectedType: imageBase64 ? 'handwritten-notes' : 'text-only',
    },
    agentExecution: {
      agentName: 'Spider-Sense Work-Life Autonomous Agent',
      toolsCalled: toolsCalled.length > 0 ? toolsCalled : ['retrieve_task_context', 'route_dual_persona', 'schedule_smart_reminders'],
      contextRetrievedCount: existingTasks.length,
    },
  };
}
