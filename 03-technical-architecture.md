# HRShakti — Technical Architecture

> **Document Type**: Technical Architecture Specification  
> **Version**: 1.0  
> **Date**: 2026-07-05  
> **Stack**: Next.js 14+ / NestJS / PostgreSQL / Redis / Elasticsearch / S3  

---

## 1. Architecture Overview

HRShakti follows a **monorepo architecture** with a clear separation between frontend (Next.js) and backend (NestJS) services. The system is designed as a **modular monolith** on the backend (single NestJS application with clear module boundaries) that can be decomposed into microservices in the future if needed.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CDN (CloudFront)                      │
│                   Static Assets, Images, Media               │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                     NGINX (Reverse Proxy)                     │
│              SSL Termination, Rate Limiting, Routing          │
└──────────┬──────────────────────────────────┬───────────────┘
           │                                  │
┌──────────┴──────────┐            ┌──────────┴──────────────┐
│   Next.js Frontend   │            │    NestJS Backend       │
│   (SSR + CSR)        │  REST/WS   │    (Modular Monolith)    │
│   Port 3000          │◄──────────►│    Port 4000             │
└──────────────────────┘            └──────────┬──────────────┘
                                                │
                    ┌───────────────────────────┼───────────────────┐
                    │           │               │                   │
              ┌─────┴─────┐ ┌──┴────┐  ┌───────┴────┐   ┌──────┴──────┐
              │ PostgreSQL │ │ Redis │  │Elasticsearch│   │ S3 / R2     │
              │ (Primary)  │ │       │  │            │   │ (Storage)   │
              │ + Replicas │ │Cache  │  │Search      │   │ Images,Docs │
              └────────────┘ │Session│  │Index       │   │ Videos,Certs│
                             └───────┘  └────────────┘   └─────────────┘
                                                │
                                         ┌──────┴──────┐
                                         │  RabbitMQ /  │
                                         │  BullMQ      │
                                         │  (Async)     │
                                         └─────────────┘
