# HRShakti — Auth, RBAC & Security Specification

> **Document Type**: Security Architecture Specification  
> **Version**: 1.0  
> **Date**: 2026-07-05  

---

## 1. Authentication Flow

### 1.1 Email + Password Registration

```
Client → POST /auth/register { email, password, firstName, lastName }
    → Server: Validate input
    → Server: Check if email exists → 409 if yes
    → Server: Hash password (Argon2id: memory=65536, iterations=3, parallelism=4)
    → Server: Create user (status: pending_verification, role: member, trust_level: 1)
    → Server: Generate email verification token (UUID, expires: 24h)
    → Server: Queue email (notification queue)
    → Server: Return 201 { userId, email, message: "Verification email sent" }

Client → User clicks email link → GET /auth/verify-email?token=xxx
    → Server: Validate token (exists, not expired, not used)
    → Server: Mark email as verified, set user.status = active
    → Server: Mark token as used
    → Server: Redirect to onboarding wizard
```

### 1.2 Email + Password Login

```
Client → POST /auth/login { email, password }
    → Server: Find user by email
    → Server: Check status (suspended → 403, pending_verification → 401 with message)
    → Server: Verify password with Argon2id
    → Server: Check failed login attempts → lockout after 5 (15 min cooldown)
    → Server: Generate JWT access token (15 min, payload: sub, email, role, trustLevel)
    → Server: Generate JWT refresh token (7 days)
    → Server: Hash refresh token, store in sessions table
    → Server: Set httpOnly cookie: refreshToken (Secure, SameSite=Strict, 7 day max-age)
    → Server: Return 200 { accessToken, expiresIn, user }
```

### 1.3 JWT Access Token

**Header**: `Authorization: Bearer <token>`

**Payload** (keep minimal for performance):
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "member",
  "trustLevel": 3,
  "iat": 1720123456,
  "exp": 1720124356,
  "iss": "hrshakti",
  "aud": "hrshakti-api"
}
```

**Signing**: RS256 (asymmetric). Private key on server only. Public key can be shared for verification (useful if microservices split later).

### 1.4 Refresh Token Flow

```
Client → POST /auth/refresh (refreshToken from httpOnly cookie)
    → Server: Extract refresh token from cookie
    → Server: Hash token, look up in sessions table
    → Server: Check: not expired, not revoked, user still active
    → Server: Invalidate old refresh token (rotation)
    → Server: Generate new access token + new refresh token
    → Server: Store new refresh token hash in sessions
    → Server: Set new httpOnly cookie
    → Server: Return 200 { accessToken, expiresIn }
```

**Token Rotation**: Every refresh invalidates the old refresh token and issues a new one. If an old refresh token is reused (indicates theft), invalidate ALL sessions for that user and force re-login.

### 1.5 OAuth 2.0 Social Login

**Flow (Google as example)**:
```
Client → GET /auth/google
    → Server: Redirect to Google OAuth consent URL
    → Google: User grants permission
    → Google → GET /auth/google/callback?code=xxx&state=yyy
    → Server: Validate state (CSRF protection)
    → Server: Exchange code for Google access token
    → Server: Fetch Google user profile (email, name, picture)
    → Server: Find user by email
        → If found: Login (issue tokens, skip onboarding)
        → If not found: Create account (status: pending_verification, populate name from Google)
            → Send verification email (even though Google verified email, we still verify our own)
            → Redirect to onboarding wizard
    → Server: Store/Update Google credential in user_credentials table
    → Server: Issue JWT tokens (same as email login)
    → Server: Redirect to app
```

**LinkedIn Special**: Request `r_liteprofile` and `r_emailaddress` scopes. LinkedIn returns email separately — need a second API call after auth.

**Microsoft Special**: Use `passport-azure-ad` with Azure AD v2.0 endpoint.

### 1.6 Logout

```
Client → POST /auth/logout
    → Server: Extract refresh token from cookie
    → Server: Mark session as revoked in database
    → Server: Clear refreshToken cookie (set max-age: 0)
    → Server: Return 200
    → Client: Clear access token from memory
```

---

## 2. Role-Based Access Control (RBAC)

### 2.1 Role Hierarchy

```
Super Admin (Level 5)
    │
    ├── Admin (Level 4)
    │
    └── Moderator (Level 3)
    
Member (Level 2)
    │
    └── Member Unverified (Level 1)

