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
- **Multi-Model Chat** - Compare up to 5 models side-by-side
- **Chat History** - Persistent storage with Zustand
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

## 🚀 Quick Start

### Option 1: Web Application

#### Prerequisites
- Node.js 20+ 
- npm, yarn, or pnpm

#### Installation

1. **Clone the repository**
```bash
git clone https://github.com/workbydivyanshu/multifariousAI.git
cd multifariousAI
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables** (Optional for free models)
```bash
cp .env.example .env.local
```

4. **Run development server**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

That's it! Start chatting with free models immediately!

### Option 2: Local Models (Ollama)

1. **Install Ollama**
   - **macOS**: `brew install ollama`
   - **Linux**: `curl -fsSL https://ollama.ai/install.sh | sh`
   - **Windows**: Download from [ollama.ai](https://ollama.ai)

2. **Pull some models**
```bash
ollama pull llama3.3
ollama pull mistral
ollama pull qwen2.5
```

3. **Start Ollama**
```bash
ollama serve
```

4. **Import in MultifariousAI**
   - Click the ⚙️ Settings button
   - Enter your Ollama URL (default: `http://localhost:11434`)
   - Click "Import Ollama Models"

### Option 3: Desktop Application (Coming Soon)

```bash
# Coming soon - Electron/Tauri wrapper for offline use
```

---

## 🎯 Getting API Keys (Optional)

### Free Models - No Key Required!

The following models work **without any API key**:
- ✅ DeepSeek R1 (Free)
- ✅ Llama 3.3 70B (Free)
- ✅ Qwen 2.5 72B (Free)
- ✅ Mistral Small 24B (Free)
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

- [ ] **Database Integration** - Supabase/PostgreSQL for cloud sync
- [ ] **User Authentication** - Login/signup with GitHub/Google
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
