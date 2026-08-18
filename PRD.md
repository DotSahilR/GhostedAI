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

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Email/password login
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/google` - Google OAuth login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Clear session

### Gmail
- `GET /api/v1/gmail/auth-url` - Generate OAuth URL
- `GET /api/v1/gmail/callback` - OAuth callback
- `POST /api/v1/gmail/sync` - Sync conversations
- `POST /api/v1/gmail/disconnect` - Disconnect account

### Conversations
- `GET /api/v1/conversations` - List conversations
- `GET /api/v1/conversations/:id` - Get conversation details
- `GET /api/v1/conversations/:id/messages` - Get messages
- `PATCH /api/v1/conversations/:id` - Update conversation

### Follow-ups
- `POST /api/v1/conversations/:id/drafts/generate` - Generate draft
- `PATCH /api/v1/drafts/:id` - Update draft (edit/approve)
- `POST /api/v1/automation/run` - Trigger automation

### Caspian
- `POST /api/v1/caspian/connect` - Connect Caspian account
- `POST /api/v1/caspian/webhook` - Receive replies
- `POST /api/v1/caspian/send` - Send via Caspian

---

## Database Schema

### Users
- id (uuid)
- email (text, unique)
- name (text)
- password_hash (text)
- created_at, updated_at

### Connected Accounts
- id (uuid)
- user_id (uuid, FK)
- provider (enum: gmail, caspian)
- account_name (text)
- access_token (text)
- refresh_token (text)
- token_expires_at (timestamp)
- status (enum: connected, disconnected, error)

### Conversations
- id (uuid)
- user_id (uuid, FK)
- account_id (uuid, FK)
- external_thread_id (text)
- name (text) - contact name
- handle (text) - email address
- company (text)
- subject (text)
- platform (enum: gmail, caspian)
- status (enum: waiting, needs_followup, completed, paused, archived)
- priority (enum: high, medium, low)
- days_waiting (integer)
- last_message (text)
- last_message_at (timestamp)
- next_follow_up_at (timestamp)
- follow_ups_sent (integer)

### Messages
- id (uuid)
- conversation_id (uuid, FK)
- account_id (uuid, FK)
- direction (enum: inbound, outbound)
- body (text)
- external_message_id (text)
- sent_at (timestamp)

### Follow-up Drafts
- id (uuid)
- conversation_id (uuid, FK)
- user_id (uuid, FK)
- tone (text)
- subject (text)
- body (text)
- variant (integer)
- status (enum: draft, approved, scheduled, sent, failed, discarded)
- scheduled_at (timestamp)
- sent_at (timestamp)

---

## Security

- JWT tokens stored in HTTP-only cookies
- Refresh token rotation on every use
- OAuth tokens encrypted at rest (planned)
- CORS restricted to allowed origins
- Rate limiting on auth endpoints
- Webhook signature verification (Caspian)

---

## Deployment

### Development
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Database: Neon PostgreSQL (cloud)

### Production
- Frontend: Vercel
- Backend: Railway/Render
- Database: Neon PostgreSQL
- Domain: Custom

---

## Success Metrics

1. **User can connect Gmail** - OAuth flow completes successfully
2. **Conversations appear** - Real emails sync and display
3. **AI generates drafts** - Follow-ups are contextual and useful
4. **Drafts can be edited** - Users can modify before sending
5. **Sending works** - Follow-ups are delivered via Caspian
6. **Replies are detected** - Conversation status updates correctly
7. **No duplicate sends** - System prevents sending multiple follow-ups
8. **Dashboard is accurate** - Stats reflect real conversation state

---

## Future Enhancements

1. **Multi-channel support** - Telegram, Slack, Discord integration
2. **Team collaboration** - Shared inboxes and assignments
3. **Analytics dashboard** - Response rates, best send times
4. **Custom rules** - User-defined follow-up logic
5. **Mobile app** - iOS/Android companion
6. **Browser extension** - Follow-up reminders in Gmail
7. **CRM integration** - Salesforce, HubSpot sync
8. **AI learning** - Improve drafts based on reply patterns

---

## Hackathon Submission

**Team:** Ghosted AI
**Category:** AI Agent / Automation
**Demo:** Live working application with real Gmail integration
**Repository:** [GitHub link]
**Video:** [Demo video link]

### What We Built
- Full-stack application with Next.js + Express
- Gmail OAuth integration for reading emails
- AI-powered conversation analysis and draft generation
- Caspian integration for sending follow-ups
- Real-time dashboard with conversation tracking
- Automation engine with smart scheduling

### How It Works
1. User signs in with Google
2. Connects Gmail account
3. System syncs recent conversations
4. AI analyzes each conversation
5. Generates personalized follow-up drafts
6. User reviews, edits, and approves
7. System sends via Caspian
8. Tracks replies and updates status

### Tech Stack
- Next.js 15, React, TypeScript, Tailwind CSS
- Express 5, PostgreSQL, Drizzle ORM
- Google OAuth 2.0, Gmail API
- Caspian AI SDK
- TanStack Query
