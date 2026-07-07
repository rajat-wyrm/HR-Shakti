# HR-Shakti

A verified, community-first ecosystem for HR professionals to network, discuss, learn, and get AI-powered assistance.

**Private Repository** — Owned and operated by HR-Shakti. All rights reserved.

---

## Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14, React 18, Tailwind CSS | Web application |
| Backend | NestJS 10, TypeScript | REST API |
| Database | PostgreSQL (Neon) | Primary data store |
| Cache | Redis Cloud | Session & caching |
| Search | Elasticsearch | Full-text search |
| Storage | MinIO / S3 | File uploads |
| AI | Grok, Gemini API | AI-powered features |

## Quick Start

```bash
# Clone and setup
git clone https://github.com/rajat-wyrm/HR-Shakti.git
cd HR-Shakti
./start.sh
```

| Service | URL |
|---------|-----|
| Web App | http://localhost:3000 |
| API | http://localhost:4000 |
| Swagger Docs | http://localhost:4000/api/docs |

## API Modules

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | 2 | Register, Login (JWT RS256) |
| Users | 9 | Profile CRUD, experiences, education, skills |
| Network | 9 | Follow, connections, blocks |
| Communities | 8 | Create, join, moderate communities |
| Organizations | 8 | Company profiles, claims, members |
| Discussions | 10 | Threads, comments, polls, bookmarks |
| Q&A | 12 | Questions, answers, tags, voting |
| Blogs | 12 | Posts, comments, series, voting |
| Notifications | 7 | In-app notifications, preferences |
| Reactions | 5 | Polymorphic reactions, bookmarks, reports |

## Project Structure

```
HR-Shakti/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/     # JWT authentication
│   │   │   ├── users/    # User management
│   │   │   ├── network/  # Social connections
│   │   │   ├── communities/
│   │   │   ├── organizations/
│   │   │   ├── discussions/
│   │   │   ├── qa/       # Questions & answers
│   │   │   ├── blogs/
│   │   │   ├── notifications/
│   │   │   └── reactions/
│   │   └── prisma/       # Database schema & seed
│   └── web/              # Next.js frontend
├── docker/               # Docker configs
├── docs/                 # Design docs
└── keys/                 # JWT keys (gitignored)
```

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_PRIVATE_KEY_PATH` | Path to RSA private key |
| `JWT_PUBLIC_KEY_PATH` | Path to RSA public key |
| `GEMINI_API_KEY` | Google Gemini API key |

## Tech Stack

- **Runtime**: Node.js 18+
- **Package Manager**: pnpm 9 (monorepo)
- **Build**: Turborepo
- **ORM**: Prisma 5
- **Auth**: Passport.js + JWT RS256
- **Validation**: class-validator + Zod
- **Testing**: Smoke tests per module

## License

Proprietary — Copyright © 2024 HR-Shakti. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.