```

### Monorepo Directory Structure

```
hrshakti/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/                # App Router pages
│   │   │   ├── (auth)/         # Auth pages (login, register, etc.)
│   │   │   ├── (main)/         # Main app pages (feed, profile, etc.)
│   │   │   ├── (admin)/        # Admin panel pages
│   │   │   ├── api/            # Next.js API routes (if needed)
│   │   │   ├── layout.tsx      # Root layout
│   │   │   └── page.tsx        # Home/landing page
│   │   ├── components/         # React components
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   │   │   ├── profile/        # Profile-related components
│   │   │   ├── community/      # Community components
│   │   │   ├── discussion/     # Discussion/forum components
│   │   │   ├── qa/             # Q&A components
│   │   │   ├── blog/           # Blog components
│   │   │   ├── learning/       # Learning/course components
│   │   │   ├── messaging/      # Messaging components
│   │   │   ├── ai/             # AI assistant components
│   │   │   ├── events/         # Event components
│   │   │   └── shared/         # Shared/common components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Frontend utilities
│   │   │   ├── api.ts          # API client (Axios instance)
│   │   │   ├── auth.ts         # Auth utilities
│   │   │   ├── ws.ts           # WebSocket client
│   │   │   └── utils.ts        # General utilities
│   │   ├── stores/             # State management (Zustand)
│   │   ├── types/              # TypeScript type definitions
│   │   ├── styles/             # Global styles, Tailwind config
│   │   └── public/             # Static assets
│   │
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── main.ts         # Application bootstrap
│       │   ├── app.module.ts   # Root module
│       │   ├── common/         # Shared code
│       │   │   ├── decorators/ # Custom decorators
│       │   │   ├── dto/        # Shared DTOs
│       │   │   ├── filters/    # Exception filters
│       │   │   ├── guards/     # Auth, Role, Permission guards
│       │   │   ├── interceptors/ # Logging, Transform, Cache interceptors
│       │   │   ├── middleware/  # Rate limiting, request logging
│       │   │   ├── pipes/      # Validation pipes
│       │   │   └── utils/      # Shared utilities
│       │   ├── config/         # Configuration module
│       │   │   ├── database.config.ts
│       │   │   ├── redis.config.ts
│       │   │   ├── elasticsearch.config.ts
│       │   │   ├── jwt.config.ts
│       │   │   ├── s3.config.ts
│       │   │   └── ai.config.ts
│       │   ├── modules/        # Feature modules
│       │   │   ├── auth/       # Authentication & authorization
│       │   │   ├── users/      # User management & profiles
│       │   │   ├── network/    # Connections & following
│       │   │   ├── organizations/ # Organization profiles
│       │   │   ├── communities/ # Communities
│       │   │   ├── discussions/ # Discussion forum
│       │   │   ├── qa/         # Questions & Answers
│       │   │   ├── blogs/      # Blog/articles
│       │   │   ├── knowledge/  # Knowledge hub
│       │   │   ├── events/     # Events
│       │   │   ├── learning/   # Courses & certifications
│       │   │   ├── ai/         # AI assistant
│       │   │   ├── search/     # Global search
│       │   │   ├── notifications/ # Notifications
│       │   │   ├── messaging/  # Private messaging
│       │   │   ├── mentorship/ # Mentorship
│       │   │   ├── reviews/    # Employer reviews & salary
│       │   │   ├── career/     # Career pathing
│       │   │   ├── news/       # HR news & compliance
│       │   │   ├── reputation/ # Reputation & gamification
│       │   │   ├── analytics/  # Platform analytics
│       │   │   ├── moderation/ # Content moderation
│       │   │   └── admin/      # Admin panel API
│       │   ├── database/       # Database entities, migrations
│       │   │   ├── entities/   # TypeORM entities
│       │   │   ├── migrations/ # Migration files
│       │   │   └── seeds/      # Seed data
│       │   └── infrastructure/ # Infrastructure services
│       │       ├── elasticsearch/ # ES service
│       │       ├── redis/      # Redis service
│       │       ├── s3/         # S3 storage service
│       │       ├── queue/      # Message queue (BullMQ)
│       │       ├── ws/         # WebSocket gateway
│       │       └── ai/         # LLM integration service
│       ├── test/               # Backend tests
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                 # Shared between frontend and backend
│   │   ├── types/              # Shared TypeScript types
│   │   ├── constants/          # Shared constants
│   │   ├── validators/         # Shared validation schemas (Zod)
│   │   └── utils/              # Shared utilities
│   └── eslint-config/          # Shared ESLint configuration
│
├── docker/
│   ├── Dockerfile.web          # Next.js container
│   ├── Dockerfile.api          # NestJS container
│   └── docker-compose.yml      # Local development stack
│
├── k8s/                        # Kubernetes manifests
│   ├── base/                   # Base configurations
│   ├── overlays/               # Environment-specific overlays
│   └── helm/                   # Helm charts
│
├── scripts/                    # Build, deploy, utility scripts
├── .github/workflows/          # CI/CD pipelines
├── turbo.json                  # Turborepo configuration
├── package.json                # Root package.json
└── README.md
```

---

## 2. Frontend Architecture (Next.js 14+ App Router)

### Framework Choices
- **Next.js 14+** with App Router (not Pages Router)
- **React 18+** with Server Components (RSC) for data fetching
- **TypeScript** strict mode
- **Tailwind CSS 4** for styling
- **shadcn/ui** for component library (headless, copy-paste, fully customizable)
- **Zustand** for client-side state management (lightweight, no boilerplate)
- **TanStack Query (React Query)** for server state management, caching, and background refetching
- **React Hook Form + Zod** for form handling and validation

### Route Organization

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── verify-email/page.tsx
│   ├── oauth/callback/[provider]/page.tsx
│   └── layout.tsx              # Auth layout (centered card, no sidebar)
│
├── (main)/
│   ├── page.tsx                # Home feed (Trending discussions, news, recommendations)
│   ├── feed/page.tsx           # Personalized feed
│   ├── network/page.tsx        # Connections and suggestions
│   ├── messages/page.tsx       # Messaging inbox
│   ├── notifications/page.tsx  # Notifications center
│   ├── search/page.tsx         # Global search
│   │
│   ├── profile/[username]/page.tsx  # Public profile
│   ├── settings/page.tsx       # Account settings
│   ├── onboarding/page.tsx     # Progressive onboarding wizard
│   │
│   ├── communities/
│   │   ├── page.tsx            # Browse communities
│   │   ├── [slug]/page.tsx     # Community page
│   │   └── create/page.tsx     # Create community
│   │
│   ├── discussions/
│   │   ├── page.tsx            # All discussions (with filters)
│   │   ├── [id]/page.tsx       # Discussion detail with comments
│   │   └── create/page.tsx     # Create post
│   │
│   ├── questions/
│   │   ├── page.tsx            # All questions
│   │   ├── [id]/page.tsx       # Question detail with answers
│   │   └── ask/page.tsx        # Ask question
│   │
│   ├── blogs/
│   │   ├── page.tsx            # All published blogs
│   │   ├── [slug]/page.tsx     # Blog detail
│   │   └── write/page.tsx      # Blog editor
│   │
│   ├── knowledge/
│   │   └── page.tsx            # Knowledge hub (browse/search)
│   │
│   ├── events/
│   │   ├── page.tsx            # Browse events
│   │   ├── [id]/page.tsx       # Event detail
│   │   └── create/page.tsx     # Create event
│   │
│   ├── learning/
│   │   ├── page.tsx            # Course catalog
│   │   ├── [courseId]/page.tsx # Course detail
│   │   ├── [courseId]/[moduleId]/page.tsx  # Module detail
│   │   └── my-learning/page.tsx # My learning dashboard
│   │
│   ├── mentorship/
│   │   ├── page.tsx            # Mentorship dashboard
│   │   ├── find-mentor/page.tsx
│   │   └── offer/page.tsx      # Offer to mentor
│   │
│   ├── reviews/
│   │   ├── employers/page.tsx  # Employer reviews
│   │   ├── vendors/page.tsx    # HR tech vendor reviews
│   │   └── salary/page.tsx     # Salary benchmarking
│   │
│   ├── career/
│   │   └── page.tsx            # Career pathing tool
│   │
│   ├── news/
│   │   └── page.tsx            # HR news feed
│   │
│   ├── ai/
│   │   └── page.tsx            # AI assistant (chat interface)
│   │
│   └── layout.tsx              # Main layout (header + sidebar + content)
│
├── (admin)/
│   ├── page.tsx                # Admin dashboard
│   ├── users/page.tsx
│   ├── communities/page.tsx
│   ├── content/page.tsx
│   ├── events/page.tsx
│   ├── learning/page.tsx
│   ├── moderation/page.tsx
│   ├── analytics/page.tsx
│   └── layout.tsx              # Admin layout (admin sidebar + content)
│
├── layout.tsx                  # Root layout (providers, global styles)
└── page.tsx                    # Landing page (for guests)
```

