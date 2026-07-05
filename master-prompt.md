# HRShakti — Master Development Prompt

> **Purpose**: This is the single master prompt that contains everything a capable LLM needs to build the HRShakti platform from scratch. Feed this + all referenced documents into a 200K+ token context window LLM.
> **Target LLM**: Its You Babyyy!
> **Version**: 1.0 | Date: 2026-07-05

---

## INSTRUCTIONS TO THE LLM

You are a world-class full-stack software engineer. Your task is to build **HRShakti** — a next-generation HR professional community platform — from scratch, following the specifications in this prompt and the referenced documents.

**Critical Rules**:
1. Read ALL referenced documents completely before writing any code. Every detail matters.
2. Follow the tech stack exactly: Next.js 14+ (App Router), NestJS, TypeScript, Tailwind CSS 4, shadcn/ui, PostgreSQL, Redis, Elasticsearch, S3.
3. Use the monorepo structure defined in the Technical Architecture document.
4. Use Prisma as the ORM (not TypeORM). Generate the Prisma schema from the Database Schema document.
5. Every entity, every column, every relationship, every index described in the Database Schema MUST be implemented.
6. Every API endpoint described in the API Contracts MUST be implemented with proper guards, DTOs, and validation.
7. Implement modules in this order: Auth → Users → Profiles → Network → Communities → Discussions → Q&A → Blogs → Knowledge Hub → Events → Learning → AI → Search → Notifications → Messaging → Mentorship → Reviews → Career → News → Reputation → Moderation → Analytics → Admin.
8. Write production-quality code: proper error handling, validation, logging, caching, and tests.
9. Follow all security requirements from the Auth/RBAC/Security document.
10. Use the UI/UX Blueprint for frontend component design.

---

## PROJECT OVERVIEW

**HRShakti** is the world's first unified HR professional ecosystem combining:

1. **Professional Networking** — Verified HR profiles, connections, follow model (LinkedIn-inspired but HR-only)
2. **Community & Discussions** — Reddit-quality discussions with verified professional credibility, multi-signal reactions, anonymous posting
3. **Knowledge & Content** — HBR-quality blogs, case studies, and a permanent knowledge base with editorial review
4. **Learning & Growth** — Courses, certifications, mentorship, career pathing, automated recertification credit tracking
5. **AI-Powered Tools** — AI assistant for 15 HR-specific capabilities using RAG pipeline

**Key Differentiators**:
- **Dual Identity**: Verified professional profile + anonymous posting mode (with credential badge still visible)
- **Recertification Credit Engine**: Every activity auto-earns SHRM/HRCI credits — strongest retention hook in HR tech
- **Quality-First Algorithm**: Credential-weighted multi-signal reactions, not simple upvotes
- **HR Tool Vendor Directory**: "Glassdoor for HR Tech" — reviews of ATS, HRIS, payroll platforms
- **Verified Salary Benchmarking**: Properly verified (not crowdsourced garbage)
- **Knowledge Promotion Pipeline**: Community discussions → review → permanent knowledge base
- **Employer Reviews from HR Perspective**: Not employee reviews — reviews of what it's like to work in HR at companies

---

## REFERENCED DOCUMENTS

You MUST read and follow these documents (provided alongside this prompt):

| # | Document | What It Contains |
|---|---|---|
| 1 | `01-research-competitive-analysis.md` | Competitive research on SHRM, LinkedIn, Reddit, Glassdoor, HBR, HR.com, Udemy, StackOverflow, Discord. What to copy, what to avoid, what's missing. Feature gap analysis. |
| 2 | `02-product-specification.md` | Complete product spec with 23 modules, role definitions, permission matrices, feature details, non-functional requirements, guiding principles. |
| 3 | `03-technical-architecture.md` | System architecture, monorepo structure, frontend/backend patterns, auth flow, real-time architecture, search, AI integration, caching, queues, infrastructure, monitoring. |
| 4 | `04-database-schema.md` | ~65 tables across 20 domains. Every table, column, type, constraint, index, and relationship. |
| 5 | `05-api-contracts.md` | Every REST endpoint for all 23 modules. Request/response formats, query parameters, auth requirements. |
| 6 | `06-ui-ux-blueprint.md` | Design system (colors, typography, spacing), layout architecture, 12+ page specifications with ASCII wireframes, component specs, responsive breakpoints. |
| 7 | `07-auth-rbac-security.md` | Complete auth flows (email, OAuth, JWT), RBAC guards, anonymous identity system, security hardening (CORS, CSP, rate limiting, input validation, PII detection), audit logging, GDPR compliance. |
| 8 | `08-ai-messaging-modules.md` | AI assistant: 15 capabilities with system prompts, RAG configuration, streaming, safety guardrails. Messaging: WebSocket events, real-time presence, cursor-based pagination. |

