# HRShakti — AI Assistant & Real-Time Messaging Specification

> **Document Type**: Module Deep-Dive Specification  
> **Version**: 1.0  
> **Date**: 2026-07-05  

---

## Part A: AI Assistant Module

### A.1 Architecture Overview

The AI Assistant uses a **Retrieval-Augmented Generation (RAG)** pipeline to provide HR-specific responses grounded in the platform's knowledge base.

```
User Query
    → Intent Classification (NestJS)
        → Query Expansion
            → Elasticsearch Retrieval (Knowledge Hub + Discussions + Blogs)
                → Re-rank (by quality_score, recency, credential weight)
                    → Context Window Builder (top 5-10 passages)
                        → System Prompt Template + Context + User Query
                            → LLM API (GPT-4o or equivalent)
                                → Response Stream (SSE)
                                    → Citation Injection
                                        → Save to ai_conversations + ai_messages
```

### A.2 Capabilities & System Prompts

Each capability has a dedicated system prompt template stored in the database (editable by Super Admin without code deployment).

#### Capability 1: Policy Explanation
**Trigger**: User asks about HR policies, regulations, employment law.
**RAG Sources**: Knowledge Hub (policies, compliance), Discussions (compliance-tagged), Compliance Alerts.
**System Prompt**: "You are an HR policy expert assistant. Explain HR policies and regulations clearly and accurately. Always cite your sources. Include jurisdiction-specific information when relevant. Add a disclaimer that this is not legal advice."
**Output Format**: Explanation with sections, jurisdiction notes, source citations.

#### Capability 2: HR Terminology
**Trigger**: User asks "What is [term]?"
**RAG Sources**: Knowledge Hub (glossaries, frameworks), Blogs.
**System Prompt**: "Define HR terms with: 1) Simple definition, 2) Context of when it's used, 3) Related terms, 4) Practical example."
**Output Format**: Definition card with related terms.

#### Capability 3: Interview Question Generation
**Trigger**: User asks to generate interview questions for a role.
**RAG Sources**: Knowledge Hub (templates, best practices), Discussions (TA-tagged).
**System Prompt**: "Generate structured interview questions for the given role. Include: 1) Behavioral questions (STAR method), 2) Situational questions, 3) Technical/role-specific questions, 4) Culture-fit questions. For each question, explain what it assesses and what a good answer looks like."
**Input**: Job title, level, key responsibilities, industry.
**Output Format**: Categorized question list with assessment criteria.

#### Capability 4: Job Description Drafting
**Trigger**: User asks to draft a job description.
**RAG Sources**: Knowledge Hub (JD templates, best practices), Salary Benchmarking data.
**System Prompt**: "Draft a comprehensive, inclusive job description. Include: Job title, Company overview placeholder, Role summary, Key responsibilities (8-12 bullet points), Requirements (must-have vs nice-to-have), Benefits placeholder, EEO statement. Use inclusive language. Avoid gender-coded words."
**Input**: Title, level, department, key responsibilities, requirements, location, company type.
**Output Format**: Complete JD text with placeholders.

#### Capability 5: Performance Review Suggestions
**Trigger**: User asks for performance review feedback phrasing.
**RAG Sources**: Knowledge Hub (performance management resources), Discussions.
**System Prompt**: "Generate constructive performance review feedback. Categories: 1) Exceeds expectations, 2) Meets expectations, 3) Needs improvement. For 'needs improvement', use the SBI model (Situation-Behavior-Impact). Be specific, actionable, and developmental."
**Input**: Employee role, performance area, rating level, specific situations.
**Output Format**: Categorized feedback suggestions.

#### Capability 6: HR Email Drafting
**Trigger**: User asks to draft an HR email.
**RAG Sources**: Knowledge Hub (email templates), Discussions.
**System Prompt**: "Draft professional HR emails. Tone: professional, empathetic, clear. Include subject line. Keep concise. For sensitive topics (termination, investigation), include legal review reminder."
**Input**: Email type (offer, rejection, policy update, investigation, etc.), context, key points.
**Output Format**: Subject line + email body.

#### Capability 7: Document Summarization
**Trigger**: User provides a long HR document for summarization.
**RAG Sources**: Direct user input (not RAG).
**System Prompt**: "Summarize the provided HR document. Include: 1) Key points (3-5), 2) Action items, 3) Important dates/deadlines, 4) Relevant jurisdictions, 5) Recommendations. Preserve critical details and numbers."
**Input**: Document text (pasted or uploaded).
**Output Format**: Structured summary with sections.

#### Capability 8: Resume Feedback
**Trigger**: User asks for resume feedback for an HR role.
**RAG Sources**: Knowledge Hub (career resources, resume best practices).
**System Prompt**: "Analyze this resume for HR roles. Evaluate: 1) Clarity and structure, 2) Action verbs and impact metrics, 3) HR-specific keywords, 4) ATS compatibility, 5) Areas for improvement. Rate overall effectiveness (1-10)."
**Input**: Resume text.
**Output Format**: Structured feedback with scores and specific suggestions.