### State Management Architecture

**Zustand Stores** (client-side state):
- `useAuthStore`: Current user, auth status, token management
- `useUIStore`: Sidebar state, modals, theme, notifications panel
- `useMessageStore`: Conversations, active chat, real-time messages
- `useNotificationStore`: Notification count, notification list

**TanStack Query** (server state):
- `useQuery`: Fetch discussions, questions, blogs, profiles, communities
- `useMutation`: Create/edit/delete content, connections, messages
- `useInfiniteQuery`: Paginated feeds (discussions, notifications, messages)
- Query invalidation on mutations for automatic cache updates

### API Client Design

```typescript
// lib/api.ts — Axios instance with interceptors
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken(); // from httpOnly cookie or memory
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 → refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const newToken = await refreshAccessToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Component Architecture Pattern

Every feature module follows this pattern:
```
components/
└── {feature}/
    ├── {Feature}List.tsx        # List view (server component, fetches data)
    ├── {Feature}Card.tsx        # Card component (client component)
    ├── {Feature}Detail.tsx      # Detail view (server component)
    ├── {Feature}Form.tsx        # Create/edit form (client component)
    ├── {Feature}Empty.tsx       # Empty state
    ├── {Feature}Skeleton.tsx    # Loading skeleton
    ├── {Feature}Error.tsx       # Error state
    └── hooks/
        └── use{Feature}.ts      # Custom hooks for the feature
```

---

## 3. Backend Architecture (NestJS)

### Module Pattern

Every NestJS module follows this structure:

```
modules/{module-name}/
├── {module-name}.module.ts       # Module definition (imports, controllers, providers, exports)
├── {module-name}.controller.ts   # HTTP endpoints (routing, request handling)
├── {module-name}.service.ts      # Business logic (the core)
├── {module-name}.spec.ts         # Unit tests
├── dto/
│   ├── create-{entity}.dto.ts    # Create validation DTO
│   ├── update-{entity}.dto.ts    # Update validation DTO
│   └── query-{entity}.dto.ts     # Query/filter DTO
├── entities/
│   └── {entity}.entity.ts        # TypeORM/Prisma entity
└── interfaces/
    └── {module-name}.interface.ts # TypeScript interfaces
```

### Request Flow

```
HTTP Request
    → NGINX (rate limiting, SSL)
        → NestJS Controller (routing, DTO validation via pipes)
            → Guard (authentication, authorization, role check)
                → Service (business logic)
                    → Repository (database access via TypeORM/Prisma)
                        → PostgreSQL
                    → Cache (Redis, cache-aside pattern)
                    → Queue (BullMQ for async tasks)
                    → External Service (S3, Elasticsearch, AI)
                ← Service result
            ← Controller transforms to response DTO
        ← Response (JSON)