---

## TECH STACK (CONFIRMED)

### Frontend
- **Next.js 14+** with App Router (NOT Pages Router)
- **React 18+** with Server Components
- **TypeScript** (strict mode)
- **Tailwind CSS 4** for styling
- **shadcn/ui** for component library
- **Zustand** for client-side state
- **TanStack Query (React Query)** for server state
- **React Hook Form + Zod** for forms
- **Socket.IO Client** for WebSocket

### Backend
- **NestJS** (modular monolith)
- **Prisma ORM** with PostgreSQL
- **Passport.js** for OAuth strategies
- **class-validator + class-transformer** for DTOs
- **BullMQ** (Redis-backed) for job queues
- **Socket.IO** for WebSocket
- **@nestjs/elasticsearch** for search
- **@nestjs/jwt** for JWT
- **Argon2** for password hashing

### Database & Infrastructure
- **PostgreSQL 16+** with pgcrypto extension + LTREE extension
- **Redis 7+** (cache, sessions, rate limiting, queues)
- **Elasticsearch 8+** or OpenSearch
- **Amazon S3** or Cloudflare R2 (object storage)
- **Docker** + **Kubernetes** + **NGINX**

### Monorepo Tooling
- **Turborepo** for monorepo management
- **pnpm** for package management

---

## DATABASE DESIGN PRINCIPLES

1. **UUIDs** as primary keys (gen_random_uuid())
2. **created_at + updated_at** on every table
3. **Soft deletes**: `deleted_at` timestamp (NULLABLE), never hard-delete user content
4. **JSONB** for flexible fields (tags, preferences, settings) — use GIN indexes
5. **Denormalized counts** for performance (comment_count, helpful_count, member_count, etc.) — updated via database triggers or application logic
6. **LTREE extension** for nested comments (materialized path pattern)
7. **Partitioning** for high-volume tables: notifications, reactions, audit_logs, messages (partition by month on created_at)
8. **Encrypted columns** for sensitive data (anonymous author IDs, salary company names)
9. **Polymorphic relationships** via target_type + target_id pattern (content_reactions, content_bookmarks, content_reports)

---

## AUTHENTICATION RULES

1. **JWT Access Token**: 15 minutes, RS256 signed, payload: { sub, email, role, trustLevel, iat, exp, iss, aud }
2. **JWT Refresh Token**: 7 days, httpOnly + Secure + SameSite=Strict cookie, rotation on every refresh
3. **Password Hashing**: Argon2id (memory: 65536, iterations: 3, parallelism: 4)
4. **OAuth Providers**: Google, LinkedIn, Microsoft — map to unified user account via email
5. **Email Verification**: Required before profile creation
6. **Session Tracking**: Store sessions in database with device info, IP, last active
7. **Account Lockout**: 5 failed login attempts → 15 minute cooldown

---

## RBAC RULES

5 roles: super_admin, admin, moderator, member, guest
- Super Admin: 1-3 accounts, unrestricted access, cannot be suspended by anyone except another Super Admin
- Admin: Manages day-to-day operations, cannot modify Super Admin or platform config
- Moderator: Community moderation only, no platform settings/analytics
- Member: Create and manage own content only, full community participation
- Guest: Read-only public content

Implement guards: JwtAuthGuard → RolesGuard → PermissionGuard → ResourceOwnerGuard

---

## FRONTEND ARCHITECTURE RULES

1. **App Router**: All routes under `app/(auth)/`, `app/(main)/`, `app/(admin)/`
2. **Server Components by default**: Only add `"use client"` when needed (interactivity, hooks, state)
3. **Data Fetching**: Server Components call backend API directly (no TanStack Query needed). Client components use TanStack Query for mutations and real-time data.
4. **Component Pattern**: List/Card/Detail/Form/Empty/Skeleton/Error per feature
5. **API Client**: Axios instance with JWT interceptor + refresh token flow
6. **Error Handling**: Global error boundary + per-component error states
7. **Loading States**: Skeleton components for every data-dependent view
8. **Empty States**: Illustrated empty states with CTAs for every list view
9. **Mobile-First**: Bottom navigation on mobile, responsive breakpoints at 768px and 1024px

---

## BACKEND ARCHITECTURE RULES

