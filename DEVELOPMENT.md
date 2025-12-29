# Development Guide

This guide will help you set up and start developing MultifariousAI locally.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Required for OpenRouter models
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional for Gemini models
GEMINI_API_KEY=your_gemini_api_key_here

# Optional for Supabase auth & persistence
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional for local Ollama models
OLLAMA_URL=http://localhost:11434

# Optional - bypass auth for local dev
NEXT_PUBLIC_BYPASS_AUTH=1
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Architecture

### Data Flow

1. **User Input** → ChatInput component
2. **Message Store** → Zustand chat-store
3. **API Call** → /api/chat endpoint
4. **AI Provider** → OpenRouter/Gemini API
5. **Streaming Response** → OpenAIStream
6. **Display** → ChatMessages component

### State Management

We use **Zustand** for state management with persistence:

```typescript
// Stores/chat-store.ts
- threads: All chat conversations
- currentThreadId: Active chat
- selectedModels: Up to 5 AI models
- isStreaming: Stream status

// Persistence
- Saved to localStorage via Zustand persist middleware
```

### Component Hierarchy

```
app/page.tsx
└── ChatInterface
    ├── ChatSidebar
    └── ChatMain
        ├── ChatHeader
        ├── ChatMessages
        ├── ModelSelector
        └── ChatInput
```

## Adding New AI Providers

### Step 1: Define Provider in `lib/models.ts`

```typescript
{
  id: 'your-provider',
  name: 'Provider Name',
  baseUrl: 'https://api.example.com/v1',
  apiKey: process.env.YOUR_API_KEY || '',
  models: [
    {
      id: 'your-provider/model-name',
      name: 'Model Display Name',
      provider: 'Provider Name',
      context: 128000,
      description: 'Model description'
    }
  ]
}
```

### Step 2: Add Environment Variable

Add to `.env.example`:
```env
YOUR_API_KEY=your_api_key_here
```

### Step 3: Update API Route

Modify `app/api/chat/route.ts` to handle the new provider if needed.

## Adding UI Components

We use **shadcn/ui** style components. Follow these steps:

### 1. Create Component in `components/ui/`

```typescript
// components/ui/your-component.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface YourComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  // props
}

const YourComponent = React.forwardRef<HTMLDivElement, YourComponentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("base-classes", className)}
        {...props}
      />
    )
  }
)
YourComponent.displayName = "YourComponent"

export { YourComponent }
```

### 2. Import and Use

```typescript
import { YourComponent } from "@/components/ui/your-component"

<YourComponent className="custom-class">
  Content
</YourComponent>
```

## Styling Guide

### Tailwind CSS

We use Tailwind CSS with custom CSS variables:

```css
/* app/globals.css */
--background, --foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--border, --input, --ring
```

### Custom Classes

Use the `cn()` utility for conditional classes:

```typescript
import { cn } from "@/lib/utils"

<div className={cn(
  "base-class",
  isActive && "active-class",
  className
)} />
```

## API Development

### Creating API Routes

```typescript
// app/api/your-endpoint/route.ts
export async function GET(req: Request) {
  // Handle GET
  return Response.json({ data })
}

export async function POST(req: Request) {
  const body = await req.json()
  // Handle POST
  return Response.json({ success: true })
}
```

### Error Handling

```typescript
try {
  // Your code
} catch (error) {
  console.error('Error:', error)
  return new Response('Error message', { status: 500 })
}
```

## Testing

### Manual Testing Checklist

- [ ] Create new chat
- [ ] Send message to single model
- [ ] Send message to multiple models
- [ ] Compare side-by-side responses
- [ ] Switch between chats
- [ ] Delete chat
- [ ] Toggle dark mode
- [ ] Mobile responsive design
- [ ] Streaming works properly
- [ ] Error handling for missing API keys

### API Testing

Use curl or Postman:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "openai/gpt-4o",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

## Debugging

### Console Logging

```typescript
console.log('Debug:', data)
console.error('Error:', error)
```

### React DevTools

Install [React Developer Tools](https://react.dev/learn/react-developer-tools)

### Network Tab

Check browser DevTools Network tab to see:
- API requests
- Response status
- Streaming data

## Common Issues

### API Key Not Working

1. Check `.env.local` is in project root
2. Restart dev server after adding API keys
3. Verify key is correct and has credits

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript Errors

```bash
# Check types
npx tsc --noEmit
```

### Port Already in Use

```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

## Performance Tips

1. **Memoization**: Use `useMemo` for expensive computations
2. **Callback**: Use `useCallback` for callbacks passed to children
3. **Lazy Loading**: Use `React.lazy()` for heavy components
4. **Code Splitting**: Dynamic imports for large libraries

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker-compose up --build
```

### Manual Build

```bash
npm run build
npm run start
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Zustand](https://zustand-demo.pmnd.rs)
- [shadcn/ui](https://ui.shadcn.com)

## Getting Help

- Check [CONTRIBUTING.md](./CONTRIBUTING.md)
- Search [existing issues](https://github.com/workbydivyanshu/multifariousAI/issues)
- Start a [discussion](https://github.com/workbydivyanshu/multifariousAI/discussions)

Happy coding! 🚀
