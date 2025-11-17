'use client';

/**
 * TaskList Component
 * Displays a list of tasks
 */

import { Task } from '@/types/task';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  message?: string;
}

export default function TaskList({ tasks, message }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No tasks found</p>
        {message && <p className="text-gray-400 text-sm mt-2">{message}</p>}
      </div>
    );
  }

  return (
    <div className="task-list">
      {message && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">{message}</p>
        </div>
      )}
      
      <div className="grid gap-4">
        {tasks.map((task, index) => (
          <TaskItem key={task.id} task={task} index={index + 1} />
        ))}
      </div>
    </div>
  );
}