```

### Key NestJS Patterns

**Guards**:
- `JwtAuthGuard`: Validates JWT token, attaches user to request
- `RolesGuard`: Checks user roles against required roles
- `PermissionGuard`: Checks fine-grained permissions

**Interceptors**:
- `LoggingInterceptor`: Logs request/response for all endpoints
- `TransformInterceptor`: Wraps all responses in standard format `{ data, meta, message }`
- `CacheInterceptor`: Caches GET responses in Redis (TTL per endpoint)

**Pipes**:
- `ValidationPipe`: Global DTO validation using `class-validator`
- `ParseUuidPipe`: Validates UUID parameters

**Filters**:
- `AllExceptionsFilter`: Global exception handler → standardized error responses

**DTOs with class-validator**:
```typescript
// Example: Create Discussion DTO
export class CreateDiscussionDto {
  @IsString()
  @Length(10, 500)
  title: string;

  @IsString()
  @Length(50, 10000)
  body: string;

  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  tags: string[];

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsEnum(ContentFlair)
  flair?: ContentFlair;

  @IsUUID()
  communityId?: string;
}
```

---

## 4. Authentication Architecture

### OAuth 2.0 + JWT Implementation

**Flow**:
1. User registers/logs in via email+password OR social OAuth (Google, LinkedIn, Microsoft)
2. Backend validates credentials / exchanges OAuth code
3. Backend generates: Access Token (JWT, 15 min) + Refresh Token (JWT, 7 days)
4. Access Token stored in memory (frontend), Refresh Token in httpOnly secure cookie
5. Access Token sent in `Authorization: Bearer <token>` header
6. When access token expires, frontend calls `/auth/refresh` (refresh token from cookie)
7. Backend issues new access + refresh tokens (refresh token rotation)
8. User can have multiple active sessions (tracked in database)
9. Logout invalidates refresh token in database

**JWT Payload**:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "member",
  "trustLevel": 3,
  "iat": 1720123456,
  "exp": 1720124356
}
```

**Token Storage Strategy**:
- Access Token: In-memory only (JavaScript variable), not localStorage (XSS protection)
- Refresh Token: httpOnly, Secure, SameSite=Strict cookie
- Session tracking: Database table `sessions` with device info, IP, last active

**Multi-Provider SSO**:
- Google: `passport-google-oauth20`
- LinkedIn: `passport-linkedin-oauth2`
- Microsoft: `passport-azure-ad`
- Each provider maps to a unified user account via email matching
- First login via social: create account + send email verification
- Subsequent: match existing account or create new

---

## 5. Real-Time Architecture (WebSocket)

### Implementation: Socket.IO

**Why Socket.IO over raw WebSocket**: Built-in rooms, namespaces, reconnection, fallback to long-polling, simpler API.

**Gateway Architecture**:
```typescript
// infrastructure/ws/ws.gateway.ts
@WebSocketGateway({ cors: true, namespace: '/' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    // Authenticate via JWT from handshake
    // Join user's personal room: client.join(`user:${userId}`)
    // Join notification room: client.join(`notifications:${userId}`)
  }

  // Rooms for real-time features:
  // - messages:{conversationId} — private messaging
  // - discussion:{discussionId} — real-time comment updates
  // - community:{communityId} — community activity
  // - notifications:{userId} — personal notifications
}
```

**Real-Time Events**:

| Event | Trigger | Payload |
|---|---|---|
| `notification:new` | Any notification trigger | Notification object |
| `message:new` | New private message | Message object |
| `message:typing` | User typing in chat | `{ conversationId, userId }` |
| `discussion:comment:new` | New comment on discussion | Comment object |
| `discussion:reaction:new` | New reaction on discussion | Reaction object |
| `qa:answer:new` | New answer on question | Answer object |
| `community:member:join` | New member joined community | `{ communityId, userId }` |
| `user:online` | User comes online | `{ userId, status: 'online' }` |
| `user:offline` | User goes offline | `{ userId, status: 'offline' }` |
| `ai:streaming` | AI response streaming chunks | `{ messageId, chunk, done }` |

**Scaling WebSocket**: Use Redis adapter for multi-instance Socket.IO:
```typescript
const ioAdapter = createRedisAdapter(redisUrl);
app.wsAdapter = ioAdapter;
```

---

