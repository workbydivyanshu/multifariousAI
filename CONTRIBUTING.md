# Contributing to MultifariousAI

Thank you for your interest in contributing to MultifariousAI! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm, yarn, or pnpm
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/multifariousAI.git
   cd multifariousAI
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

5. Add your API keys to `.env.local`

6. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
multifariousAI/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── chat/          # Chat endpoint
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── chat/              # Chat-related components
│   ├── ui/                # Reusable UI components
│   └── theme-provider.tsx # Theme provider
├── lib/                   # Utility libraries
│   ├── models.ts          # AI model catalog
│   └── utils.ts           # Helper functions
├── stores/                # State management
│   └── chat-store.ts      # Zustand store
├── types/                 # TypeScript type definitions
│   └── chat.ts            # Chat-related types
└── public/                # Static assets
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper type definitions
- Export types when they need to be used by other modules
- Use interfaces for object shapes, types for unions/primitives

### React

- Use functional components with hooks
- Keep components small and focused
- Use `useCallback` and `useMemo` for performance optimization when needed
- Follow the hooks rules of hooks

### Styling

- Use Tailwind CSS for styling
- Follow the existing color scheme and spacing
- Use the `cn()` utility for conditional classes
- Keep component-specific styles in the component file

### File Naming

- Use kebab-case for component files: `chat-input.tsx`
- Use PascalCase for component names: `ChatInput`
- Use kebab-case for utilities: `chat-store.ts`

### Code Organization

- Group related functions together
- Add JSDoc comments for complex functions
- Keep files under 300 lines when possible
- Extract repeated logic into custom hooks

## Development Workflow

### Branching

- `main` - Production branch
- `develop` - Development branch
- `feat/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feat/your-feature-name
```

### Making Changes

1. Make your changes
2. Test thoroughly
3. Run linter and type checker:
   ```bash
   npm run lint
   ```

4. Build the project to ensure no errors:
   ```bash
   npm run build
   ```

### Committing

Use conventional commits:

- `feat: add new feature`
- `fix: resolve bug`
- `docs: update readme`
- `refactor: optimize code`
- `test: add tests`
- `chore: update dependencies`

Example:
```bash
git commit -m "feat: add model comparison feature"
```

### Pull Requests

1. Push your branch:
   ```bash
   git push origin feat/your-feature-name
   ```

2. Create a Pull Request on GitHub

3. Fill in the PR template:
   - Describe your changes
   - Link related issues
   - Add screenshots for UI changes
   - Confirm you've tested

4. Wait for review and address feedback

## Areas to Contribute

### High Priority

- [ ] Add more AI providers (Ollama, Together AI, etc.)
- [ ] Implement chat history persistence
- [ ] Add web search integration
- [ ] Image upload support
- [ ] Mobile responsiveness improvements

### Medium Priority

- [ ] Model settings (temperature, max tokens, etc.)
- [ ] Chat export functionality
- [ ] Shareable conversation links
- [ ] Keyboard shortcuts
- [ ] Custom themes

### Low Priority

- [ ] Better error handling
- [ ] Loading animations
- [ ] Sound effects
- [ ] Voice input/output
- [ ] Multi-language support

## Testing

Before submitting, ensure:

1. The app builds successfully: `npm run build`
2. No linting errors: `npm run lint`
3. Features work as expected
4. Responsive design works
5. Dark mode works

## Reporting Bugs

When reporting bugs:

1. Check existing issues first
2. Use the bug report template
3. Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots/videos
   - Environment details (OS, browser, Node version)
   - Console errors

## Feature Requests

When suggesting features:

1. Check existing feature requests
2. Use the feature request template
3. Explain the use case
4. Provide examples if possible
5. Consider the implementation complexity

## Questions?

If you have questions:

- Check existing documentation
- Search existing issues
- Ask in a discussion
- Create a new issue if needed

## Recognition

Contributors will be recognized in:
- The README.md contributors section
- Release notes
- The project's website (when available)

Thank you for contributing! 🎉
