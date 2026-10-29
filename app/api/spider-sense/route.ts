import { NextRequest, NextResponse } from 'next/server';
import { processSpiderSenseBrainDump } from '@/lib/ai';
import { taskDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, imageBase64, imageMimeType, includeExisting = true } = body;

    const hasText = Boolean(text && typeof text === 'string' && text.trim());
    const hasImage = Boolean(imageBase64 && typeof imageBase64 === 'string');

    if (!hasText && !hasImage) {
      return NextResponse.json(
        { success: false, error: 'Please provide either text or upload a handwritten/sticky note image.' },
        { status: 400 }
      );
    }

    // Contextual Retrieval (RAG): Retrieve active pending tasks from the database
    const existingTasks = includeExisting ? await taskDb.getAll({ status: 'PENDING' }) : [];

    // Run GenAI processing / Spider-Sense Autonomous Agent
    const analysis = await processSpiderSenseBrainDump({
      text: text || '',
      imageBase64,
      imageMimeType: imageMimeType || 'image/jpeg',
      existingTasks,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Error in /api/spider-sense:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process brain dump' },
      { status: 500 }
    );
  }
}
