# Quick Deployment Guide

## 🚀 Deploy to Vercel (Recommended - FREE)

### Prerequisites
- GitHub account
- Google Gemini API key

### Steps:

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Import your repository
   - Vercel auto-detects Next.js ✅

3. **Add Environment Variable:**
   - In the "Environment Variables" section
   - Add: `GEMINI_API_KEY` = `your_gemini_api_key`
   - Select: Production, Preview, Development
   - Click "Deploy"

4. **Done!** 
   - Your app will be live at: `https://your-project.vercel.app`
   - HTTPS is automatic ✅
   - Voice recognition will work ✅

---

## 🌐 Alternative Free Options

### Netlify (Also FREE)
1. Push to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com)
3. "Add new site" → "Import from Git"
4. Select your repo
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variable: `GEMINI_API_KEY`
7. Deploy!

### Railway (FREE tier available)
1. Push to GitHub
2. Go to [railway.app](https://railway.app)
3. "New Project" → "Deploy from GitHub"
4. Select your repo
5. Add environment variable: `GEMINI_API_KEY`
6. Deploy!

### Render (FREE tier available)
1. Push to GitHub
2. Go to [render.com](https://render.com)
3. "New" → "Web Service"
4. Connect GitHub repo
5. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Add environment variable: `GEMINI_API_KEY`
7. Deploy!

---

## ⚠️ Important Notes

- **HTTPS Required**: Web Speech API requires HTTPS (all platforms provide this)
- **Environment Variables**: Make sure to add `GEMINI_API_KEY` in platform settings
- **Voice Recognition**: Works best in Chrome/Edge/Safari browsers
- **Free Tier Limits**: 
  - Vercel: 100GB bandwidth/month, unlimited requests
  - Netlify: 100GB bandwidth/month
  - Railway: $5 free credit/month
  - Render: 750 hours/month free

---

## 🎯 Recommended: Vercel

**Why Vercel?**
- ✅ Made by Next.js team (perfect integration)
- ✅ Zero configuration needed
- ✅ Automatic HTTPS
- ✅ Free custom domain
- ✅ Automatic deployments on git push
- ✅ Generous free tier
- ✅ Fast global CDN