#### Capability 9: HR Research Assistance
**Trigger**: User asks a research question about HR trends, data, or best practices.
**RAG Sources**: All sources (Knowledge Hub, Discussions, Blogs, News).
**System Prompt**: "Research the given HR topic. Provide: 1) Current state/definition, 2) Key statistics/data points, 3) Industry trends, 4) Expert opinions (cited), 5) Practical recommendations. Distinguish between established facts and emerging trends."
**Output Format**: Research summary with citations.

#### Capability 10: Compliance Explanation
**Trigger**: User asks about labor law, compliance requirements.
**RAG Sources**: Compliance Alerts, Knowledge Hub (policies, legal), Discussions (compliance-tagged).
**System Prompt**: "Explain HR compliance requirements for the given jurisdiction and topic. IMPORTANT: Always include the disclaimer 'This is not legal advice. Consult with an employment attorney for specific legal guidance.' Include: applicable laws, requirements, deadlines, penalties for non-compliance, and practical steps for compliance."
**Output Format**: Compliance guide with legal disclaimer, law references, action steps.

#### Capability 11: Meeting Agenda Generation
**Trigger**: User asks to create a meeting agenda.
**System Prompt**: "Generate a structured meeting agenda. Include: meeting purpose, duration, attendees, agenda items with time allocations, discussion prompts for each item, and action items template."
**Input**: Meeting type (1:1, investigation, policy review, team meeting), topic, duration, attendees.

#### Capability 12: Onboarding Checklist
**Trigger**: User asks for onboarding checklist.
**System Prompt**: "Generate a comprehensive onboarding checklist for the given role. Organize by: Pre-start (1 week before), Day 1, Week 1, Month 1, Month 3. Include: paperwork, IT setup, introductions, training, check-ins."

#### Capability 13: Exit Interview Analysis
**Trigger**: User provides exit interview responses.
**System Prompt**: "Analyze exit interview responses for patterns and themes. Identify: 1) Primary reasons for leaving, 2) Department/team-specific issues, 3) Systemic vs individual concerns, 4) Actionable recommendations for retention."

#### Capability 14: Employee Survey Design
**Trigger**: User asks to design an employee survey.
**System Prompt**: "Design an effective employee survey. Include: 5-point Likert scale questions, open-ended questions, demographic questions (optional), and survey best practices (anonymity assurance, estimated completion time)."

#### Capability 15: Policy Comparison
**Trigger**: User asks to compare HR policies across jurisdictions.
**RAG Sources**: Compliance Alerts, Knowledge Hub.
**System Prompt**: "Compare the given HR policy across the specified jurisdictions. Use a structured comparison table format. Highlight key differences, minimum requirements, and best practices beyond minimums."

### A.3 RAG Configuration

**Elasticsearch Queries per Capability**:

| Capability | Indices | Boost Fields |
|---|---|---|
| Policy Explanation | knowledge, discussions, compliance_alerts | knowledge.body^3, knowledge.tags^2 |
| Terminology | knowledge, blogs | knowledge.title^3, knowledge.body^2 |
| Interview Gen | knowledge, discussions | discussions.body^2 (TA-tagged) |
| JD Draft | knowledge, salary_submissions | knowledge.body^2 (template type) |
| Performance Review | knowledge, discussions | knowledge.body^2 (performance category) |
| Email Draft | knowledge (templates) | knowledge.body^3 |
| Resume Feedback | knowledge | knowledge.body^2 (career category) |
| Research | ALL indices | Quality score weighted |
| Compliance | compliance_alerts, knowledge | compliance_alerts^3, knowledge^2 |

