# 🚀 Quick Start Guide

## What's New?

Your MultifariousAI app now has:
- 🔐 **GitHub & Google Authentication**
- 🏠 **Privacy-Focused Landing Page**
- 💾 **Local Chat Storage** (no server storage)
- 📤 **Export/Import Chat History**
- 🛡️ **Protected Chat Routes**

## 5-Minute Setup

### 1. Generate Auth Secret

Run this command:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copy the output (you'll need it in step 3).

### 2. Set Up OAuth Apps

#### GitHub (2 minutes):
1. Open: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   - Name: `MultifariousAI Dev`
   - Homepage: `http://localhost:3001`
   - Callback: `http://localhost:3001/api/auth/callback/github`
4. Click **"Register application"**
5. Copy **Client ID**
6. Click **"Generate a new client secret"** and copy it

#### Google (3 minutes):
1. Open: https://console.cloud.google.com
2. Create new project (or select existing)
3. Go to: **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. Configure consent screen (if first time):
   - User type: **External**
   - App name: `MultifariousAI`
   - Add scopes: `userinfo.email`, `userinfo.profile`
6. Create OAuth client:
   - Type: **Web application**
   - Name: `MultifariousAI Dev`
   - Authorized origins: `http://localhost:3001`
   - Authorized redirects: `http://localhost:3001/api/auth/callback/google`
7. Copy **Client ID** and **Client Secret**

### 3. Configure Environment Variables

Create `.env.local` in your project root:

```bash
# Database (update with your PostgreSQL details)
DATABASE_URL=postgresql://postgres:password@localhost:5432/multifariousai

# Better Auth Secret (paste from step 1)
BETTER_AUTH_SECRET=paste_the_base64_string_here

# GitHub OAuth (paste from step 2)
GITHUB_CLIENT_ID=paste_github_client_id
GITHUB_CLIENT_SECRET=paste_github_client_secret

# Google OAuth (paste from step 2)
GOOGLE_CLIENT_ID=paste_google_client_id
GOOGLE_CLIENT_SECRET=paste_google_client_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 4. Set Up Database

Make sure PostgreSQL is running, then:

```bash
npm run db:push
```

### 5. Start the App

```bash
npm run dev
```

Visit: http://localhost:3001

## 🧪 Test the Flow

1. **Homepage**: You should see privacy-focused landing page
2. Click **"Get Started"** → redirects to `/auth`
3. Click **"Continue with GitHub"** or **"Continue with Google"**
4. Sign in with your account
5. Redirects to `/chat` (protected route)
6. Start chatting with AI models
7. Click your **avatar** in top-right corner
8. Try:
   - **Export Chat History** (downloads JSON)
   - **Import Chat History** (upload the JSON)
   - **Clear All Chats** (with confirmation)
   - **Sign Out** (redirects to homepage)

## 🔍 Troubleshooting

### "BETTER_AUTH_SECRET required" error
- Make sure `.env.local` exists in project root
- Restart dev server after adding env vars

### "Database connection failed"
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env.local`
- Run `npm run db:push` to create tables

### OAuth callback error
- Verify callback URLs match exactly:
  - GitHub: `http://localhost:3001/api/auth/callback/github`
  - Google: `http://localhost:3001/api/auth/callback/google`
- Check Client ID and Secret are correct

### Middleware error
- Make sure `middleware.ts` exists in project root
- Clear `.next` folder and rebuild: `rm -rf .next && npm run dev`

## 📁 Where Your Data Lives

### In Database (PostgreSQL):
- ✅ Your email address
- ✅ OAuth account info (GitHub/Google)
- ✅ Session tokens

### In Browser (localStorage):
- ✅ **All your chat messages**
- ✅ **All AI responses**
- ✅ **Chat history**

### NOT Stored Anywhere:
- ❌ No analytics
- ❌ No tracking cookies
- ❌ No server-side chat logs

## 🎯 Next Steps

1. **Customize Landing Page**: Edit `app/page.tsx`
2. **Add More Models**: Click "Add Models" in chat interface
3. **Configure API Keys**: Click "Settings" icon in chat header
4. **Deploy**: Follow deployment guide in `AUTH_SETUP.md`

## 📚 Documentation

- `AUTH_SETUP.md` - Detailed OAuth setup
- `AUTHENTICATION_IMPLEMENTATION.md` - Technical implementation details
- `QUICKSTART.md` - General app usage

## 🎉 You're Done!

Your app is now fully privacy-focused with:
- ✅ Secure authentication
- ✅ Local chat storage
- ✅ Export/import capabilities
- ✅ Zero server tracking

Enjoy your private AI chat experience! 🚀