## 6. Search Architecture (Elasticsearch)

### Index Design

**Indices**:
- `discussions`: Discussion posts (title, body, tags, community, author, reactions, created_at)
- `questions`: Q&A questions (title, body, tags, answers_count, has_accepted, created_at)
- `answers`: Q&A answers (body, question_id, is_accepted, author, reactions)
- `blogs`: Published blogs (title, body, summary, author, category, tags, published_at)
- `knowledge`: Knowledge hub resources (title, body, type, category, tags, quality_rating)
- `members`: Member profiles (name, headline, skills, specialties, location, certifications)
- `organizations`: Organization profiles (name, industry, description, location)
- `communities`: Communities (name, description, tags, member_count)

### Indexing Pipeline

```
PostgreSQL (source of truth)
    → Change Data Capture (CDC) via LISTEN/NOTIFY
        → NestJS event handler
            → Transform to Elasticsearch document
                → Index in Elasticsearch
```

**Implementation**: Use NestJS `@nestjs/elasticsearch` module. On every write operation (create, update, delete) in the service layer, also index/delete in Elasticsearch. Use a queue worker for async indexing to avoid blocking the API response.

**Search API**:
```typescript
// POST /api/v1/search
{
  "query": "how to handle remote work policy",
  "types": ["discussions", "questions", "blogs", "knowledge"],
  "filters": {
    "tags": ["remote-work", "policy"],
    "community": "hr-compliance",
    "dateRange": { "from": "2026-01-01" }
  },
  "page": 1,
  "limit": 20,
  "sort": "relevance" // or "latest", "most_helpful"
}
```

**Semantic Search (v2)**: Use embedding model to convert queries and documents to vectors, store in Elasticsearch vector fields, use cosine similarity for ranking. This enables natural language queries that match meaning, not just keywords.

---

## 7. AI Integration Architecture

### LLM Provider Strategy

- **Primary**: OpenAI GPT-4o (or compatible API — Anthropic Claude, Google Gemini via adapter pattern)
- **Fallback**: Open-source model (Llama 3 70B) via local inference for cost reduction on high-volume queries
- **Embedding Model**: OpenAI `text-embedding-3-small` for RAG and semantic search

### RAG (Retrieval-Augmented Generation) Pipeline

```
User Query ("What are the legal requirements for PTO in California?")
    → Intent Classification (NestJS service)
        → Query Expansion (reformulate query for better retrieval)
            → Elasticsearch Retrieval (search Knowledge Hub + Discussions + Blogs)
                → Re-rank results (by relevance, quality, recency)
                    → Build Context Window (top 5-10 relevant passages)
                        → Prompt Template (system prompt + context + user query)
                            → LLM Call (GPT-4o)
                                → Response
                                    → Citation Injection (link to source documents)
                                        → Stream to User (via WebSocket)
```

### AI Service Architecture

```typescript
// modules/ai/ai.service.ts
@Injectable()
export class AiService {
  // 15 HR-specific capabilities (see Product Spec Module 12)
  // Each capability has:
  // 1. System prompt template (stored in database for easy updates)
  // 2. RAG retrieval strategy (which indices to search)
  // 3. Output format (JSON schema for structured outputs)
  // 4. Safety checks (PII detection, legal disclaimer injection)

  async askQuestion(userId: string, query: string, capability: AiCapability) {
    // 1. Check rate limit (30/hour, 200/day)
    // 2. Detect PII in query → warn user
    // 3. Retrieve relevant context via RAG
    // 4. Build prompt with context
    // 5. Stream LLM response via WebSocket
    // 6. Save conversation to history
    // 7. Log usage for analytics
  }
}
```

### AI Safety Measures
- All AI responses include: "Generated by HRShakti AI — Review and verify before use"
- PII detection before sending to LLM (mask names, emails, phone numbers, company names in anonymous mode)
- Legal disclaimer auto-injected for compliance/legal queries
- AI cannot generate community posts, blog articles, or Q&A answers
- Content moderation on AI outputs (flag potentially harmful or biased responses)
- Rate limiting prevents abuse

---

## 8. File Storage Architecture

### Storage Providers
- **Primary**: Amazon S3 (or Cloudflare R2 for cost optimization)
- **CDN**: CloudFront (or Cloudflare CDN for R2)

### File Types & Storage Strategy

