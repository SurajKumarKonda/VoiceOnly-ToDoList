/**
 * Voice recognition utilities
 * Wrapper around Web Speech API for voice input
 */

/**
 * Check if the browser supports Web Speech API
 * Note: Web Speech API requires HTTPS (except for localhost)
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if running on HTTPS or localhost
  const isSecure = 
    window.location.protocol === 'https:' || 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1';

  if (!isSecure) {
    console.warn('Web Speech API requires HTTPS (or localhost)');
    return false;
  }

  // Check if SpeechRecognition is available
  const hasSupport = 
    'webkitSpeechRecognition' in window || 
    'SpeechRecognition' in window;

  if (!hasSupport) {
    console.warn('SpeechRecognition not found in window object');
    console.log('Available window properties:', Object.keys(window).filter(k => k.toLowerCase().includes('speech')));
  }

  return hasSupport;
}

/**
 * Get the SpeechRecognition constructor for the current browser
 */
export function getSpeechRecognition(): typeof SpeechRecognition | typeof webkitSpeechRecognition | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // @ts-ignore - Browser-specific types
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * Create and configure a SpeechRecognition instance
 */
export function createSpeechRecognition(): SpeechRecognition | null {
  const SpeechRecognition = getSpeechRecognition();
  
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  
  // Configure recognition settings
  recognition.continuous = false; // Stop after first result
  recognition.interimResults = false; // Only return final results
  recognition.lang = 'en-US'; // Set language to English
  
  return recognition;
}

/**
 * Start voice recognition and return a promise that resolves with the transcript
 */
export function startVoiceRecognition(): Promise<string> {
  return new Promise((resolve, reject) => {
    const recognition = createSpeechRecognition();
    
    if (!recognition) {
      reject(new Error('Speech recognition is not supported in this browser'));
      return;
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (event) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      // Recognition ended naturally
    };

    recognition.start();
  });
}


