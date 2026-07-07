# Low Level Design — HR-Shakti

## 1. Database Schema

### 1.1 Entity Relationship

```
User ──┬── UserCredential (1:N)
       ├── Session (1:N)
       ├── UserExperience (1:N)
       ├── UserEducation (1:N)
       ├── UserCertification (1:N)
       ├── UserSkill (1:N)
       ├── Connection (1:N as requester/target)
       ├── Follow (1:N as follower/target)
       ├── Block (1:N as initiator/target)
       ├── OrganizationMember (1:N)
       ├── CommunityMember (1:N)
       ├── Discussion (1:N)
       ├── Question (1:N)
       ├── Answer (1:N)
       ├── BlogPost (1:N)
       ├── Notification (1:N)
       └── ContentReaction (1:N)

Organization ──┬── OrganizationMember (1:N)
               ├── OrganizationClaim (1:N)
               └── EmployerReview (1:N)

Community ──┬── CommunityMember (1:N)
            ├── CommunityModerator (1:N)
            └── Discussion (1:N)

Discussion ──┬── DiscussionComment (1:N)
             ├── DiscussionPoll (1:N)
             └── DiscussionBookmark (1:N)

Question ──┬── Answer (1:N)
           └── QuestionTag (M:N with Tag)

BlogPost ──┬── BlogComment (1:N)
           └── BlogSeriesPost (M:N with BlogSeries)
```

### 1.2 Key Tables

#### users
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, gen_random_uuid() | Primary key |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login identifier |
| password_hash | VARCHAR(255) | NULLABLE | Argon2 hash |
| first_name | VARCHAR(100) | NOT NULL | Display name |
| last_name | VARCHAR(100) | NOT NULL | Display name |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Public handle |
| role | ENUM | DEFAULT 'member' | super_admin/admin/moderator/member/guest |
| trust_level | SMALLINT | DEFAULT 1 | Reputation tier (1-5) |
| status | ENUM | DEFAULT 'active' | active/suspended/banned/pending_verification |

#### discussions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| community_id | UUID | FK → communities |
| author_id | UUID | FK → users |
| title | VARCHAR(300) | Discussion title |
| content | TEXT | Markdown content |
| tags | JSON | String array |
| quality_score | FLOAT | Computed ranking score |
| comment_count | INT | Denormalized count |
| view_count | INT | Denormalized count |

#### questions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| author_id | UUID | FK → users |
| title | VARCHAR(300) | Question title |
| content | TEXT | Description |
| answer_count | INT | Denormalized count |
| accepted_answer_id | UUID | FK → answers (nullable) |
| bounty | INT | Reward points |

## 2. API Design

### 2.1 Endpoint Convention

```
Base URL: /api/v1

GET    /resource          → List (with pagination)
POST   /resource          → Create
GET    /resource/:id      → Get by ID
PUT    /resource/:id      → Update
DELETE /resource/:id      → Delete
POST   /resource/:id/action → Custom action
```

### 2.2 Response Format

```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success"
}
```

### 2.3 Authentication Endpoints

```
POST /api/v1/auth/register
  Body: { email, password, firstName, lastName }
  Response: { userId, email, message }

POST /api/v1/auth/login
  Body: { email, password }
  Response: { accessToken, expiresIn, refreshToken, user }
```

### 2.4 Module Endpoints

#### Users
```
GET    /api/v1/users/me              → Current user profile
PUT    /api/v1/users/me              → Update profile
GET    /api/v1/users/:id             → Get user by ID
GET    /api/v1/users/by-email/:email → Get by email
POST   /api/v1/users/me/experiences  → Add experience
PUT    /api/v1/users/me/experiences/:id
DELETE /api/v1/users/me/experiences/:id
POST   /api/v1/users/me/education    → Add education
DELETE /api/v1/users/me/education/:id
POST   /api/v1/users/me/certifications
DELETE /api/v1/users/me/certifications/:id
POST   /api/v1/users/me/skills       → Add skill
DELETE /api/v1/users/me/skills/:id
```

#### Network
```
POST   /api/v1/network/follow/:userId
DELETE /api/v1/network/follow/:userId
GET    /api/v1/network/followers
GET    /api/v1/network/following
POST   /api/v1/network/connections/request/:userId
PUT    /api/v1/network/connections/:id/accept
PUT    /api/v1/network/connections/:id/reject
GET    /api/v1/network/connections
POST   /api/v1/network/block/:userId
DELETE /api/v1/network/block/:userId
GET    /api/v1/network/blocked
```

