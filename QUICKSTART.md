# Quick Start Guide

## 🎯 **Option 1: Local Development (Simplest - Recommended)**

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Environment File (Optional)
```bash
cp .env.example .env.local
```

### Step 3: Run Development Server
```bash
npm run dev
```

### Step 4: Open in Browser
```
http://localhost:3000
```

**That's it!** No Docker setup needed for local development. ✅

---

## 🐳 **Option 2: Docker Deployment**

### Prerequisites
- **Docker Desktop** must be running
- Or use Docker command line with Docker Desktop started

### Step 1: Build with Docker Compose
```bash
docker-compose build
```

### Step 2: Run Container
```bash
docker-compose up
```

### Step 3: Access Application
```
http://localhost:3000
```

---

## 🚀 **Option 3: Vercel Deployment (Production)**

### Step 1: Already on GitHub! ✅

Repository is at: https://github.com/workbydivyanshu/multifariousAI.git

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect your GitHub account
4. Select `workbydivyanshu/multifariousAI`
5. Click "Deploy"

---

## 🐛 **Troubleshooting**

### Docker Desktop Issues

**If Docker daemon is not responding:**
1. Open Docker Desktop
2. Click "Troubleshoot"
3. Select "Clean / Purge Data"
4. Restart Docker Desktop

**If docker compose command fails:**
1. Restart Docker Desktop
2. Try: `docker-compose build --no-cache`
3. Clear Docker cache: `docker system prune -f`

**If npm command not found:**
1. Check your PATH: `echo $PATH`
2. Use full path to npm: `C:/Program Files/nodejs/npm.cmd install`
3. Or use pnpm: `pnpm install`

---

## 📋 **Environment Variables (Optional)**

For cloud AI models (free models work without any key):

```env
OPENROUTER_API_KEY=sk-or-...
GEMINI_API_KEY=AIza...
```

For local AI models (Ollama):

```env
OLLAMA_URL=http://localhost:11434
```

---

## 🎉 **Summary**

**What's Included:**
- ✅ 100+ AI models (20+ free, no key required)
- ✅ Local AI support via Ollama
- ✅ Multi-model comparison (up to 5 models)
- ✅ Modern UI with dark mode
- ✅ Chat persistence
- ✅ Settings panel for API keys
- ✅ Complete Docker support

**Ready to use immediately!** 🚀
