# Phase 2: Network & Social Layer

## Overview

Build 5 NestJS modules for the HR professional community social layer. Each module follows the established pattern: `module.ts` + `service.ts` + `controller.ts` + `dto/` with `class-validator` DTOs, `@UseGuards(JwtAuthGuard)` auth, and `PrismaService` for database access.

## Build Order

1. **Network** — follow/unfollow, connection request/accept/reject/block
2. **Content Reactions** — polymorphic reactions, bookmarks, reports
3. **Communities** — CRUD, join/leave, moderators
4. **Organizations** — CRUD, claim workflow, member management
5. **Discussions** — posts, nested comments (LTREE), anonymous mode, polls, bookmark

---

## Module 1: Network

### Models (schema.prisma — already defined)

- `Follow` — followerId, targetId, createdAt
- `Connection` — requesterId, targetId, status (ConnectionStatus: pending/accepted/blocked), createdAt, updatedAt
- `Block` — initiatorId, targetId, createdAt

### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /network/follow/:userId | Follow a user | JWT |
| DELETE | /network/follow/:userId | Unfollow a user | JWT |
| GET | /network/followers | Get my followers | JWT |
| GET | /network/following | Get who I follow | JWT |
| POST | /network/connections/request/:userId | Send connection request | JWT |
| PUT | /network/connections/:id/accept | Accept connection | JWT |
| PUT | /network/connections/:id/reject | Reject connection | JWT |
| GET | /network/connections | List my connections (filter by status) | JWT |
| POST | /network/block/:userId | Block a user | JWT |
| DELETE | /network/block/:userId | Unblock a user | JWT |
| GET | /network/blocked | List blocked users | JWT |

### Business Rules

- Cannot follow yourself
- Cannot follow someone you've blocked or who blocked you
- Connection request requires mutual follow (optional: can be configured)
- Blocking removes existing follow/connection relationships

---

## Module 2: Content Reactions

### Models

- `ContentReaction` — polymorphic (targetType, targetId, userId, type: ReactionType)
- `ContentBookmark` — polymorphic (targetType, targetId, userId)
- `ContentReport` — polymorphic (targetType, targetId, reporterId, reason, status)

### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /reactions | Toggle reaction (add/remove) | JWT |
| GET | /reactions/:targetType/:targetId | Get reactions for content | JWT |
| POST | /bookmarks | Toggle bookmark | JWT |
| GET | /bookmarks | Get my bookmarks | JWT |
| POST | /reports | Report content | JWT |

### Business Rules

- Same user + same targetType + same targetId + same type = toggle (remove if exists)
- Bookmark toggle: add if not bookmarked, remove if already bookmarked
- Reports are one-time; duplicate reports update the reason but don't create duplicates

---

## Module 3: Communities

### Models

- `Community` — name, slug, description, avatar, coverImage, accessType (public/restricted/private), tags, memberCount, discussionCount
- `CommunityMember` — communityId, userId, role, joinedAt
- `CommunityModerator` — communityId, userId

### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /communities | Create community | JWT |
| GET | /communities | List communities (public) | Optional |
| GET | /communities/:slug | Get community details | Optional |
| PUT | /communities/:id | Update community | Owner/Mod |
| DELETE | /communities/:id | Delete community | Owner |
| POST | /communities/:id/join | Join community | JWT |
| POST | /communities/:id/leave | Leave community | JWT |
| POST | /communities/:id/moderators | Add moderator | Owner |
| DELETE | /communities/:id/moderators/:userId | Remove moderator | Owner |
| GET | /communities/:id/members | List members | Optional |

---

## Module 4: Organizations

### Models

- `Organization` — name, slug, description, logo, coverImage, website, industry, companySize, location, verified, verificationDoc
- `OrganizationMember` — orgId, userId, role (admin/member), title, department
- `OrganizationClaim` — orgId, claimerId, workEmail, verificationToken, status (pending/approved/rejected)

### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /organizations | Create organization | JWT |
| GET | /organizations | List organizations | Optional |
| GET | /organizations/:slug | Get org details | Optional |
| PUT | /organizations/:id | Update org | Admin/Owner |
| POST | /organizations/:id/claim | Start claim process | JWT |
| POST | /organizations/:id/verify | Verify email for claim | JWT |
| PUT | /organizations/:id/members/:userId | Update member role | Admin |
| DELETE | /organizations/:id/members/:userId | Remove member | Admin |

---

## Module 5: Discussions

### Models

- `Discussion` — title, content, tags, poll support, reaction counters, pinned, locked, status
- `DiscussionComment` — nested via LTREE path column, anonymous mode, accepted answer flag
- `DiscussionPoll`, `DiscussionPollOption`, `DiscussionPollVote`
- `DiscussionBookmark`

### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /discussions | Create discussion | JWT |
| GET | /discussions | List discussions (filter/sort/paginate) | Optional |
| GET | /discussions/:id | Get discussion details | Optional |
| PUT | /discussions/:id | Update discussion | Owner/Mod |
| DELETE | /discussions/:id | Delete discussion | Owner/Mod |
| POST | /discussions/:id/comments | Add comment (supports reply with parentId) | JWT |
| GET | /discussions/:id/comments | Get comments (flat or threaded) | Optional |
| PUT | /comments/:id | Update comment | Owner |
| DELETE | /comments/:id | Delete comment | Owner |
| POST | /discussions/:id/polls/vote | Vote on poll | JWT |
| POST | /discussions/:id/bookmark | Toggle bookmark | JWT |

### LTREE for Nested Comments

- `comment.path` stores the materialized path (e.g. `root.sub1.sub2`)
- PostgreSQL `ltree` extension enables ancestor/descendant queries
- Enable extension in Prisma via `CREATE EXTENSION IF NOT EXISTS ltree` in init script
- Comment depth limited to 5 levels

---

## Shared Patterns Across All Modules

- **Error handling**: `NotFoundException`, `ConflictException`, `ForbiddenException` from NestJS common
- **Response format**: `{ data: ... }` wrapped by `TransformInterceptor`
- **Pagination**: Query params `page` (default 1) and `limit` (default 20, max 100), return `{ data: [...], meta: { total, page, limit, totalPages } }`
- **Auth guards**: `@UseGuards(JwtAuthGuard)` for protected, `@UseGuards(OptionalAuthGuard)` for public-with-opt-in
- **DTOs**: `class-validator` + `class-transformer` decorators on all input DTOs
- **DB access**: `PrismaService` injected via constructor

## Verification

After each module:
1. `pnpm build` to confirm compilation
2. Start API with `pnpm --filter @hrshakti/api dev`
3. Smoke test each endpoint with curl
4. Check Swagger docs at `/api/docs` for correct route mapping
