# API Documentation

## Overview

MultifariousAI provides a unified REST API for interacting with multiple AI providers through a single interface.

---

## Unified Chat Endpoint

### `POST /api/chat`

Send a message and get streamed responses from AI models.

#### Request

```typescript
{
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>,
  model: string,  // Model name (e.g., 'gpt-4', 'llama-2')
  provider: 'openrouter' | 'gemini' | 'ollama',
  apiKey?: string,  // Optional: OpenRouter or Gemini API key
  baseUrl?: string  // Optional: Ollama base URL (default: http://localhost:11434)
}
```

#### Response (Server-Sent Events)

```
data: {"content": "Hello"}
data: {"content": " there"}
data: {"content": "!"}
data: [DONE]
```

#### Example

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "deepseek-r1:free",
    "provider": "openrouter"
  }'
```

#### Supported Models

##### OpenRouter (Free Pool)
- `deepseek/deepseek-r1:free` - DeepSeek R1
- `meta-llama/llama-3.3-70b-instruct:free` - Llama 3.3 70B
- `qwen/qwen-2.5-72b-instruct:free` - Qwen 2.5 72B
- `mistralai/mistral-small-24b-instruct-2501:free` - Mistral Small
- `google/gemma-3-27b-it:free` - Gemma 3 27B

See `lib/models.ts` for full list (100+ models).

##### Gemini
- `gemini-2.0-flash` - Gemini 2.0 Flash
- `gemini-1.5-pro` - Gemini 1.5 Pro
- `gemini-1.5-flash` - Gemini 1.5 Flash

##### Ollama (Local Models)
- Any model installed locally
- Example: `llama2`, `mistral`, `neural-chat`

---

## Provider-Specific Endpoints

### OpenRouter

#### `POST /api/openrouter`

```typescript
{
  messages: Array<{ role: string, content: string }>,
  model: string,
  apiKey?: string  // Falls back to OPENROUTER_API_KEY env var
}
```

### Gemini

#### `POST /api/gemini`

```typescript
{
  messages: Array<{ role: string, content: string }>,
  model: string,
  apiKey?: string  // Falls back to GEMINI_API_KEY env var
}
```

### Ollama

#### `POST /api/ollama`

```typescript
{
  messages: Array<{ role: string, content: string }>,
  model: string,
  baseUrl?: string  // Falls back to OLLAMA_URL env var
}
```

#### `GET /api/ollama?baseUrl=...`

Get list of available Ollama models.

##### Response

```json
{
  "models": [
    {
      "id": "llama2",
      "label": "llama2",
      "provider": "ollama",
      "model": "llama2",
      "size": 3956826137,
      "modified_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## Chat Persistence

### `POST /api/chat` (Database)

#### Create Chat

```bash
curl -X POST http://localhost:3000/api/chat/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <session-token>" \
  -d '{
    "title": "My First Chat"
  }'
```

#### Get Chat History

```bash
curl http://localhost:3000/api/chat/history \
  -H "Authorization: Bearer <session-token>"
```

#### Share Chat

```bash
curl -X POST http://localhost:3000/api/chat/share \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "chat-123"
  }'
```

---

## Authentication

### Login/Signup

#### `POST /api/auth/sign-up`

```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "name": "User Name"
}
```

#### `POST /api/auth/sign-in`

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

#### `GET /api/auth/session`

Get current user session.

### OAuth

#### GitHub

```
GET /api/auth/callback/github?code=...&state=...
```

#### Google

```
GET /api/auth/callback/google?code=...&state=...
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "details": "Technical details (if available)"
}
```

### Common Error Codes

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Model is required | Include `model` in request |
| 400 | Provider is required | Include `provider` in request |
| 401 | API key is required | Add API key to env or request |
| 401 | Unauthorized | Check authentication |
| 429 | Too many requests | Wait before retrying |
| 500 | Internal server error | Check server logs |

---

## Rate Limiting

- **OpenRouter**: Depends on your plan
- **Gemini**: Varies by tier
- **Ollama**: No limits (local)
- **Free Models**: Subject to fair use limits

Set `MAX_OUTPUT_TOKENS` env var to limit response length.

---

## Streaming

All endpoints support Server-Sent Events (SSE) for streaming responses.

### JavaScript Example

```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello' }],
    model: 'deepseek-r1:free',
    provider: 'openrouter'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.content) {
        console.log(data.content);
      }
    }
  }
}
```

### cURL Example (Streaming)

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  --data-raw '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "deepseek-r1:free",
    "provider": "openrouter"
  }' \
  -N  # Disable buffering to see streaming output
```

---

## Best Practices

### 1. API Key Management

```javascript
// ✅ Good: Use environment variables
const apiKey = process.env.OPENROUTER_API_KEY;

// ❌ Bad: Hardcode keys
const apiKey = 'sk-xxxxx';

// ✅ Good: Use secure localStorage (client-side only)
localStorage.setItem('openrouter-key', apiKey);
```

### 2. Error Handling

```javascript
try {
  const response = await fetch('/api/chat', { ... });
  if (!response.ok) {
    const error = await response.json();
    console.error(error.error);
    // Show user-friendly message
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### 3. Message Format

```javascript
// Good message history
const messages = [
  { role: 'user', content: 'Hello' },
  { role: 'assistant', content: 'Hi there!' },
  { role: 'user', content: 'How are you?' }
];

// Always maintain role alternation and order
```

### 4. Resource Cleanup

```javascript
// Clean up event listeners
const reader = response.body.getReader();

// ... on error or completion:
reader.cancel();
```

---

## Rate Limits

### Free Tier
- OpenRouter: 5 requests per minute
- Gemini: 60 requests per minute
- Ollama: Unlimited (local)

### Best Practices
- Implement exponential backoff
- Cache responses when possible
- Batch requests efficiently
- Monitor usage

---

## Webhooks (Coming Soon)

Subscribe to chat events:
- Message sent
- Streaming started/completed
- Error occurred
- Chat shared

---

## SDKs & Libraries

### JavaScript/TypeScript

```javascript
import { MultifariousAI } from '@multifariousai/sdk';

const client = new MultifariousAI({
  apiKey: 'optional-auth-key'
});

const response = await client.chat.send({
  messages: [{ role: 'user', content: 'Hello' }],
  model: 'deepseek-r1:free',
  provider: 'openrouter'
});
```

### Python (Coming Soon)

```python
from multifariousai import AsyncClient

client = AsyncClient(api_key="optional-auth-key")

async def main():
    async with client.chat.stream(
        model="deepseek-r1:free",
        provider="openrouter",
        messages=[{"role": "user", "content": "Hello"}]
    ) as response:
        async for chunk in response:
            print(chunk.content, end="")
```

---

## Support

- Documentation: https://github.com/workbydivyanshu/multifariousAI
- Issues: https://github.com/workbydivyanshu/multifariousAI/issues
- Discussions: https://github.com/workbydivyanshu/multifariousAI/discussions

---

**Last Updated**: December 30, 2025  
**API Version**: 1.0
