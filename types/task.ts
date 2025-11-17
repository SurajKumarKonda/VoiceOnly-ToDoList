/**
 * Task type definition
 * Represents a single task in the to-do list
 */
export interface Task {
  id: string;
  title: string;
  scheduledTime?: Date | string; // Optional scheduled date/time
  priority?: 'low' | 'medium' | 'high'; // Optional priority level
  category?: string; // Optional category (e.g., "administrative", "development")
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Voice command intent types
 * Represents the different operations that can be performed via voice
 */
export type CommandIntent = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'list'
  | 'filter';

/**
 * Parsed voice command structure
 * Result of LLM processing a voice command
 */
export interface ParsedCommand {
  intent: CommandIntent;
  taskTitle?: string;
  taskId?: string;
  taskIndex?: number; // For commands like "delete the 4th task"
  category?: string; // For filtering by category
  priority?: 'low' | 'medium' | 'high';
  scheduledTime?: string; // ISO date string or relative time
  searchQuery?: string; // For finding tasks by keywords
}