| File Type | Max Size | Storage Path | Processing |
|---|---|---|---|
| Profile Photos | 5 MB | `avatars/{userId}/{hash}.webp` | Resize: 200x200, 400x400, 800x800 |
| Community Covers | 10 MB | `communities/{communityId}/cover.{ext}` | Resize: 1200x400 |
| Blog Images | 10 MB | `blogs/{blogId}/images/{hash}.{ext}` | WebP conversion, responsive sizes |
| Course Videos | 500 MB | `courses/{courseId}/{moduleId}/video.mp4` | Streaming via HLS |
| Documents | 25 MB | `documents/{type}/{year}/{month}/{hash}.{ext}` | Virus scan |
| Certificates | 1 MB | `certificates/{userId}/{certId}.pdf` | Generated on-the-fly |
| Event Recordings | 2 GB | `events/{eventId}/recording.mp4` | HLS transcoding (async) |

### Image Processing Pipeline

```
User Uploads Image
    → Validate (type, size, dimensions)
        → Upload to S3 (original)
            → Queue: Image Processing Job
                → Sharp: Resize to multiple sizes (thumbnail, medium, large)
                    → Convert to WebP
                        → Upload variants to S3
                            → Update database with URLs
```

### Pre-signed URLs
All uploads use pre-signed S3 URLs:
- Frontend requests upload URL from backend
- Backend generates pre-signed PUT URL (5 min expiry)
- Frontend uploads directly to S3 (bypasses backend for large files)
- Frontend confirms upload → backend processes the file

---

## 9. Caching Strategy (Redis)

### Cache Patterns

**Cache-Aside** (most common):
```typescript
async getDiscussion(id: string) {
  const cached = await redis.get(`discussion:${id}`);
  if (cached) return JSON.parse(cached);
  
  const discussion = await this.repository.findOne(id);
  await redis.set(`discussion:${id}`, JSON.stringify(discussion), 'EX', 3600);
  return discussion;
}
```

**Write-Through** (for critical data):
```typescript
async updateProfile(userId: string, data: UpdateProfileDto) {
  const profile = await this.repository.update(userId, data);
  await redis.set(`profile:${userId}`, JSON.stringify(profile), 'EX', 1800);
  return profile;
}
```

### Cache Keys & TTLs

| Cache Key | TTL | Invalidation Trigger |
|---|---|---|
| `user:{id}` | 30 min | Profile update, role change |
| `user:{username}` | 30 min | Profile update |
| `profile:{id}` | 30 min | Profile update |
| `discussion:{id}` | 1 hour | Edit, delete, new comment/reaction |
| `discussion:feed:{sort}:{page}` | 5 min | New post, reaction, comment |
| `question:{id}` | 1 hour | Edit, delete, new answer |
| `community:{slug}` | 1 hour | Edit, new member, new post |
| `blog:{slug}` | 2 hours | Edit, new comment/reaction |
| `knowledge:{id}` | 6 hours | Edit, new review |
| `search:suggestions:{query}` | 10 min | New content indexed |
| `session:{id}` | 7 days | Logout, token refresh |
| `rate-limit:{userId}:{action}` | Variable (1 min - 1 hour) | Automatic expiry |

### Redis Uses
1. **Application Cache**: Hot data caching (cache-aside pattern)
2. **Session Storage**: Refresh token sessions
3. **Rate Limiting**: Sliding window counter per user per action
4. **WebSocket Adapter**: Socket.IO multi-instance communication
5. **BullMQ Backend**: Job queue storage
6. **Real-time presence**: Online/offline user status tracking

---

## 10. Message Queue Architecture (BullMQ)

### Queue Definitions

| Queue | Purpose | Concurrency | Retry Strategy |
|---|---|---|---|
| `notification` | Send in-app + email notifications | 10 | 3 retries, exponential backoff |
| `email` | Send emails (transactional, digest) | 5 | 5 retries, exponential backoff |
| `search-index` | Index/deindex content in Elasticsearch | 5 | 3 retries |
| `media-process` | Image resize, video transcode | 2 | 3 retries |
| `analytics` | Track events, update dashboards | 5 | No retry (eventual) |
| `ai-process` | AI requests (RAG pipeline) | 3 | 2 retries |
| `certificate-generate` | Generate PDF certificates | 3 | 3 retries |
| `credit-track` | Update recertification credits | 5 | 3 retries |
| `audit-log` | Write immutable audit entries | 10 | 5 retries |
| `content-moderate` | AI-assisted content moderation | 5 | 3 retries |

### Queue Architecture

```typescript
// infrastructure/queue/queue.module.ts
@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'notification' },
      { name: 'email' },
      { name: 'search-index' },
      { name: 'media-process' },
      { name: 'analytics' },
      { name: 'ai-process' },
      { name: 'certificate-generate' },
      { name: 'credit-track' },
      { name: 'audit-log' },
      { name: 'content-moderate' },
    ),
  ],
})
export class QueueModule {}
```

