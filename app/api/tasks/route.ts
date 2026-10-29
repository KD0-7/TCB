import { NextRequest, NextResponse } from 'next/server';
import { taskDb } from '@/lib/db';
import { TaskMode, TaskStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') as TaskMode | 'ALL' | null;
    const status = searchParams.get('status') as TaskStatus | 'ALL' | null;

    const tasks = await taskDb.getAll({
      mode: mode || undefined,
      status: status || undefined,
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if bulk creation
    if (Array.isArray(body.tasks)) {
      const created = await taskDb.createMany(body.tasks);
      return NextResponse.json({ success: true, tasks: created }, { status: 201 });
    }

    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const newTask = await taskDb.create({
      title: body.title,
      description: body.description,
      mode: body.mode === 'SPIDER' ? 'SPIDER' : 'PETER',
      priority: body.priority || 'MEDIUM',
      category: body.category,
      deadline: body.deadline,
      reminderTime: body.reminderTime,
      status: body.status || 'PENDING',
    });

    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}
