# High Level Design — HR-Shakti

## 1. System Overview

HR-Shakti is a community-first platform for HR professionals, combining social networking, knowledge sharing, and AI-powered assistance into a single ecosystem.

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTS                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Web App  │  │ Mobile   │  │ 3rd Party│              │
│  │(Next.js) │  │ (Future) │  │   APIs   │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
└───────┼──────────────┼──────────────┼───────────────────┘
        │              │              │
        ▼              ▼              ▼
┌─────────────────────────────────────────────────────────┐
│                   API GATEWAY                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │  NestJS + Helmet + CORS + Rate Limiter           │   │
│  │  Global Prefix: /api/v1                          │   │
│  └──────────────────────┬───────────────────────────┘   │
└─────────────────────────┼───────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Auth Module │ │  JWT Guard   │ │  RBAC Guard  │
│  (RS256)     │ │              │ │              │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       └────────────────┼────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   BUSINESS LAYER                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │  Users  │ │ Network │ │Comms/   │ │  Orgs   │      │
│  │         │ │         │ │Orgs     │ │         │      │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │  Q&A    │ │  Blogs  │ │Discuss. │ │Notifs   │      │
│  │         │ │         │ │         │ │         │      │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘      │
│       └────────────┼──────────┼───────────┘            │
│                    ▼                                   │
│            ┌──────────────┐                            │
│            │  Reactions   │                            │
│            │  Bookmarks   │                            │
│            │  Reports     │                            │
│            └──────────────┘                            │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER                           │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │  Redis   │  │ Elasticsearch│     │
│  │  (Neon)      │  │  Cloud   │  │  (Search)    │     │
│  │  Prisma ORM  │  │  Cache   │  │  Full-text   │     │
│  └──────────────┘  └──────────┘  └──────────────┘     │
│  ┌──────────────┐                                      │
│  │  S3 / MinIO  │                                      │
│  │  File Store  │                                      │
│  └──────────────┘                                      │
└─────────────────────────────────────────────────────────┘
```

## 3. Core Modules

### 3.1 Authentication & Authorization
- JWT RS256 tokens (asymmetric key pair)
- Argon2 password hashing
- Email verification flow
- Role-based access: super_admin, admin, moderator, member, guest
- Trust levels (1-5) for reputation-based permissions

### 3.2 User & Profile
- Complete profile with experiences, education, certifications, skills
- Profile completion tracking
- Professional verification status
- Soft-delete with audit trail

### 3.3 Social Network
- Follow/Unfollow connections
- 1-to-1 connection requests (pending → accepted)
- Block/Unblock users
- Follower/following counts

### 3.4 Communities
- Public, restricted, and private access types
- Member management with role-based moderation
- Discussion threads within communities
- Community statistics (member count, discussion count)

### 3.5 Organizations
- Company profiles with verification
- Employee claims via work email
- Member directory with role/title
- Employer reviews from employees

### 3.6 Discussions
- Threaded comments with depth tracking
- Polls with multiple options
- Reaction types: helpful, insightful, from_experience, inaccurate
- Quality scoring algorithm
- Pin, lock, and status management

### 3.7 Q&A
- Question/Answer model (Stack Overflow-style)
- Tag-based categorization
- Vote system (upvote/downvote)
- Accepted answer marking
- Bounty system

### 3.8 Blogs
- Rich text posts with status workflow
- Draft → Peer Review → Editorial Review → Published
- Blog series for multi-part content
- Comment system with nested replies
- Voting on posts

### 3.9 Notifications
- In-app, email, and push channels
- Per-type notification preferences
- Read/unread tracking with bulk actions

### 3.10 Reactions & Reports
- Polymorphic reactions (works on any content type)
- Content bookmarking
- Content reporting with moderation workflow

## 4. Data Flow

### Registration Flow
```
Client → POST /api/v1/auth/register
  → Validate DTO (email, password, name)
  → Hash password (Argon2)
  → Create user (status: pending_verification)
  → Create email verification token
  → Return userId + message
```

### Authentication Flow
```
Client → POST /api/v1/auth/login
  → Validate credentials
  → Check rate limiting (5 attempts / 15 min)
  → Verify password (Argon2)
  → Generate JWT access token (RS256, 15 min)
  → Generate refresh token (UUID, SHA-256 hash)
  → Store refresh token in sessions table
  → Return tokens + user info
```

### API Request Flow
```
Client → GET /api/v1/resource (Bearer token)
  → Helmet (security headers)
  → Rate limiter (100 req/min)
  → JWT Guard (verify token, attach user)
  → Role Guard (check permissions)
  → Controller → Service → Prisma → PostgreSQL
  → Transform Interceptor (wrap response)
  → Client
```

## 5. Security

| Layer | Mechanism |
|-------|-----------|
| Transport | HTTPS (TLS) |
| Headers | Helmet.js |
| Auth | JWT RS256, Argon2 passwords |
| Rate Limiting | 100 requests/minute per IP |
| CORS | Origin whitelist |
| Validation | class-validator (whitelist + transform) |
| SQL Injection | Prisma parameterized queries |
| Secrets | Environment variables (.env, gitignored) |

## 6. Deployment

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Vercel  │────▶│  Neon DB │     │  Redis   │
│  (Web)   │     │  (Postgres)    │  Cloud   │
└──────────┘     └──────────┘     └──────────┘

┌──────────┐     ┌──────────┐     ┌──────────┐
│ Railway/ │────▶│  MinIO   │     │Elastic-  │
│ Fly.io   │     │  (S3)    │     │ search   │
│  (API)   │     └──────────┘     └──────────┘
└──────────┘
```
