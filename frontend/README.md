# Ghosted AI

Never lose a conversation because you forgot to follow up.

## Overview

Ghosted AI is an AI-powered conversation follow-up assistant. It connects to your Gmail, syncs and analyzes email conversations, detects when a response or follow-up is needed, and generates personalized follow-up drafts.

## Tech Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express 5, TypeScript, PostgreSQL, Drizzle ORM
- **AI:** OpenAI-compatible API
- **Integrations:** Google OAuth 2.0, Gmail API, Caspian SDK

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Google Cloud Console project with OAuth credentials
- Caspian API key (optional, for sending)

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your credentials
```

### Running

```bash
# Start backend (port 4000)
cd backend
npm run dev

# Start frontend (port 3000)
cd frontend
npm run dev
```

## Features

- Gmail integration for reading conversations
- AI-powered conversation analysis
- Smart follow-up draft generation
- Automated sending with scheduling
- Real-time reply detection
- Dashboard with conversation tracking

## License

MIT