1. **Module Pattern**: Each module has: .module.ts, .controller.ts, .service.ts, .spec.ts, dto/, entities/
2. **Controller**: Only handles HTTP concerns (routing, validation, response format)
3. **Service**: All business logic lives here
4. **Repository**: Prisma service for database access
5. **Guards**: Applied via decorators on controller methods
6. **Interceptors**: Global logging, response transformation, caching
7. **Pipes**: Global ValidationPipe with whitelist + transform
8. **Filters**: Global AllExceptionsFilter for consistent error responses
9. **Async Operations**: All non-critical operations (notifications, emails, search indexing, analytics, AI) go through BullMQ queues
10. **Caching**: Redis cache-aside for hot data. Cache keys follow: `{entity}:{id}` pattern with appropriate TTLs.

---

## REAL-TIME RULES

1. **Socket.IO** for all real-time features (not raw WebSocket)
2. **Redis Adapter** for multi-instance Socket.IO
3. **Rooms**: Join rooms for notifications, conversations, discussions
4. **Auth**: Authenticate WebSocket connection via JWT on connect
5. **Message delivery**: REST API for reliable persistence + WebSocket for real-time delivery
6. **Presence**: Redis key `user:online:{userId}` with 5-minute TTL, refreshed on heartbeat
7. **Typing indicator**: Debounced (300ms), auto-expire after 5 seconds

---

## AI ASSISTANT RULES

1. **RAG Pipeline**: Query → Elasticsearch retrieval → re-rank → context assembly → LLM call → stream response
2. **Streaming**: Server-Sent Events (SSE) for response delivery
3. **15 Capabilities**: Each has a dedicated system prompt template
4. **AI Content Label**: Every AI response marked "Generated by HRShakti AI — Review and verify before use"
5. **Legal Disclaimer**: Auto-injected for compliance/legal/termination queries
6. **Rate Limiting**: 5/day (unverified), unlimited (member), 30/hour, 200/day
7. **PII Detection**: Scan queries before processing
8. **No AI Spam**: AI cannot generate community posts, blog articles, or Q&A answers
9. **Conversation History**: Save all conversations for context and analytics

---

## SEARCH RULES

1. **Elasticsearch** for all searchable content (discussions, questions, answers, blogs, knowledge, members, organizations, communities)
2. **Indexing Pipeline**: Database CDC (LISTEN/NOTIFY) → transform → index in Elasticsearch via queue
3. **Search API**: POST /api/v1/search with types, filters, sorting, pagination
4. **Semantic Search (v2)**: Embeddings + cosine similarity
5. **Auto-suggestions**: As-you-type completion suggestions
6. **People Also Asked**: Related search queries

---

## QUALITY ALGORITHM RULES

Multi-signal content ranking (replacing simple upvotes):

**Reaction Types & Weights**:
- `helpful`: +1 quality point
- `insightful`: +2 quality points
- `from_experience`: +3 quality points (verified professionals only)
- `inaccurate`: -5 quality points + flag for review

**Feed Sorting**:
- **Trending**: time_decay * (helpful*1 + insightful*2 + from_experience*3) * credential_weight
- **Best**: Wilson score confidence interval + credential weighting
- **Latest**: Chronological
- **Most Discussed**: Comment count
- **Controversial**: High disagreement ratio

**Credential Weighting**: Verified professionals' reactions count more:
- Trust Level 1: 0.5x weight
- Trust Level 2-3: 1.0x weight
- Trust Level 4-5: 1.5x weight
- Trust Level 6-7: 2.0x weight

---

## IMPLEMENTATION ORDER

Build modules in this exact order. Each module depends on the previous:

### Phase 1: Foundation (Week 1-2)
1. **Project Setup**: Monorepo, Docker Compose (PostgreSQL, Redis, Elasticsearch, MinIO), Turborepo config
2. **Prisma Schema**: Generate from Database Schema document (all 65+ tables)
3. **Auth Module**: Registration, login, OAuth, JWT, email verification, password reset
4. **User Module**: Profile CRUD, experiences, education, certifications, skills, preferences
5. **Common**: Guards, interceptors, pipes, filters, error handling, API response format

### Phase 2: Core Social (Week 3-4)
6. **Network Module**: Follow, connect, block, suggestions
7. **Organization Module**: CRUD, claim, verify, members
8. **Community Module**: CRUD, join/leave, moderators, announcements, stats
9. **Discussion Module**: CRUD, nested comments (LTREE), multi-signal reactions, bookmarks, polls, anonymous mode, sorting algorithms
10. **Content Reactions**: Polymorphic reaction system (shared across discussions, comments, blogs, answers)

