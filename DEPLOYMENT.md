# Deployment Guide

## Quick Start

1. **Set up environment variables:**
   - Create `.env.local` file in the root directory
   - Add: `GEMINI_API_KEY=your_key_here`

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run locally:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Vercel Deployment

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. **Important**: Add environment variable:
   - Name: `GEMINI_API_KEY`
   - Value: Your Google Gemini API key
   - Apply to: All environments (Production, Preview, Development)
6. Click "Deploy"

### Step 3: Verify Deployment

- Your app will be available at `https://your-project.vercel.app`
- Test voice commands to ensure everything works
- Check browser console for any errors

## Environment Variables

### Required
- `GEMINI_API_KEY`: Your Google Gemini API key from https://makersuite.google.com/app/apikey

### Optional
- None currently

## Troubleshooting

### Voice recognition not working
- Ensure you're using Chrome, Edge, or Safari
- Check browser permissions for microphone access
- Try refreshing the page

### API errors
- Verify `GEMINI_API_KEY` is set correctly in Vercel
- Check Vercel function logs for detailed error messages
- Ensure your Gemini API key is valid and has quota available

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 18+)
- Review build logs in Vercel dashboard

## Testing Checklist

Before submitting:
- [ ] Voice input works (click microphone button)
- [ ] Can create tasks via voice ("Make me a task to do X")
- [ ] Can view all tasks ("Show all tasks")
- [ ] Can filter tasks ("Show me all administrative tasks")
- [ ] Can delete tasks ("Delete the 4th task")
- [ ] Can update tasks ("Push task X to tomorrow")
- [ ] Tasks persist after page refresh (localStorage)
- [ ] UI is responsive and looks good
- [ ] Error messages display correctly
- [ ] Loading states work properly

## Performance Verification

- Voice recognition: Should complete in <1s
- LLM processing: Should complete in <1s
- Total latency: Should be <2s from voice input to task update
- Accuracy: Should understand 90%+ of common commands


