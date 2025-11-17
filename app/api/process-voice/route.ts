/**
 * API route for processing voice commands
 * Receives voice transcript, processes it with Google Gemini, and executes the command
 */

import { NextRequest, NextResponse } from 'next/server';
import { processVoiceCommand } from '@/lib/gemini';
import {
  createTask,
  getAllTasks,
  getTasksByCategory,
  getTasksByPriority,
  searchTasks,
  getTaskById,
  getTaskByIndex,
  updateTask,
  deleteTask,
  deleteTaskByIndex,
  initializeTasks,
} from '@/lib/tasks';
import { ParsedCommand } from '@/types/task';

export async function POST(request: NextRequest) {
  try {
    const { transcript, currentTasks } = await request.json();

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Initialize tasks store with current tasks from client
    if (currentTasks && Array.isArray(currentTasks)) {
      initializeTasks(currentTasks);
    }

    // Get Gemini API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    // Process the voice command with Gemini
    const command: ParsedCommand = await processVoiceCommand(transcript, apiKey);

    // Execute the command based on intent
    let result: any = { success: true, command };

    switch (command.intent) {
      case 'create':
        if (!command.taskTitle) {
          return NextResponse.json(
            { error: 'Task title is required for create command' },
            { status: 400 }
          );
        }
        const newTask = createTask({
          title: command.taskTitle,
          scheduledTime: command.scheduledTime,
          priority: command.priority,
          category: command.category,
        });
        result.task = newTask;
        result.tasks = getAllTasks(); // Return all tasks after operation
        result.message = `Created task: ${newTask.title}`;
        break;

      case 'read':
      case 'list':
        if (command.category) {
          result.tasks = getTasksByCategory(command.category);
          result.message = `Found ${result.tasks.length} tasks in category "${command.category}"`;
        } else if (command.priority) {
          result.tasks = getTasksByPriority(command.priority);
          result.message = `Found ${result.tasks.length} tasks with ${command.priority} priority`;
        } else {
          result.tasks = getAllTasks();
          result.message = `Found ${result.tasks.length} tasks`;
        }
        break;

      case 'filter':
        if (command.category) {
          result.tasks = getTasksByCategory(command.category);
          result.message = `Found ${result.tasks.length} tasks in category "${command.category}"`;
        } else if (command.searchQuery) {
          result.tasks = searchTasks(command.searchQuery);
          result.message = `Found ${result.tasks.length} tasks matching "${command.searchQuery}"`;
        } else if (command.priority) {
          result.tasks = getTasksByPriority(command.priority);
          result.message = `Found ${result.tasks.length} tasks with ${command.priority} priority`;
        } else {
          result.tasks = getAllTasks();
          result.message = `Found ${result.tasks.length} tasks`;
        }
        break;

      case 'update':
        let taskToUpdate;
        
        if (command.taskIndex) {
          taskToUpdate = getTaskByIndex(command.taskIndex);
        } else if (command.searchQuery) {
          const matchingTasks = searchTasks(command.searchQuery);
          if (matchingTasks.length > 0) {
            taskToUpdate = matchingTasks[0]; // Update first match
          } else {
            // Provide helpful error message with available tasks
            const allTasks = getAllTasks();
            const taskTitles = allTasks.map((t, i) => `#${i + 1}: "${t.title}"`).join(', ');
            return NextResponse.json(
              { 
                error: `Task not found matching "${command.searchQuery}". Available tasks: ${taskTitles}`,
                availableTasks: allTasks.map(t => t.title)
              },
              { status: 404 }
            );
          }
        } else if (command.taskId) {
          taskToUpdate = getTaskById(command.taskId);
        }

        if (!taskToUpdate) {
          const allTasks = getAllTasks();
          const taskTitles = allTasks.map((t, i) => `#${i + 1}: "${t.title}"`).join(', ');
          return NextResponse.json(
            { 
              error: 'Task not found. Available tasks: ' + taskTitles,
              availableTasks: allTasks.map(t => t.title)
            },
            { status: 404 }
          );
        }

        const updates: any = {};
        if (command.scheduledTime) {
          updates.scheduledTime = command.scheduledTime;
        }
        if (command.priority) {
          updates.priority = command.priority;
        }
        if (command.taskTitle) {
          updates.title = command.taskTitle;
        }
        if (command.category) {
          updates.category = command.category;
        }

        const updatedTask = updateTask(taskToUpdate.id, updates);
        result.task = updatedTask;
        result.tasks = getAllTasks(); // Return all tasks after operation
        result.message = `Updated task: ${updatedTask?.title}`;
        break;

      case 'delete':
        let deleted = false;
        
        if (command.taskIndex) {
          deleted = deleteTaskByIndex(command.taskIndex);
          result.message = deleted 
            ? `Deleted task at index ${command.taskIndex}`
            : `Task at index ${command.taskIndex} not found`;
        } else if (command.searchQuery) {
          const matchingTasks = searchTasks(command.searchQuery);
          if (matchingTasks.length > 0) {
            deleted = deleteTask(matchingTasks[0].id);
            result.message = deleted
              ? `Deleted task: ${matchingTasks[0].title}`
              : 'Failed to delete task';
          } else {
            result.message = `No tasks found matching "${command.searchQuery}"`;
          }
        } else {
          return NextResponse.json(
            { error: 'Task identifier (index or search query) is required for delete command' },
            { status: 400 }
          );
        }

        result.deleted = deleted;
        result.tasks = getAllTasks(); // Return all tasks after operation
        break;

      default:
        return NextResponse.json(
          { error: `Unknown intent: ${command.intent}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error processing voice command:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process voice command' },
      { status: 500 }
    );
  }
}

