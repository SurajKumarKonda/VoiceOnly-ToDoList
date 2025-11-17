'use client';

/**
 * Main Page Component
 * Voice-first to-do list application
 */

import { useState, useEffect } from 'react';
import VoiceInput from '@/components/VoiceInput';
import TaskList from '@/components/TaskList';
import { Task } from '@/types/task';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        setTasks(parsed);
      } catch (e) {
        console.error('Failed to load tasks from localStorage:', e);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem('tasks')) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleTranscript = async (transcript: string) => {
    setIsProcessing(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/process-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transcript,
          currentTasks: tasks, // Send current tasks to maintain state
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process command');
      }

      // Update tasks based on the result
      if (data.tasks) {
        setTasks(data.tasks);
      } else if (data.task) {
        // For create/update operations, update manually if tasks not returned
        if (data.command.intent === 'create') {
          setTasks(prev => [...prev, data.task]);
        } else if (data.command.intent === 'update') {
          setTasks(prev =>
            prev.map(t => (t.id === data.task.id ? data.task : t))
          );
        }
      } else if (data.deleted !== undefined && !data.tasks) {
        // For delete operations, update manually if tasks not returned
        if (data.command.intent === 'delete') {
          if (data.command.taskIndex) {
            setTasks(prev => {
              const newTasks = [...prev];
              newTasks.splice(data.command.taskIndex - 1, 1);
              return newTasks;
            });
          } else if (data.command.searchQuery) {
            setTasks(prev =>
              prev.filter(
                t =>
                  !t.title.toLowerCase().includes(data.command.searchQuery.toLowerCase()) &&
                  !t.category?.toLowerCase().includes(data.command.searchQuery.toLowerCase())
              )
            );
          }
        }
      }

      setMessage(data.message || 'Command processed successfully');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error processing voice command:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Tasks are loaded from localStorage on mount, no need to fetch from API

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Voice-First To-Do List
          </h1>
          <p className="text-gray-600">
            Manage your tasks using natural language voice commands
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <VoiceInput
            onTranscript={handleTranscript}
            onError={handleError}
            disabled={isProcessing}
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isProcessing && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">Processing your command...</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Tasks</h2>
          <TaskList tasks={tasks} message={message} />
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Example Commands:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• "Make me a task to do X"</li>
            <li>• "Show me all administrative tasks"</li>
            <li>• "Delete the task about compliances"</li>
            <li>• "Delete the 4th task"</li>
            <li>• "Push the task about fixing bugs to tomorrow"</li>
            <li>• "Create a high priority task to review code"</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