#### Discussions
```
POST   /api/v1/discussions           → Create
GET    /api/v1/discussions           → List (with sort: trending/best/latest)
GET    /api/v1/discussions/:id       → Get with comments
PUT    /api/v1/discussions/:id       → Update
DELETE /api/v1/discussions/:id       → Soft delete
POST   /api/v1/discussions/:id/comments     → Add comment
GET    /api/v1/discussions/:id/comments     → List comments
PUT    /api/v1/discussions/:id/comments/:cid
DELETE /api/v1/discussions/:id/comments/:cid
POST   /api/v1/discussions/:id/bookmark     → Toggle bookmark
POST   /api/v1/discussions/:id/polls/:pid/vote → Vote on poll
```

## 3. Service Layer Design

### 3.1 Module Pattern

```
Module
├── Controller    → HTTP routing, DTO validation
├── Service       → Business logic
├── DTOs          → Input validation (class-validator)
├── Guards        → Auth/role checks
└── Module Config → Provider registration
```

### 3.2 Key Service Methods

```typescript
// AuthService
register(dto: RegisterDto): Promise<{ userId, email, message }>
login(dto: LoginDto): Promise<{ accessToken, refreshToken, user }>

// UsersService
getProfile(userId: string): Promise<User>
updateProfile(userId: string, dto: UpdateProfileDto): Promise<User>
addExperience(userId: string, dto: AddExperienceDto): Promise<Experience>

// NetworkService
follow(followerId: string, targetId: string): Promise<void>
unfollow(followerId: string, targetId: string): Promise<void>
requestConnection(requesterId: string, targetId: string): Promise<Connection>
acceptConnection(userId: string, connectionId: string): Promise<void>

// DiscussionsService
create(authorId: string, dto: CreateDiscussionDto): Promise<Discussion>
list(communityId: string, sort: SortType, pagination): Promise<Discussion[]>
addComment(userId: string, discussionId: string, content: string): Promise<Comment>

// QaService
createQuestion(authorId: string, dto: CreateQuestionDto): Promise<Question>
answer(userId: string, questionId: string, content: string): Promise<Answer>
vote(userId: string, targetId: string, type: 'up'|'down'): Promise<void>
acceptAnswer(userId: string, questionId: string, answerId: string): Promise<void>
```

## 4. Security Implementation

### 4.1 JWT Token Flow

```
1. User registers → password hashed with Argon2
2. Login → verify Argon2 hash → generate JWT (RS256)
3. JWT payload: { sub: userId, email, role, trustLevel }
4. JWT expires in 15 minutes
5. Refresh token: UUID stored as SHA-256 hash in sessions table
6. Refresh token expires in 7 days
```

### 4.2 Role Hierarchy

```
super_admin > admin > moderator > member > guest
```

| Permission | super_admin | admin | moderator | member | guest |
|-----------|:-----------:|:-----:|:---------:|:------:|:-----:|
| Manage users | ✓ | ✓ | ✗ | ✗ | ✗ |
| Moderate content | ✓ | ✓ | ✓ | ✗ | ✗ |
| Create content | ✓ | ✓ | ✓ | ✓ | ✗ |
| Read public | ✓ | ✓ | ✓ | ✓ | ✓ |
| Delete any | ✓ | ✓ | ✗ | ✗ | ✗ |
| Ban users | ✓ | ✗ | ✗ | ✗ | ✗ |

### 4.3 Rate Limiting

- Global: 100 requests/minute per IP
- Login: 5 attempts per 15 minutes per user
- Applied via `@nestjs/throttler`

## 5. Seed Data

### Test Accounts

| Email | Role | Trust Level |
|-------|------|-------------|
| admin@hrshakti.com | admin | 5 |
| priya@hrshakti.com | moderator | 4 |
| vikram@hrshakti.com | member | 3 |
| ananya@hrshakti.com | member | 2 |
| mohan@hrshakti.com | member | 3 |

### Seed Content

- 3 Organizations (TechVision, GreenField, HealthPlus)
- 3 Communities (HR Best Practices, Talent Acquisition, HR Tech)
- 4 Discussions with comments
- 3 Q&A Questions with answers
- 3 Blog posts with comments
- 13 User skills
- 4 Connections and follows
- 2 Employer reviews

## 6. Error Handling

```typescript
// Global exception filter
@Catch()
class AllExceptionsFilter {
  catch(exception, host) {
    // Prisma errors → mapped to HTTP status
    // Validation errors → 400 with field details
    // Auth errors → 401/403
    // Not found → 404
    // Conflict → 409
    // Server errors → 500
  }
}

// Response interceptor
class TransformInterceptor {
  intercept(context, next) {
    // Wraps all responses in { statusCode, data, message }
  }
}
```