Guest (Level 0) — not authenticated
```

### 2.2 Guard Implementation (NestJS)

```typescript
// common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;
    
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Set by JwtAuthGuard
    
    if (requiredRoles.includes(user.role)) return true;
    
    // Admin inherits all Moderator permissions
    if (user.role === 'admin' && requiredRoles.includes('moderator')) return true;
    // Super Admin inherits all Admin and Moderator permissions
    if (user.role === 'super_admin') return true;
    
    throw new ForbiddenException('Insufficient permissions');
  }
}
```

```typescript
// Usage on controllers:
@Roles('admin', 'super_admin')
@Post('/users/:id/verify')
async verifyUser() { ... }
```

### 2.3 Fine-Grained Permission Guard

For operations that go beyond role checks (e.g., "edit own content"):

```typescript
// common/guards/permission.guard.ts
@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;
    
    // Check: is user editing their own resource?
    if (request.body?.authorId || params?.userId) {
      if (user.role === 'member' && request.body?.authorId !== user.id) {
        throw new ForbiddenException('Can only modify your own content');
      }
    }
    
    return true;
  }
}
```

### 2.4 Resource-Level Authorization Pattern

Every service method that modifies content MUST check ownership:

```typescript
// Example in DiscussionService
async updateDiscussion(userId: string, discussionId: string, dto: UpdateDiscussionDto) {
  const discussion = await this.repository.findOne(discussionId);
  
  // Ownership check
  if (discussion.authorId !== userId) {
    const user = await this.userService.findById(userId);
    if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'moderator') {
      throw new ForbiddenException('You can only edit your own discussions');
    }
  }
  
  // Proceed with update
  return this.repository.update(discussionId, dto);
}
```

---

## 3. Anonymous Identity System

### 3.1 How Anonymous Posting Works

When a user creates a discussion/comment with `isAnonymous: true`:

1. **Content table**: Store `anonymous_author_id` (the real user's UUID, encrypted)
2. **API response**: Return author info as:
   ```json
   {
     "author": {
       "id": "anonymous-uuid", // Fake UUID, not the real one
       "name": "Anonymous HR Professional",
       "avatarUrl": null,
       "isAnonymous": true,
       "credentialBadge": "SHRM-CP ✓", // Still shows verified credential
       "trustLevel": 3
     }
   }
   ```
3. **Database**: `author_id` in discussions/comments is NULL for anonymous posts. `anonymous_author_id` stores the encrypted real author ID.
4. **Encryption**: AES-256-GCM encryption. Key stored in environment variable. Only Super Admin can decrypt (requires explicit justification logged in audit_logs).
5. **Audit trail**: Anonymous actions are logged in audit_logs with encrypted user reference.

### 3.2 What Anonymous Hides vs Shows

| Element | Hidden | Shown |
|---|---|---|
| Name | ✅ | |
| Avatar | ✅ | |
| Username | ✅ | |
| Profile link | ✅ | |
| Company | ✅ | |
| Location | ✅ | |
| Verified credential badge | | ✅ |
| Trust level | | ✅ |
| "From Experience" reaction ability | | ✅ (if verified) |

### 3.3 Anonymous Restrictions

- Anonymous posting only available in Discussions and Q&A (not Blogs, not Events, not Knowledge Hub)
- Anonymous posts cannot be promoted to Knowledge Hub (must be attributed)
- Anonymous posts show a purple "Anonymous" badge to readers
- Admin can see the list of anonymous posts (without decryption) for moderation purposes

---

## 4. Security Hardening

### 4.1 CORS Configuration

```typescript
// main.ts
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['https://hrshakti.com', 'https://app.hrshakti.com'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Required for httpOnly cookies
  maxAge: 86400, // Pre-flight cache: 24 hours
});
```

### 4.2 Content Security Policy

```nginx
# NGINX config
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https://*.hrshakti.com https://*.cloudfront.net blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' wss://*.hrshakti.com https://api.hrshakti.com; frame-src https://www.youtube.com https://player.vimeo.com;" always;
```

### 4.3 Rate Limiting

| Endpoint Category | Rate Limit | Scope |
|---|---|---|
| /auth/login | 5 per minute | Per IP + per email |
| /auth/register | 3 per minute | Per IP |
| /auth/forgot-password | 3 per hour | Per IP + per email |
| /auth/refresh | 30 per minute | Per IP |
| /ai/* | 30 per hour, 200 per day | Per user |
| POST /discussions | 10 per hour | Per user |
| POST /questions | 10 per hour | Per user |
| POST /comments | 30 per hour | Per user |
| POST /reactions | 60 per minute | Per user |
| POST /messages | 60 per minute | Per user |
| GET /search | 60 per minute | Per user |
| GET /* (general) | 100 per second | Per IP |
| POST /reports | 10 per hour | Per user |

**Implementation**: Redis sliding window counter.

### 4.4 Input Validation & Sanitization

**Global ValidationPipe** (NestJS):
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,          // Strip unknown properties
  forbidNonWhitelisted: true, // Reject requests with unknown properties
  transform: true,          // Auto-transform types (string → number)
  transformOptions: { enableImplicitConversion: true },
}));
```