### Example: Notification Flow

```
User Action (e.g., someone comments on your post)
    → DiscussionService.addComment()
        → Emit event: 'notification.created'
            → NotificationProcessor (queue consumer)
                → Create in-app notification (DB)
                → Push via WebSocket to user
                → Check user email preferences
                    → If immediate: Add to email queue
                    → If digest: Add to digest aggregation (Redis list, keyed by user + digest frequency)
```

---

## 11. Database Architecture (PostgreSQL)

### Connection Management
- **PgBouncer**: Connection pooling (pool mode: transaction)
- **Connection limits**: 100 connections per instance, PgBouncer manages 1000+ client connections
- **Read replicas**: 1 primary (write) + 2 read replicas (read queries)
- **ORM**: TypeORM or Prisma (choose one at project start — Prisma recommended for type safety and DX)

### Migration Strategy
- Sequential numbered migrations: `YYYYMMDDHHMMSS_create_users.ts`
- Up + Down migrations (always reversible)
- Run migrations as part of CI/CD deployment (before app starts)
- Seed data for: default communities, HR tag taxonomy, default badges, sample content

### Backup Strategy
- **Daily full backup**: pg_dump, stored in S3, 30-day retention
- **Continuous WAL archiving**: Point-in-time recovery capability
- **Weekly backup restore test**: Automated restore to staging environment
- **Cross-region backup**: Copy daily backups to secondary region

---

## 12. Security Architecture

### HTTPS & TLS
- TLS 1.3 minimum on all connections
- SSL certificates via Let's Encrypt (auto-renewal via Certbot)
- HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### Authentication Security
- Password hashing: Argon2id (memory: 65536, iterations: 3, parallelism: 4)
- JWT: RS256 signing, 15-min access token, 7-day refresh token with rotation
- Refresh token stored in httpOnly, Secure, SameSite=Strict cookie
- Account lockout after 5 failed login attempts (15 min cooldown)
- Email verification required before profile creation
- Device tracking: IP, user-agent, last active (stored in sessions table)

### Authorization Security
- RBAC with fine-grained permissions (see Auth/RBAC/Security doc)
- Permission checks on every API endpoint via guards
- Resource-level authorization: Users can only edit their own content (unless admin/moderator)
- Anonymous mode: Identity hidden, but credential badge visible, activity logged (encrypted)

### Input Security
- Global `ValidationPipe` with `class-validator` on all DTOs
- `sanitize()` on all string inputs (strip HTML tags unless explicitly allowed)
- Rich text content: Server-side HTML sanitization (DOMPurify server equivalent)
- File upload validation: MIME type checking, file size limits, virus scanning
- SQL injection prevention: Parameterized queries via ORM (no raw SQL without explicit approval)

### API Security
- CORS: Whitelist specific origins only
- Rate limiting: Per-user, per-endpoint, per IP (sliding window via Redis)
- Request ID: Unique ID per request for tracing
- API versioning: URL-based (`/api/v1/`, `/api/v2/`)
- Sensitive endpoints: Additional confirmation step (e.g., delete account)

### Data Security
- PII encryption at rest: AES-256 for salary data, anonymous review identifiers
- Audit logging: Every admin/moderation action logged immutably (actor, action, timestamp, affected resource, IP)
- Anonymous content: Author identity encrypted, reversible only by Super Admin with justification
- Data retention: Configurable retention periods, GDPR right-to-erasure support

---

## 13. Infrastructure & Deployment

### Docker Containerization

**Multi-stage Dockerfiles**:
- Stage 1 (Build): Install dependencies, compile TypeScript
- Stage 2 (Production): Copy built artifacts, minimal base image (node:20-alpine)

### Kubernetes Orchestration

**Deployments**:
- `web`: Next.js (3+ replicas, horizontal pod autoscaling)
- `api`: NestJS (3+ replicas, HPA based on CPU/memory)
- `worker`: BullMQ queue workers (2+ replicas per queue type)

**StatefulSets**:
- `redis`: Redis cluster (or use managed Redis like AWS ElastiCache)
- `postgresql`: Primary + replicas (or use managed PostgreSQL like AWS RDS)

**Ingress**:
- NGINX Ingress Controller
- TLS termination at ingress
- Rate limiting at ingress level
- Path-based routing: `/api/*` → api-service, `/*` → web-service

### CI/CD Pipeline (GitHub Actions)

