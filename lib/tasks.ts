/**
 * Task management utilities
 * Handles CRUD operations for tasks
 */

import { Task } from '@/types/task';

// In-memory storage (can be replaced with a database)
let tasks: Task[] = [];

/**
 * Generate a unique ID for a task
 */
function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new task
 */
export function createTask(taskData: Partial<Task>): Task {
  const now = new Date();
  const task: Task = {
    id: generateId(),
    title: taskData.title || 'Untitled Task',
    scheduledTime: taskData.scheduledTime,
    priority: taskData.priority || 'medium',
    category: taskData.category,
    createdAt: now,
    updatedAt: now,
  };
  
  tasks.push(task);
  return task;
}

/**
 * Get all tasks
 */
export function getAllTasks(): Task[] {
  return [...tasks];
}

/**
 * Get tasks by category
 */
export function getTasksByCategory(category: string): Task[] {
  return tasks.filter(task => 
    task.category?.toLowerCase().includes(category.toLowerCase())
  );
}

/**
 * Get tasks by priority
 */
export function getTasksByPriority(priority: 'low' | 'medium' | 'high'): Task[] {
  return tasks.filter(task => task.priority === priority);
}

/**
 * Search tasks by query (searches in title and category)
 * Uses flexible matching to handle partial phrases and word order variations
 */
export function searchTasks(query: string): Task[] {
  const lowerQuery = query.toLowerCase().trim();
  
  // Split query into words for more flexible matching
  const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 0);
  
  return tasks.filter(task => {
    const taskTitle = task.title.toLowerCase();
    const taskCategory = task.category?.toLowerCase() || '';
    
    // Exact match (highest priority)
    if (taskTitle.includes(lowerQuery) || taskCategory.includes(lowerQuery)) {
      return true;
    }
    
    // If query has multiple words, check if all words appear in title (in any order)
    if (queryWords.length > 1) {
      const allWordsMatch = queryWords.every(word => 
        taskTitle.includes(word) || taskCategory.includes(word)
      );
      if (allWordsMatch) {
        return true;
      }
    }
    
    // Check if significant words match (words longer than 3 characters)
    const significantWords = queryWords.filter(word => word.length > 3);
    if (significantWords.length > 0) {
      const significantMatch = significantWords.some(word =>
        taskTitle.includes(word) || taskCategory.includes(word)
      );
      if (significantMatch) {
        return true;
      }
    }
    
    return false;
  });
}

/**
 * Get task by ID
 */
export function getTaskById(id: string): Task | undefined {
  return tasks.find(task => task.id === id);
}

/**
 * Get task by index (1-based)
 */
export function getTaskByIndex(index: number): Task | undefined {
  const zeroBasedIndex = index - 1;
  if (zeroBasedIndex >= 0 && zeroBasedIndex < tasks.length) {
    return tasks[zeroBasedIndex];
  }
  return undefined;
}

/**
 * Update a task
 */
export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    return null;
  }
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date(),
  };
  
  return tasks[taskIndex];
}

/**
 * Delete a task by ID
 */
export function deleteTask(id: string): boolean {
  const initialLength = tasks.length;
  tasks = tasks.filter(task => task.id !== id);
  return tasks.length < initialLength;
}

/**
 * Delete a task by index (1-based)
 */
export function deleteTaskByIndex(index: number): boolean {
  const zeroBasedIndex = index - 1;
  if (zeroBasedIndex >= 0 && zeroBasedIndex < tasks.length) {
    tasks.splice(zeroBasedIndex, 1);
    return true;
  }
  return false;
}

/**
 * Initialize tasks (for testing or persistence)
 */
export function initializeTasks(initialTasks: Task[] = []): void {
  tasks = [...initialTasks];
}

/**
 * Clear all tasks
 */
export function clearAllTasks(): void {
  tasks = [];
}


