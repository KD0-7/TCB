import { NextRequest, NextResponse } from 'next/server';
import { processSpiderSenseBrainDump } from '@/lib/ai';
import { taskDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, includeExisting = true } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Brain dump text is required' },
        { status: 400 }
      );
    }

    // Get current pending tasks to compute overall workload balance
    const existingTasks = includeExisting ? await taskDb.getAll({ status: 'PENDING' }) : [];

    // Run GenAI processing / Spider-Sense analysis
    const analysis = await processSpiderSenseBrainDump({
      text,
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
