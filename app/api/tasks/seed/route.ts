import { NextResponse } from 'next/server';
import { taskDb } from '@/lib/db';

export async function POST() {
  try {
    const tasks = await taskDb.resetToDefault();
    return NextResponse.json({ success: true, message: 'Reset to Spider-Sense default tasks', tasks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