```
Push to main/develop
    → Lint (ESLint, Prettier)
        → Type check (tsc)
            → Unit tests (Jest)
                → Integration tests
                    → Build Docker images
                        → Push to Container Registry (ECR/GHCR)
                            → Deploy to Kubernetes (Helm upgrade)
                                → Smoke tests
                                    → Notify team (Slack)
```

### Environments
- **Development**: Local Docker Compose (PostgreSQL, Redis, Elasticsearch, S3-compatible MinIO)
- **Staging**: Kubernetes cluster (mirrors production), seeded with test data
- **Production**: Kubernetes cluster, multi-AZ, auto-scaling, monitoring

### Blue-Green Deployment
- Maintain two identical environments (blue + green)
- Deploy to inactive environment, run smoke tests, switch traffic
- Instant rollback by switching traffic back

---

## 14. Monitoring & Observability

### Metrics (Prometheus)
- **RED metrics**: Rate, Errors, Duration for all API endpoints
- **USE metrics**: Utilization, Saturation, Errors for infrastructure (CPU, memory, disk, network)
- **Business metrics**: DAU/MAU, posts/day, signups/day, AI queries/day, conversion rate
- Custom metrics: Cache hit rate, queue depth, search latency, WebSocket connections

### Dashboards (Grafana)
- **System Overview**: Health of all services, error rates, response times
- **API Performance**: Request rate, latency percentiles (P50, P95, P99), error rate by endpoint
- **Database**: Query performance, connection pool, replication lag
- **Business KPIs**: User growth, content velocity, engagement metrics
- **Infrastructure**: Resource utilization, auto-scaling events, costs

### Logging
- **Structured JSON logging** via Pino (fast, low-overhead)
- Log levels: ERROR, WARN, INFO, DEBUG (DEBUG only in development)
- Correlation: Request ID in all log entries for request tracing
- Aggregation: ELK Stack (Elasticsearch + Logstash + Kibana) or Loki

### Error Tracking (Sentry)
- Automatic error capture from frontend and backend
- Source maps for readable stack traces
- Release tracking (which deployment introduced the error)
- Alerting: Slack notifications for new errors, spike detection

### Alerting
- **Critical**: API error rate > 5%, database down, disk > 90% → immediate Slack + PagerDuty
- **Warning**: API P99 > 2s, cache hit rate < 70%, queue depth > 1000 → Slack notification
- **Info**: Weekly report on system health, performance trends

---

## 15. API Gateway & Versioning

### NGINX Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.hrshakti.com;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=global:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=ai:10m rate=30r/h;

    location /api/v1/auth/ {
        limit_req zone=auth burst=10 nodelay;
        proxy_pass http://api-service:4000;
    }

    location /api/v1/ai/ {
        limit_req zone=ai burst=5 nodelay;
        proxy_pass http://api-service:4000;
    }

    location /api/v1/ {
        limit_req zone=global burst=50 nodelay;
        proxy_pass http://api-service:4000;
    }

    location / {
        proxy_pass http://web-service:3000;
    }
}
```

### API Versioning
- URL-based versioning: `/api/v1/`, `/api/v2/`
- Version lifecycle: v1 is current, v2 is development
- Deprecation policy: 6-month notice before version sunset
- Breaking changes only in new versions

---

## 16. Scaling Strategy

### Horizontal Scaling
- Application servers (Next.js + NestJS): Stateless → add more pods via HPA
- HPA triggers: CPU > 70%, Memory > 80%, Custom metric (request rate > threshold)
- Target: Support 100,000+ concurrent users

### Database Scaling
- Read replicas for read-heavy queries (feed, search, profile views)
- Connection pooling via PgBouncer
- Table partitioning for high-volume tables (notifications, reactions, audit_logs)
- Future: Sharding by user_id for ultra-scale (10M+ users)

### Caching Scaling
- Redis Cluster mode for > 100GB cache
- Cache warming: Pre-populate cache on deploy
- Cache invalidation: Event-driven (database triggers → cache invalidation queue)

### CDN Scaling
- All static assets served via CDN
- Media assets (images, videos) served directly from S3/CDN
- Edge caching for API responses where appropriate (public content)

### Search Scaling
- Elasticsearch cluster: 3+ data nodes, 2+ master nodes
- Index lifecycle management: Hot-warm-cold architecture
- Search-as-you-type: Completion suggester index

---

*This architecture is designed for day-1 production with headroom for growth. Start with the modular monolith (single NestJS app) and decompose into microservices only when justified by scale or team growth.*