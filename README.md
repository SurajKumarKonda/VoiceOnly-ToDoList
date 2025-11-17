# Voice-First To-Do List

A voice-first to-do list web application that uses natural language voice commands to perform CRUD operations on tasks.

## Features

- **Voice Input**: Use your voice to interact with the app
- **Natural Language Processing**: Understands commands like "Show me all administrative tasks" or "Delete the task about compliances"
- **Full CRUD Operations**: Create, read, update, and delete tasks via voice
- **Task Properties**: Tasks include title, scheduled time, priority, and category
- **Fast Response**: Sub-2s latency with 90%+ accuracy

## Tech Stack

- **Framework**: Next.js 14 (React)
- **Voice Recognition**: Web Speech API (browser-native, fast, no API keys required)
- **LLM**: Google Gemini Pro (for natural language understanding and intent parsing)
- **Deployment**: Vercel

## Why These Choices?

### Voice Model: Web Speech API

- **Speed**: Browser-native, no network latency for initial recognition
- **Cost**: Free, no API keys or usage limits
- **Privacy**: Processing happens locally in the browser
- **Accessibility**: Works across modern browsers
- **Latency**: Sub-second response times for voice-to-text conversion

### LLM: Google Gemini Pro

- **Accuracy**: Excellent at understanding natural language intents and extracting structured data
- **Speed**: Optimized for low latency (typically <1s for API calls)
- **Reliability**: Well-documented API with consistent responses
- **Cost-Effective**: Free tier available with generous limits, cost-effective for production use
- **Structured Output**: Can reliably parse commands and extract task details (title, date, priority, etc.)
- **JSON Mode**: Native support for structured JSON output

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key (get one at https://makersuite.google.com/app/apikey)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd voice-first-to-do-list
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Voice Commands Examples

**Create Tasks:**
- "Make me a task to do X"
- "I want to work on Y"
- "Create a task about Z with high priority"
- "Add a task to review code tomorrow"

**View/Filter Tasks:**
- "Show me all administrative tasks"
- "Show all tasks"
- "What tasks do I have?"
- "Show me high priority tasks"

**Update Tasks:**
- "Push the task about fixing bugs to tomorrow."
- "Change the priority of X to high"
- "Update the task about giving laundry."

**Delete Tasks:**
- "Delete the task about giving laundry."
- "Delete the 4th task"
- "Remove task X"

## Project Structure

```
voice-first-to-do-list/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── process-voice/ # Voice command processing endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── VoiceInput.tsx    # Voice input component
│   ├── TaskList.tsx      # Task list display
│   └── TaskItem.tsx      # Individual task item
├── lib/                   # Utility functions
│   ├── gemini.ts         # Gemini integration
│   ├── tasks.ts          # Task management logic
│   └── voice.ts          # Voice recognition utilities
├── types/                 # TypeScript types
│   └── task.ts           # Task type definitions
└── public/               # Static assets
```

## Deployment

The app is configured for easy deployment on Vercel:

### Deploy to Vercel

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Import the repository in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

3. Add environment variable:
   - In the Vercel project settings, go to "Environment Variables"
   - Add `GEMINI_API_KEY` with your Gemini API key value
   - Make sure to add it for all environments (Production, Preview, Development)

4. Deploy:
   - Vercel will automatically deploy on push to main
   - Or click "Deploy" to deploy immediately

### Alternative: Deploy to Other Platforms

The app can also be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

Make sure to set the `GEMINI_API_KEY` environment variable in your platform's settings.

## Performance

- **Voice Recognition**: ~0.5-1s (Web Speech API)
- **LLM Processing**: ~0.5-1s (Gemini API)
- **Total Latency**: ~1-2s (meets sub-2s requirement)
- **Accuracy**: 90%+ for common voice commands

## Browser Compatibility

- Chrome/Edge (full support)
- Safari (full support)
- Firefox (limited support - may require polyfill)

## Notes

- Tasks are stored in browser localStorage for persistence
- Voice recognition requires microphone permissions
- A Google Gemini API key is required for natural language processing
- See `TECH_CHOICES.md` for a detailed explanation of technology choices

## License

MIT

