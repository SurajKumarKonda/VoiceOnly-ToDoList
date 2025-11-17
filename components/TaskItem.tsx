'use client';

/**
 * TaskItem Component
 * Displays a single task with its properties
 */

import { Task } from '@/types/task';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  index: number;
}

export default function TaskItem({ task, index }: TaskItemProps) {
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'MMM dd, yyyy');
    } catch {
      return '';
    }
  };

  return (
    <div className="task-item bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-500">#{index}</span>
            <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {task.category && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {task.category}
              </span>
            )}
            
            {task.priority && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
                {task.priority} priority
              </span>
            )}
            
            {task.scheduledTime && (
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                📅 {formatDate(task.scheduledTime)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


