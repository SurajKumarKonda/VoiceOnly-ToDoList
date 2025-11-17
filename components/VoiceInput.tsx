'use client';

/**
 * VoiceInput Component
 * Handles voice input using Web Speech API
 */

import { useState, useEffect } from 'react';
import { isSpeechRecognitionSupported, startVoiceRecognition } from '@/lib/voice';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({ onTranscript, onError, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported (client-side only)
    if (typeof window !== 'undefined') {
      const supported = isSpeechRecognitionSupported();
      setIsSupported(supported);
      if (!supported) {
        const browser = navigator.userAgent;
        let browserName = 'your browser';
        if (browser.includes('Firefox')) {
          browserName = 'Firefox';
        } else if (browser.includes('Chrome')) {
          browserName = 'Chrome';
        } else if (browser.includes('Safari')) {
          browserName = 'Safari';
        } else if (browser.includes('Edge')) {
          browserName = 'Edge';
        }
        
        // Check if it's an HTTPS issue
        const isSecure = 
          window.location.protocol === 'https:' || 
          window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1';
        
        let errorMsg = '';
        if (!isSecure && window.location.protocol === 'http:') {
          errorMsg = 'Web Speech API requires HTTPS. Please access the app via HTTPS or use localhost.';
        } else if (browser.includes('Firefox')) {
          errorMsg = 'Speech recognition is not supported in Firefox. Please use Chrome, Edge, or Safari.';
        } else {
          errorMsg = `Speech recognition is not supported in ${browserName}. Please use Chrome, Edge, or Safari.`;
        }
        
        onError(errorMsg);
      }
    }
  }, [onError]);

  const handleStartListening = async () => {
    if (disabled || isListening) return;

    try {
      setIsListening(true);
      setTranscript('');
      
      const result = await startVoiceRecognition();
      setTranscript(result);
      onTranscript(result);
    } catch (error: any) {
      onError(error.message || 'Failed to recognize speech');
    } finally {
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    // Stop listening is handled by the promise resolution
    setIsListening(false);
  };

  return (
    <div className="voice-input-container">
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={isListening ? handleStopListening : handleStartListening}
          disabled={disabled || isSupported === false}
          className={`
            relative w-20 h-20 rounded-full flex items-center justify-center
            transition-all duration-200
            ${isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600'
            }
            ${disabled || isSupported === false
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:scale-105 active:scale-95'
            }
            shadow-lg hover:shadow-xl
            ${isSupported === null ? 'animate-pulse' : ''}
          `}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
          title={isSupported === false ? 'Speech recognition not supported in this browser' : 'Click to start voice input'}
        >
          {isListening ? (
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
        
        <p className="text-sm text-gray-600">
          {isSupported === null 
            ? 'Checking browser support...' 
            : isSupported === false 
            ? 'Not supported in this browser' 
            : isListening 
            ? 'Listening...' 
            : 'Click to speak'}
        </p>
        
        {transcript && (
          <div className="mt-2 p-3 bg-gray-100 rounded-lg max-w-md">
            <p className="text-sm text-gray-700">
              <strong>You said:</strong> {transcript}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

