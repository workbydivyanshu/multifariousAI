# Authentication Setup Guide

## 🔐 Setting Up GitHub & Google OAuth

### 1. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: MultifariousAI (or your preferred name)
   - **Homepage URL**: `http://localhost:3000` (use your production URL when deploying)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it
7. Add to `.env.local`:
   ```
   GITHUB_CLIENT_ID=your_client_id_here
   GITHUB_CLIENT_SECRET=your_client_secret_here
   ```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in app name, user support email, and developer contact
   - Add scopes: `userinfo.email` and `userinfo.profile`
6. Create OAuth client ID:
   - **Application type**: Web application
   - **Name**: MultifariousAI
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
7. Click **Create** and copy both **Client ID** and **Client Secret**
8. Add to `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

### 3. Update Environment Variables

Create or update `.env.local`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/multifariousai

# Better Auth Secret (generate a random string)
BETTER_AUTH_SECRET=your_random_secret_here_min_32_characters

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generate BETTER_AUTH_SECRET:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 4. Run Database Migrations

```bash
npm run db:push
```

### 5. Start the App

```bash
npm run dev
```

## 🚀 Deployment Notes

### For Production (Vercel, Netlify, etc.):

1. Update OAuth callback URLs to use your production domain:
   - GitHub: `https://yourdomain.com/api/auth/callback/github`
   - Google: `https://yourdomain.com/api/auth/callback/google`

2. Update environment variables:
   - `NEXT_PUBLIC_APP_URL=https://yourdomain.com`

3. Add all environment variables to your hosting platform

## 🔒 Privacy Features

- **Local Storage**: All chat conversations stored in browser localStorage
- **No Server Tracking**: We only use authentication for user identity, not data collection
- **Export/Import**: Users can export their entire chat history as JSON
- **Zero Analytics**: No tracking scripts or cookies beyond authentication

## 📝 User Flow

1. **Homepage** (`/`) - Privacy-focused landing page
2. **Auth Page** (`/auth`) - GitHub & Google sign-in
3. **Chat Page** (`/chat`) - Protected route, requires authentication
4. **Local Storage** - All chats saved locally, not on servers