### Phase 3: Knowledge & Content (Week 5-6)
11. **Q&A Module**: Questions, answers, accept answer, bounty, tags, review queues, similar questions
12. **Blog Module**: CRUD, workflow states, rich text editor, peer review, comments, series
13. **Knowledge Hub Module**: CRUD (admin), search, download, versioning, promote from discussions
14. **Notification Module**: Triggers, in-app, email (transactional + digest), preferences, unread count, real-time via WebSocket

### Phase 4: Engagement & Growth (Week 7-8)
15. **Event Module**: CRUD, registration, attendance, certificates, speakers, series
16. **Learning Module**: Courses, modules, assessments, enrollments, progress, learning paths, study groups
17. **Recertification Credits**: Auto-tracking, manual submission, export, dashboard
18. **Messaging Module**: Conversations, real-time messages, read receipts, typing indicator, search
19. **Mentorship Module**: Profiles, requests, goals, sessions, matching, feedback
20. **AI Assistant Module**: 15 capabilities, RAG pipeline, streaming, safety guardrails

### Phase 5: Differentiation & Monetization (Week 9-10)
21. **Reviews & Benchmarking Module**: Employer reviews, HR vendor directory, salary benchmarking
22. **Career Pathing Module**: Career paths, self-assessment, skill gap analysis
23. **News & Compliance Module**: HR news feed, compliance alerts (location-aware)
24. **Reputation & Gamification Module**: Trust levels, badges, leaderboards, reputation events

### Phase 6: Platform Operations (Week 11-12)
25. **Search Module**: Elasticsearch indexing pipeline, global search, suggestions, semantic search (v2)
26. **Moderation Module**: Reports, AI-assisted moderation, actions, content queue
27. **Analytics Module**: Platform stats, admin dashboards, exportable reports
28. **Admin Panel**: Full admin UI for all management operations
29. **Monitoring & Observability**: Prometheus metrics, Grafana dashboards, structured logging, Sentry, alerting

---

## NON-FUNCTIONAL REQUIREMENTS

- Page load: < 2 seconds (P95)
- API response: < 300ms average, < 1s (P99)
- Search: < 500ms
- Concurrent users: 100,000+
- Uptime: 99.9%
- WCAG 2.1 AA accessibility
- Responsive: Desktop (1280+), Tablet (768-1279), Mobile (<768)

---

## CRITICAL REMINDERS

1. **NEVER hard-delete user content** — always soft delete (deleted_at timestamp)
2. **ALWAYS check resource ownership** before allowing edits/deletes (member can only modify own content)
3. **ALWAYS validate input server-side** — never trust client-side validation alone
4. **ALWAYS use parameterized queries** — Prisma handles this, but be careful with raw SQL
5. **ALWAYS log admin/moderation actions** to audit_logs (append-only, immutable)
6. **NEVER store access tokens in localStorage** — keep in memory only
7. **NEVER expose the real author of anonymous posts** — even in API responses
8. **ALWAYS inject AI disclaimer** on AI-generated content
9. **ALWAYS use SSL/TLS** — HTTPS only, no exceptions
10. **ALWAYS rate limit** authentication endpoints aggressively

---

## WHAT TO BUILD FIRST (MVP Scope)

If building an MVP, implement these modules first (in order):

1. Auth (email + Google OAuth)
2. User Profiles (basic: name, headline, about, location, certifications)
3. Professional Network (follow + connect)
4. Communities (5 pre-seeded communities)
5. Discussions (text posts, nested comments, multi-signal reactions, anonymous mode)
6. Q&A (questions, answers, accept answer, tags)
7. Notifications (in-app + email)
8. Search (Elasticsearch basic keyword search)
9. Admin Panel (basic user + content management)
10. AI Assistant (3 capabilities: policy explanation, terminology, JD drafting)

Then iterate: Blogs → Knowledge Hub → Events → Learning → Messaging → Mentorship → Reviews → Career → News → Compliance → full Reputation → full Analytics.

---

## FINAL NOTE

This platform has the potential to be the category-defining product for HR professionals globally. The competitive research shows that NO existing platform serves HR professionals as professionals — they're all either too generic (LinkedIn), too outdated (SHRM), too unverified (Reddit), or too limited (HR.com, Glassdoor, HBR).

Build it with the quality and care that HR professionals deserve. Every feature should feel professional, fast, and trustworthy. The platform should be a place where an HR professional feels proud to be a member.

Now, read all 8 referenced documents completely, then start building.

---

*End of Master Prompt. Total: ~180K tokens with all referenced documents included.*