**Context Window Assembly**:
- System prompt: ~500 tokens
- Retrieved context: ~3000-5000 tokens (top 5-10 passages)
- User query: ~100-500 tokens
- Max response: ~2000 tokens
- Total: ~6000-8000 tokens (well within GPT-4o's 128K context)

### A.4 Response Streaming

```typescript
// Server-side: NestJS controller
@Post('conversations/:id/messages')
@Sse() // Server-Sent Events
async sendMessage(
  @Param('id') conversationId: string,
  @Body() dto: AiMessageDto,
  @Req() req: Request,
): Promise<Observable<MessageEvent>> {
  return this.aiService.streamResponse(conversationId, dto.content, req.user);
}

// Service: Stream from LLM
async streamResponse(conversationId: string, query: string, user: User) {
  // 1. Rate limit check
  // 2. PII detection
  // 3. RAG retrieval
  // 4. Build prompt
  // 5. Stream from LLM
  const stream = await this.openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'system', content: systemPrompt + context }, { role: 'user', content: query }],
    stream: true,
    temperature: 0.7,
    max_tokens: 2000,
  });

  // 6. Stream chunks via SSE
  return new Observable((subscriber) => {
    (async () => {
      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        subscriber.next({ data: JSON.stringify({ chunk, done: false }) });
      }
      // 7. Save to database
      await this.saveMessages(conversationId, query, fullResponse, sources);
      subscriber.next({ data: JSON.stringify({ chunk: '', done: true, sources }) });
      subscriber.complete();
    })();
  });
}
```

### A.5 AI Safety Guardrails

1. **PII Detection**: Before RAG retrieval, scan user query for PII. If detected in anonymous-adjacent context, warn user.
2. **Content Filter**: LLM response checked against content policy (no hate speech, no discrimination, no illegal advice).
3. **Legal Disclaimer**: Automatically injected for compliance, legal, and termination-related queries.
4. **Source Citation**: Every factual claim must link to a platform source. If no source found, mark as "AI-generated, verify independently."
5. **Hallucination Detection**: Compare LLM response against retrieved context. Flag claims not supported by sources.
6. **Usage Limiting**: 5/day (guest/unverified), unlimited (member), 30/hour, 200/day hard cap.

---

## Part B: Real-Time Messaging Module

### B.1 Architecture

```
Client A (Browser)
    → WebSocket (Socket.IO)
        → NestJS WebSocket Gateway
            → Redis Pub/Sub (for multi-instance)
                → Client B (Browser)
                    → WebSocket
```

**Socket.IO** chosen over raw WebSocket because:
- Built-in rooms and namespaces
- Automatic reconnection with exponential backoff
- Fallback to long-polling
- Simpler API for room-based messaging

### B.2 WebSocket Events Specification

#### Client → Server

| Event | Payload | Description |
|---|---|---|
| `auth` | `{ token: "jwt" }` | Authenticate WebSocket connection |
| `join:conversation` | `{ conversationId: "uuid" }` | Join a conversation room |
| `leave:conversation` | `{ conversationId: "uuid" }` | Leave a conversation room |
| `message:send` | `{ conversationId, body, messageType }` | Send a message (also saved via REST) |
| `message:typing` | `{ conversationId, isTyping }` | Typing indicator |
| `message:read` | `{ conversationId, messageId }` | Mark message as read |

#### Server → Client

| Event | Payload | Description |
|---|---|---|
| `message:new` | Full message object | New message in a joined conversation |
| `message:typing` | `{ conversationId, userId, isTyping }` | Typing indicator |
| `notification:new` | Full notification object | New notification |
| `user:online` | `{ userId }` | User came online |
| `user:offline` | `{ userId }` | User went offline |
| `conversation:created` | Conversation object | New conversation created |
| `error` | `{ message, code }` | Error occurred |

### B.3 Message Flow

**Sending a Message**:
```
1. Client A types in chat UI
2. Client A emits 'message:typing' → Server → Client B (typing indicator shown)
3. Client A clicks Send
4. Client A: POST /messages/conversations/:id/messages { body, messageType }
   → Server validates, saves to messages table, gets message object with id
   → Server emits 'message:new' via WebSocket to conversation room (Client B receives)
   → Server queues notification (if recipient is offline: in-app + email)
5. Client B receives 'message:new' → appends to chat UI (optimistic, confirmed by REST response)
```

**Why both REST + WebSocket for messages?**
- REST ensures reliable delivery (database write, retry on failure)
- WebSocket provides real-time delivery to the recipient
- REST response confirms the message was saved (includes server-generated id, timestamp)
- If WebSocket fails, the recipient sees the message on next page load (polling fallback)

### B.4 Conversation List Real-Time Updates

When a new message arrives, the conversation should float to the top of the list:
```
Server emits 'message:new' → Client updates conversation list:
  1. Move conversation to top of list
  2. Update last message preview
  3. Increment unread count (if not the active conversation)
  4. Play notification sound (if settings enabled)
```

### B.5 Online/Offline Presence

```
On WebSocket connect:
  → Join personal room: socket.join(`user:${userId}`)
  → Set user online status in Redis: SET user:online:{userId} 1 EX 300
  → Broadcast to followers: emit('user:online', { userId })

On WebSocket disconnect:
  → Check if user has other active connections (multi-device)
  → If no other connections: DEL user:online:{userId}
  → Broadcast: emit('user:offline', { userId })

On 'message:typing':
  → Emit to conversation room (excluding sender)
  → Auto-stop after 5 seconds of no typing events
```

### B.6 Message Pagination

**Cursor-based pagination** (not offset-based, for performance at scale):
```
GET /messages/conversations/:id/messages?before=msg_uuid&limit=50

Response: {
  data: [messages in reverse chronological order],
  meta: {
    nextCursor: "older-message-uuid",  // null if no more
    hasMore: true
  }
}
```

Initial load: `GET /messages/conversations/:id/messages?limit=50` (most recent 50).
Scroll up: `?before=oldest-loaded-message-uuid`.

### B.7 Message Search

```
GET /messages/conversations/:id/search?q=search+term

Response: {
  data: [
    { messageId, body, matchedText, createdAt }
  ]
}
```
Searches within a specific conversation. Uses PostgreSQL `tsvector` full-text search on the `body` column.

### B.8 Typing Indicator Rules

- Client emits `message:typing` on each keystroke (debounced: 300ms)
- Server broadcasts to conversation room (excluding sender)
- Auto-expire after 5 seconds of no typing events
- Only shown in the currently active conversation view
- "User is typing..." text, no per-character updates

---

*This document should be read alongside the Technical Architecture (03) and Database Schema (04) for complete implementation guidance.*