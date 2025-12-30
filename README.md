# MultifariousAI 🎉

> **Free & Open-Source Multi-AI Platform** - Chat with 100+ AI models including cloud APIs and local Ollama models, all in one place!

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/workbydivyanshu/multifariousAI?style=for-the-badge)](https://github.com/workbydivyanshu/multifariousAI)

---

## ✨ Features

### 🌐 **Cloud AI Models**
- **100+ Free AI Models** - Use OpenRouter's free tier without API keys
- **Premium Models** - Access Claude 3.5, GPT-4o, and more with your own keys
- **Multiple Providers** - OpenRouter, Google Gemini, Mistral, and more
- **Real-time Streaming** - Watch responses generate character by character

### 💻 **Local AI Models (Ollama)**
- **Ollama Integration** - Run models locally on your machine
- **Privacy First** - No data leaves your device
- **Cost-Free** - Use free local models like Llama, Mistral, Qwen
- **Auto-Discovery** - Automatically import all your Ollama models

### 🔥 **Core Features**
- **User Authentication** - Sign up/login with GitHub or Google OAuth
- **Chat Persistence** - Save conversations to PostgreSQL database
- **Multi-Model Chat** - Compare up to 5 models side-by-side
- **Chat History** - Persistent storage with database
- **Dark Mode** - Beautiful dark theme support
- **File Upload** - Support for images, PDFs, and DOCX files
- **Custom Models** - Add your own OpenRouter or Ollama models
- **Responsive Design** - Works perfectly on desktop and mobile

### 🎨 **Modern UI**
- Clean, intuitive interface built with Tailwind CSS
- Shadcn/ui components for consistent design
- Real-time streaming responses
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

---

## 🚀 Quick Start (For Everyone!)

### 🖥️ Windows Users (Easiest!)

1. **Download Node.js** from [nodejs.org](https://nodejs.org/) and install it
2. **Download this project**: Click the green "Code" button → "Download ZIP" → Extract it
3. **Double-click `START.bat`** in the extracted folder
4. **That's it!** The app opens in your browser automatically

### 🍎 Mac/Linux Users

1. **Install Node.js**: 
   - Mac: `brew install node` or download from [nodejs.org](https://nodejs.org/)
   - Linux: `sudo apt install nodejs npm`
2. **Download this project** and extract it
3. **Open Terminal** in the project folder and run:
   ```bash
   chmod +x START.sh && ./START.sh
   ```
4. **Done!** Opens at http://localhost:3000

---

## 👨‍💻 For Developers

### Prerequisites
- Node.js 20+
- npm, yarn, or pnpm
- PostgreSQL database (optional - for OAuth, chat sharing)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/workbydivyanshu/multifariousAI.git
cd multifariousAI
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open [http://localhost:3000](http://localhost:3000)**

**That's it!** The app works fully locally without any database. Chat history is stored in browser localStorage.

### Advanced Setup (Optional)

For full features like OAuth login and chat sharing, set up environment variables:
```bash
cp .env.example .env.local
```

**Database Setup:**
- Install PostgreSQL locally or use a cloud provider (Supabase, Neon, etc.)
- Create a database named `multifariousai`
- Update `DATABASE_URL` in `.env.local`

**OAuth Setup:**
- **GitHub OAuth**: Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/applications/new)
- **Google OAuth**: Go to [Google Cloud Console > APIs & Credentials](https://console.cloud.google.com/apis/credentials)
- Add your OAuth client IDs and secrets to `.env.local`

**Run database migrations:**
```bash
npm run db:setup
```
```

7. **Open [http://localhost:3000](http://localhost:3000)**

That's it! Sign up/login and start chatting!

### Option 2: Docker Desktop

**Note**: Docker Desktop needs to be running for Docker commands to work.

#### Build and Run with Docker Compose

1. **Ensure Docker Desktop is running**
2. **Build image** (Optional - docker-compose handles this)
```bash
docker-compose build
```

3. **Run container**
```bash
docker-compose up --build
```

4. **Access the app**
```bash
http://localhost:3000
```

#### Troubleshooting Docker Issues

**If Docker daemon is not responding:**
1. **Restart Docker Desktop** - Stop and start Docker Desktop
2. **Check Docker Engine** - Run `docker info` in terminal
3. **Clear cache** - Run `docker system prune -f` to clear build cache
4. **Try direct Docker build**:
```bash
docker build -t multifariousai .
```

**Alternative: Use WSL2 or Git Bash**

If you have WSL2 installed:
```bash
# In WSL2 terminal
cd multifariousAI
docker-compose up --build
```

### Option 3: Alternative: Vercel (Recommended for Production)

#### Deploy to Vercel

1. **Push to GitHub** (already done!)
2. **Go to [vercel.com](https://vercel.com)**
3. **Import project** - Connect GitHub repository
4. **Add environment variables** (if needed)
5. **Deploy**

### Option 4: Local Development (No Docker)

#### Without Docker

1. **Install dependencies**
```bash
npm install
```

2. **Build for production**
```bash
npm run build
```

3. **Run production server**
```bash
npm run start
```

---

## 🎯 Getting API Keys (Optional)

### Free Models - No Key Required!

The following models work **without any API key**:
- ✅ Llama 3.3 70B (Free)
- ✅ Qwen 2.5 72B (Free)
- ✅ Gemma 3 27B (Free)
- ✅ GLM 4.5 Air (Free)
- ✅ And 20+ more free models!

### Premium Models (Optional)

If you want to access premium models, add your API keys in Settings:

#### OpenRouter (Recommended)
1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up and get your API key
3. Paste in Settings to access:
   - Claude 3.5 Sonnet
   - GPT-4o
   - GPT-4o Mini
   - And 100+ more models!

#### Google Gemini
1. Visit [makersuite.google.com](https://makersuite.google.com)
2. Create a project and get your API key
3. Paste in Settings to access Gemini models

#### Mistral
1. Visit [mistral.ai](https://mistral.ai)
2. Get your API key
3. Access Codestral, Pixtral, and Mistral's latest models

---

## 📁 Project Structure

```
multifariousAI/
├── app/                          # Next.js App Router
│   ├── api/                     # API endpoints
│   │   ├── chat/               # Generic chat endpoint
│   │   ├── openrouter/         # OpenRouter API
│   │   ├── gemini/             # Gemini API
│   │   └── ollama/             # Ollama API
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                # Home page
├── components/                    # React components
│   ├── auth/                   # Authentication components
│   ├── chat/                   # Chat interface
│   ├── settings/               # Settings management
│   └── ui/                     # Reusable UI components
├── lib/                         # Utilities
│   ├── models.ts               # AI model catalog
│   ├── useModels.ts           # Model management hook
│   └── utils.ts               # Helper functions
├── stores/                      # State management
│   └── chat-store.ts          # Zustand store
└── types/                       # TypeScript definitions
    └── index.ts                # Shared types
```

---

## 🎨 Features from Inspiration

### From [lokeswaran-aj/open-fiesta](https://github.com/lokeswaran-aj/open-fiesta)
- ✅ Modern streaming architecture with Vercel AI SDK
- ✅ Multi-provider support
- ✅ Rate limiting
- ✅ Database persistence (Planned)

### From [NiladriHazra/Open-Fiesta](https://github.com/NiladriHazra/Open-Fiesta)
- ✅ Ollama local model support
- ✅ Free pool models from OpenRouter
- ✅ File upload (PDF, DOCX, images)
- ✅ Modular API routes
- ✅ Docker support

### Unique to MultifariousAI
- ✅ Unified free + paid + local models
- ✅ Easy model import from Ollama
- ✅ Custom model addition
- ✅ Desktop app support (Coming soon)
- ✅ Provider-agnostic architecture

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

### Docker Support

```bash
docker-compose up --build
```

---

## 🌟 Available Free Models

### Text Models
| Model | Context | Provider |
|-------|---------|----------|
| DeepSeek R1 | 64K | OpenRouter |
| Llama 3.3 70B | 128K | OpenRouter |
| Qwen 2.5 72B | 32K | OpenRouter |
| Mistral Small 24B | 32K | OpenRouter |
| Gemma 3 27B | 128K | OpenRouter |
| GLM 4.5 Air | 128K | OpenRouter |
| Hunyuan A13B | 32K | OpenRouter |

### Image Models
| Model | Provider |
|-------|----------|
| Gemini 2.5 Flash Image | OpenRouter |

### Coding Models
| Model | Provider |
|-------|----------|
| DeepCoder 14B | OpenRouter |

---

## 🚧 Roadmap

- [x] **Database Integration** - PostgreSQL with Drizzle ORM
- [x] **User Authentication** - Better Auth with GitHub/Google OAuth
- [ ] **Conversation Sharing** - Share chats via public links
- [ ] **Chat Export** - Export to Markdown, PDF
- [ ] **Desktop Application** - Electron/Tauri for offline use
- [ ] **Web Search** - Integrate web search with responses
- [ ] **Voice Input/Output** - Speech-to-text and TTS
- [ ] **Mobile App** - React Native version
- [ ] **Plugin System** - Community plugins for new providers
- [ ] **API Rate Limiting** - Fair usage limits for free tier

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## 🙏 Acknowledgments

- **Inspiration**: 
  - [Open Fiesta](https://github.com/lokeswaran-aj/open-fiesta) by lokeswaran-aj
  - [Open-Fiesta](https://github.com/NiladriHazra/Open-Fiesta) by NiladriHazra
- **Models**: OpenRouter, Google Gemini, Ollama, Mistral AI
- **UI Components**: shadcn/ui, Radix UI
- **AI SDK**: Vercel AI SDK

---

## 📞 Support

- 📧 Email: support@multifariousai.com (Coming soon)
- 🐛 Issues: [GitHub Issues](https://github.com/workbydivyanshu/multifariousAI/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/workbydivyanshu/multifariousAI/discussions)

---

Made with ❤️ by [workbydivyanshu](https://github.com/workbydivyanshu)

**⭐ If you find this project helpful, please star it on GitHub!**
