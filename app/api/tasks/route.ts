/**
 * API route for managing tasks
 * GET: Retrieve all tasks
 * POST: Create a new task
 */

import { NextRequest, NextResponse } from 'next/server';
import { Task } from '@/types/task';
import {
  getAllTasks,
  createTask,
  initializeTasks,
} from '@/lib/tasks';

// Initialize tasks from request body if provided
export async function GET(request: NextRequest) {
  try {
    const tasks = getAllTasks();
    return NextResponse.json({ tasks });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // If tasks are provided, initialize the store
    if (body.tasks && Array.isArray(body.tasks)) {
      initializeTasks(body.tasks);
      return NextResponse.json({ tasks: getAllTasks() });
    }
    
    // Otherwise, create a new task
    if (!body.title) {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      );
    }
    
    const task = createTask(body);
    return NextResponse.json({ task, tasks: getAllTasks() });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}