**Rich Text Sanitization** (for discussion bodies, blog content, comments):
- Use DOMPurify (server-side: `isomorphic-dompurify`)
- Allowed tags: p, br, strong, em, u, s, h1-h4, ul, ol, li, a, img, blockquote, code, pre, table, thead, tbody, tr, th, td, hr
- Allowed attributes: href (a), src (img), alt (img), class
- Strip all event handlers (onclick, etc.)
- Strip all script, style, iframe, form, input tags
- Sanitize on server-side even if client-side editor already sanitizes (never trust the client)

**File Upload Validation**:
- Check MIME type (not just extension)
- Max file size per type (see Tech Architecture)
- Scan for malware (ClamAV or S3 bucket scanning)
- Generate unique filenames (UUID-based, never user-provided)

### 4.5 SQL Injection Prevention
- Use Prisma ORM (parameterized queries by default)
- Never construct raw SQL queries with string concatenation
- If raw SQL is needed, use parameterized queries only:
  ```typescript
  // CORRECT:
  this.repository.query(`SELECT * FROM users WHERE email = $1`, [email]);
  // WRONG:
  this.repository.query(`SELECT * FROM users WHERE email = '${email}'`);
  ```

### 4.6 XSS Prevention
- All user-generated text rendered with React's built-in XSS protection (React auto-escapes)
- Rich text rendered via a sanitizing renderer (not dangerouslySetInnerHTML without sanitization)
- HTTP headers: `X-XSS-Protection: 1; mode=block`, `X-Content-Type-Options: nosniff`
- Cookie flags: `HttpOnly`, `Secure`, `SameSite=Strict`

### 4.7 CSRF Protection
- **SameSite=Strict cookie**: Primary CSRF protection for API calls
- **Double-submit cookie pattern** (for non-SSO flows):
  - Server sets a non-httpOnly cookie `csrf_token`
  - Client reads cookie value, sends it in `X-CSRF-Token` header
  - Server compares cookie value with header value

### 4.8 PII Detection & Protection

**PII Detection** (for anonymous content):
- Use regex patterns to detect: email addresses, phone numbers, social security numbers, company names (from a known list)
- When `isAnonymous: true`, scan the content before saving
- If PII detected: warn user "Your post contains potentially identifying information. Please review before submitting."
- For salary data: Encrypt `companyName` and `userId` at rest (AES-256)

**Salary Data Encryption**:
- `salary_submissions.company_name`: Encrypted
- `salary_submissions.user_id`: Not encrypted (needed for queries), but access restricted to Admin+
- `employer_reviews.author_id`: Encrypted
- Aggregated/benchmarked data is NOT encrypted (it's aggregate, not personal)

---

## 5. Audit Logging

### 5.1 What Gets Logged

Every action by Admin and Moderator roles is logged immutably:
- User management: verify, suspend, restore, role change, permanent delete
- Content management: feature blog, promote to KB, delete any content
- Moderation: remove content, lock discussion, warn user, close question
- Platform: settings change, announcement sent, AI configuration change

### 5.2 Audit Log Format

```typescript
// Written to audit_logs table (APPEND-ONLY, no updates, no deletes)
{
  id: "uuid",
  actor_id: "admin-user-uuid",
  actor_role: "admin",
  action: "user.suspend",
  target_type: "user",
  target_id: "suspended-user-uuid",
  details: {
    before: { status: "active" },
    after: { status: "suspended", suspensionReason: "...", suspendedAt: "..." },
    reason: "Repeated community guideline violations"
  },
  ip_address: "203.0.113.42",
  user_agent: "Mozilla/5.0...",
  created_at: "2026-07-05T10:30:00Z"
}
```

### 5.3 Audit Log Access

- **Super Admin**: Full access to all audit logs with search/filter
- **Admin**: Can view their own actions + moderation queue actions (limited)
- **Moderator**: Cannot view audit logs
- **Members**: Cannot view audit logs

---

## 6. Data Retention & Privacy

### 6.1 GDPR Compliance

- **Right to Access**: Users can export all their data (Settings → Export My Data)
- **Right to Erasure**: Users can request account deletion. Soft-delete for 30 days, then permanent deletion of personal data (keep anonymized aggregate data)
- **Right to Rectification**: Users can edit all their own data
- **Data Portability**: Export in JSON format

### 6.2 Retention Periods

| Data Type | Retention | After Retention |
|---|---|---|
| User account | Until deletion request + 30 days | Permanent deletion |
| User content (discussions, answers, blogs) | Until user deletion | Anonymize (remove author reference, keep content) |
| Messages | 1 year after last activity | Permanent deletion |
| Audit logs | 3 years | Archive to cold storage |
| Analytics data | 2 years | Aggregation only |
| Salary submissions | Until account deletion | Anonymize (keep aggregate data) |
| Anonymous content | Same as regular content | Cannot be de-anonymized after 90 days |
| Sessions | 7 days (auto-expire) | Auto-deleted |
| Refresh tokens | 7 days (auto-expire) | Auto-deleted |

---

*This document should be read alongside the Technical Architecture (03) and API Contracts (05) for complete security implementation guidance.*