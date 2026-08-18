# Ghosted AI - Product Requirements Document

## Product Overview

**Ghosted AI** is an AI-powered conversation follow-up assistant that helps users avoid losing important email conversations. It connects to Gmail, syncs and analyzes real email conversations, detects when a response or follow-up is needed, and uses AI to generate personalized follow-up drafts that can be sent automatically.

**Tagline:** "Never lose a conversation because you forgot to follow up."

---

## Problem Statement

People send important emails to recruiters, clients, companies, customers, and teams. They often forget to follow up when they don't receive a response. This leads to:

- Lost job opportunities
- Missed business deals
- Stalled partnerships
- Forgotten conversations

Current solutions require manual tracking, spreadsheets, or generic email reminders that don't understand conversation context.

---

## Solution

Ghosted AI solves this by:

1. **Connecting to Gmail** - Reads your sent and received emails
2. **Understanding conversations** - AI analyzes email threads to understand context, intent, and urgency
3. **Detecting follow-up needs** - Identifies when you're waiting for a reply or when someone is waiting for your response
4. **Generating smart drafts** - Creates personalized follow-up messages based on conversation history
5. **Automating sends** - Optionally sends follow-ups at the right time according to your rules

---

## Target Users

- **Job seekers** following up on applications
- **Sales professionals** nurturing leads
- **Freelancers** checking in with clients
- **Business development** teams managing partnerships
- **Anyone** who wants to stay on top of important email conversations

---

## Core Features

### 1. Gmail Integration
- Connect Gmail account via OAuth 2.0
- Read sent and received emails
- Sync conversations automatically
- Track conversation state and direction (who sent last)

### 2. AI Conversation Analysis
- Understand email context and intent
- Determine conversation priority (high, medium, low)
- Detect if a follow-up is needed
- Recommend appropriate wait times
- Analyze tone and urgency

### 3. Smart Follow-up Generation
- Generate contextual follow-up drafts
- Match the tone of the original conversation
- Personalize based on conversation history
- Support multiple variants for A/B testing

### 4. Automation Engine
- Scheduled follow-up processing
- Configurable wait times
- Working hours respect
- Duplicate prevention
- Reply detection (stops if recipient replies)

### 5. Dashboard
- Overview of all tracked conversations
- Waiting vs. needs follow-up vs. completed
- Recent activity feed
- Quick actions (pause, archive, send)

### 6. Caspian Integration
- Send follow-ups via Caspian email infrastructure
- Receive replies via webhooks
- Separate sending from reading (Gmail reads, Caspian sends)

---

## Technical Architecture

### Frontend
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** TanStack Query (React Query)

### Backend
- **Runtime:** Node.js with Express 5
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon)
- **ORM:** Drizzle ORM
- **Authentication:** JWT with refresh token rotation

### AI
- **Provider:** Caspian AI SDK
- **Capabilities:** Conversation analysis, draft generation, tone matching

### Integrations
- **Google OAuth 2.0** - Gmail read/send/modify
- **Caspian API** - Email sending infrastructure
- **Webhooks** - Real-time reply detection

---

## Data Flow

```
User's Gmail → OAuth → Backend Sync → Database
                                           ↓
                                    AI Analysis
                                           ↓
                                    Draft Generation
                                           ↓
                                    User Review/Edit
                                           ↓
                                    Caspian Send
                                           ↓
                                    Reply Detection
                                           ↓
                                    Status Update
```

---

## Deployment

### Development
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Database: Neon PostgreSQL (cloud)
