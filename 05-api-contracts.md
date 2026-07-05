# HRShakti — API Contracts

> **Document Type**: REST API Specification  
> **Version**: 1.0  
> **Date**: 2026-07-05  
> **Base URL**: `https://api.hrshakti.com/api/v1`  
> **Protocol**: HTTPS only  

---

## Global Conventions

### Response Envelope
All successful responses are wrapped:
```json
{
  "data": "<payload — object, array, or null>",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "message": "Optional human-readable message"
}
```
`meta` is only included for paginated endpoints.

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    { "field": "email", "message": "email must be a valid email address" }
  ]
}
```

### Authentication
- Header: `Authorization: Bearer <jwt_access_token>`
- Unauthenticated: 401
- Unauthorized (wrong role): 403

### Pagination
- Query: `?page=1&limit=20` (default: 20, max: 100)

### Sorting
- Query: `?sort=createdAt:desc` (field:asc|desc)

### Filtering
- Query: `?filter[status]=published&filter[category]=compliance`
- Operators: `eq` (default), `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `ilike`, `in`

---

## 1. Authentication Module

### POST /auth/register
**Auth**: None
```json
// Request
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "firstName": "Priya",
  "lastName": "Sharma"
}
// Response 201
{
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "message": "Verification email sent. Please check your inbox."
  }
}
```

### POST /auth/login
**Auth**: None
```json
// Request
{ "email": "user@example.com", "password": "SecureP@ss123" }
// Response 200
{
  "data": {
    "accessToken": "jwt_string",
    "expiresIn": 900,
    "user": { "id": "uuid", "email": "...", "firstName": "...", "role": "member", "trustLevel": 1 }
  }
}
```
Sets `httpOnly` cookie for refresh token.

### POST /auth/logout
**Auth**: Member+
Invalidates current session's refresh token.
```json
// Response 200
{ "data": null, "message": "Logged out successfully" }
```

### POST /auth/refresh
**Auth**: Refresh token cookie
```json
// Response 200
{ "data": { "accessToken": "new_jwt", "expiresIn": 900 } }
```

### POST /auth/forgot-password
**Auth**: None
```json
// Request
{ "email": "user@example.com" }
// Response 200
{ "data": null, "message": "If an account exists, a reset link has been sent." }
```

### POST /auth/reset-password
**Auth**: None (requires token from email)
```json
// Request
{ "token": "email_token", "newPassword": "NewSecureP@ss456" }
// Response 200
{ "data": null, "message": "Password reset successfully" }
```

### POST /auth/verify-email
**Auth**: None (requires token from email)
```json
// Request
{ "token": "email_verification_token" }
// Response 200
{ "data": null, "message": "Email verified successfully" }
```

### GET /auth/google
**Auth**: None
Redirects to Google OAuth consent screen.

### GET /auth/google/callback
**Auth**: None
Handles OAuth callback. Creates account or logs in existing user.

### GET /auth/linkedin
### GET /auth/linkedin/callback
### GET /auth/microsoft
### GET /auth/microsoft/callback
Same pattern as Google.

---

## 2. Users Module

### GET /users/me
**Auth**: Member+
Returns the current authenticated user's full profile.

### PATCH /users/me
**Auth**: Member+
```json
// Request (all fields optional)
{
  "firstName": "Priya",
  "lastName": "Sharma",
  "headline": "Senior HR Manager at Google | SHRM-SCP",
  "about": "Experienced HR professional...",
  "locationCity": "Bangalore",
  "locationCountry": "IN",
  "locationState": "Karnataka",
  "timezone": "Asia/Kolkata",
  "website": "https://priyasharma.com",
  "linkedinUrl": "https://linkedin.com/in/priyasharma",
  "twitterUrl": "https://twitter.com/priyahr"
}
```

### POST /users/me/avatar
**Auth**: Member+
Content-Type: `multipart/form-data`
Field: `avatar` (image, max 5MB)
Returns the new avatar URL.

### GET /users/:username
**Auth**: None (public profile)
Returns public profile: name, headline, about, experience, education, certifications, skills, specialties, activity timeline, reputation.

### GET /users
**Auth**: Admin+
Query: `?filter[role]=member&filter[status]=active&sort=createdAt:desc&page=1&limit=20`

### PATCH /users/:id/role
**Auth**: Admin+
```json
{ "role": "moderator", "reason": "Active community contributor" }
```

### PATCH /users/:id/verify
**Auth**: Admin+
Verify a user's professional credentials.
```json
{ "verified": true, "reason": "SHRM-CP certificate verified" }
```

### POST /users/:id/suspend
**Auth**: Admin+
```json
{ "reason": "Violation of community guidelines", "durationDays": 7 }
```

### POST /users/:id/restore
**Auth**: Admin+
Restore a suspended user.

### DELETE /users/:id
**Auth**: Super Admin only
Permanently delete a user (with audit log).

### GET /users/:id/experiences
### POST /users/me/experiences
### PATCH /users/me/experiences/:id
### DELETE /users/me/experiences/:id

Same CRUD pattern for: education, certifications, skills, specialties, languages.

### GET /users/me/preferences
### PATCH /users/me/preferences
```json
// Notification preferences
{
  "email": {
    "digest": "weekly",
    "immediate": ["connection_request", "event_reminder", "compliance_alert"],
    "quietHoursStart": "22:00",
    "quietHoursEnd": "08:00"
  },
  "push": {
    "enabled": true,
    "types": ["message", "mention", "connection_request"]
  }
}
```

---

## 3. Network Module

### POST /network/connections/request
**Auth**: Member+
```json
{ "addresseeId": "uuid", "message": "Would love to connect, fellow TA specialist!" }
```

### POST /network/connections/:requestId/accept
### POST /network/connections/:requestId/reject

### GET /network/connections
**Auth**: Member+
Query: `?status=accepted&page=1&limit=20`
Returns list of accepted connections with profile summaries.

### GET /network/connections/pending
Returns pending received requests.

### GET /network/connections/sent
Returns pending sent requests.

### DELETE /network/connections/:userId
Remove a connection (soft).

### POST /network/follow/:userId
### DELETE /network/follow/:userId

### GET /network/followers
### GET /network/following

### GET /network/suggestions
**Auth**: Member+
Returns algorithmically suggested connections.

### POST /network/block/:userId
### DELETE /network/block/:userId

---

## 4. Organizations Module

### GET /organizations
**Auth**: None (public)
Query: `?filter[industry]=technology&filter[companySize]=enterprise&sort=memberCount:desc`

### GET /organizations/:slug
**Auth**: None (public)

### POST /organizations
**Auth**: Admin+
```json
{
  "name": "Google",
  "description": "...",
  "industry": "Technology",
  "companySize": "mega_5001_plus",
  "headquartersCity": "Mountain View",
  "headquartersCountry": "US",
  "website": "https://google.com"
}
```

### PATCH /organizations/:id
**Auth**: Admin+ or claimed user

### POST /organizations/:id/claim
**Auth**: Member+
Claim an organization profile as an HR team member.

### POST /organizations/:id/verify
**Auth**: Admin+

### GET /organizations/:id/members
### GET /organizations/:id/events

---

## 5. Communities Module

### GET /communities
**Auth**: Member+ (list browsable)
Query: `?filter[category]=talent_acquisition&filter[type]=public&sort=memberCount:desc`

### GET /communities/:slug
**Auth**: None (public) or Member+ (private)

### POST /communities
**Auth**: Member (Trust Level 2+)
```json
{
  "name": "HR Analytics & People Science",
  "description": "Discuss HR analytics, people science, data-driven HR...",
  "category": "HR Analytics & People Science",
  "type": "public",
  "rules": "1. Be respectful 2. Cite sources 3. No self-promotion"
}
```

### PATCH /communities/:id
**Auth**: Community admin/moderator or Admin

### DELETE /communities/:id
**Auth**: Own community (Member), any (Admin)

### POST /communities/:id/join
### POST /communities/:id/leave

### GET /communities/:id/members
Query: `?filter[role]=moderator&sort=joinedAt:desc`

### PATCH /communities/:id/members/:userId/role
**Auth**: Community admin or Admin
```json
{ "role": "moderator" }
```

### GET /communities/:id/announcements
### POST /communities/:id/announcements
**Auth**: Community moderator+

### PATCH /communities/:id/announcements/:id/pin

### GET /communities/:id/stats
```json
{
  "data": {
    "memberCount": 1500,
    "postCount": 5000,
    "postsToday": 12,
    "topContributors": [
      { "userId": "uuid", "name": "...", "postCount": 45 },
      { "userId": "uuid", "name": "...", "postCount": 32 }
    ]
  }
}
```

---

## 6. Discussions Module

### GET /discussions
**Auth**: Member+ for create; None for read (public discussions)
Query: `?sort=trending&filter[community]=slug&filter[flair]=question&filter[tags]=remote-work,compliance&page=1&limit=20`

### POST /discussions
**Auth**: Member+
```json
{
  "title": "How are you handling remote work compliance across multiple US states?",
  "body": "We have employees in 15 states and tracking compliance is becoming a nightmare...",
  "postType": "text",
  "flair": "discussion",
  "tags": ["remote-work", "compliance", "multi-state"],
  "communitySlug": "hr-compliance",
  "isAnonymous": false
}
```

### GET /discussions/:id
**Auth**: None (public) or Member+

### PATCH /discussions/:id
**Auth**: Own post (Member) or Moderator+

### DELETE /discussions/:id
**Auth**: Own post (Member) or Moderator+ or Admin

### POST /discussions/:id/reactions
**Auth**: Member+
```json
{ "reactionType": "helpful" }
// reactionType: helpful | insightful | from_experience | inaccurate
```

### DELETE /discussions/:id/reactions
**Auth**: Member+
```json
{ "reactionType": "helpful" }
```

### POST /discussions/:id/bookmark
### DELETE /discussions/:id/bookmark

### GET /discussions/:id/comments
Returns nested comments (tree structure).
Query: `?sort=best&page=1&limit=50`
Response includes comments with `children` array for nesting.

### POST /discussions/:id/comments
**Auth**: Member+
```json
{
  "body": "We use a compliance management platform that tracks state-by-state requirements...",
  "parentId": "uuid_or_null",
  "isAnonymous": false
}
```
`parentId` is null for top-level comments, or a comment UUID for replies.

### PATCH /discussions/:id/comments/:commentId
### DELETE /discussions/:id/comments/:commentId

### POST /discussions/:id/comments/:commentId/reactions
Same multi-signal reaction as discussions.

### POST /discussions/:id/pin
**Auth**: Moderator+

### POST /discussions/:id/lock
**Auth**: Moderator+

### POST /discussions/:id/promote-to-kb
**Auth**: Moderator+
Promotes a high-quality discussion to the Knowledge Hub.

### POST /discussions/:id/report
**Auth**: Member+
```json
{ "reason": "inaccurate", "description": "The legal advice in this post is incorrect for California" }
```

### POST /discussions (poll type)
```json
{
  "title": "What's your company's return-to-office policy?",
  "postType": "poll",
  "flair": "discussion",
  "communitySlug": "hr-compliance",
  "poll": {
    "options": [
      "Fully remote",
      "Hybrid (2-3 days office)",
      "Full in-office",
      "Flexible / Manager discretion"
    ],
    "endsAt": "2026-08-05T00:00:00Z",
    "showResultsBeforeEnd": true
  }
}
```

### POST /discussions/:id/polls/:optionId/vote
**Auth**: Member+

---

## 7. Questions & Answers Module

### GET /questions
**Auth**: None (read), Member+ (create)
Query: `?sort=trending&filter[category]=compliance&filter[hasBounty]=true&filter[tags]=fmla&page=1&limit=20`

### POST /questions
**Auth**: Member+
```json
{
  "title": "Can we require employees to use PTO during company holidays in California?",
  "body": "Our company wants to close between Christmas and New Year...",
  "tags": ["pto", "california", "holidays", "compliance"],
  "category": "compliance",
  "urgency": "high",
  "isAnonymous": false
}
```

### GET /questions/:id
### PATCH /questions/:id
### DELETE /questions/:id

### POST /questions/:id/bounty
**Auth**: Member (Question owner or Trust Level 3+)
```json
{ "amount": 100 }
```
Deducts from user's reputation score.

### POST /questions/:id/answers
**Auth**: Member+
```json
{
  "body": "In California, you cannot require employees to use PTO during company-designated holidays..."
}
```

### PATCH /questions/:id/answers/:answerId
**Auth**: Answer author or Trust Level 3+ (suggest edit)

### DELETE /questions/:id/answers/:answerId
**Auth**: Answer author or Moderator+ or Admin

### POST /questions/:id/answers/:answerId/accept
**Auth**: Question owner only
Marks the answer as accepted (green checkmark).

### POST /questions/:id/answers/:answerId/reactions
### GET /questions/:id/answers/:answerId/comments
### POST /questions/:id/answers/:answerId/comments

### POST /questions/:id/answers/:answerId/edits
**Auth**: Trust Level 3+
```json
{ "body": "Updated answer with new 2026 regulation info", "summary": "Added 2026 CA PTO regulation update" }
```

### GET /questions/similar
**Auth**: Member+
Query: `?title=partial+question+title`
Returns similar existing questions to prevent duplicates.

### GET /questions/tags
Returns all available Q&A tags with usage counts.

### GET /questions/review-queue
**Auth**: Trust Level 5+ or Moderator+
Query: `?queue=triage|first_posts|late_answers|suggested_edits`

### POST /questions/review-queue/:itemId/action
**Auth**: Trust Level 5+ or Moderator+
```json
{ "action": "approve|reject|close_as_duplicate|edit", "reason": "..." }
```

---

## 8. Blogs Module

### GET /blogs
**Auth**: None (published), Member+ (all states)
Query: `?filter[category]=compensation&sort=publishedAt:desc&filter[workflowState]=published`

### GET /blogs/:slug
**Auth**: None (published blogs)

### POST /blogs
**Auth**: Member+
```json
{
  "title": "Building a Performance Review System That Actually Works",
  "body": "<p>Full rich text content...</p>",
  "summary": "A practical guide to designing performance reviews...",
  "category": "Performance Management",
  "tags": ["performance-review", "feedback", "hr-best-practice"]
}
```
Creates in `draft` state.

### POST /blogs/:id/submit-review
**Auth**: Blog author
Transitions: draft → peer_review

### POST /blogs/:id/submit-editorial
**Auth**: Member+ (peer review complete)
Transitions: peer_review → editorial_review

### POST /blogs/:id/publish
**Auth**: Admin
Transitions: editorial_review → published. Sets `publishedAt`.

### POST /blogs/:id/feature
**Auth**: Admin
Transitions: published → featured.

### POST /blogs/:id/archive
**Auth**: Admin or Author

### PATCH /blogs/:id
### DELETE /blogs/:id

### POST /blogs/:id/upload-image
**Auth**: Blog author
Upload image for the rich text editor. Returns S3 URL.

### GET /blogs/:id/peer-reviews
### POST /blogs/:id/peer-reviews
**Auth**: Member+
```json
{
  "feedback": "Great article! Consider adding more examples from non-tech industries...",
  "qualityScore": 4,
  "expertiseRating": "confirms_expertise"
}
```

### GET /blogs/:id/comments
### POST /blogs/:id/comments
### POST /blogs/:id/reactions

### GET /blog-series
### POST /blog-series
**Auth**: Member+

---

## 9. Knowledge Hub Module

### GET /knowledge
**Auth**: None (published), Member+ (all)
Query: `?filter[resourceType]=template&filter[category]=talent_acquisition&sort=helpfulCount:desc`

### GET /knowledge/:slug
**Auth**: None (published)

### POST /knowledge
**Auth**: Admin
```json
{
  "title": "Performance Review Meeting Template",
  "body": "<p>Template content...</p>",
  "summary": "A structured template for conducting performance review meetings",
  "resourceType": "template",
  "category": "Performance Management",
  "tags": ["performance-review", "template", "meeting"],
  "jurisdiction": "US",
  "nextReviewAt": "2027-01-01"
}
```

### PATCH /knowledge/:id
**Auth**: Admin
Creates a new version (version number increments).

### GET /knowledge/:id/versions
### GET /knowledge/:id/attachments
### POST /knowledge/:id/attachments

### POST /knowledge/:id/reactions
### GET /knowledge/:id/download-count
Increments download count.

---

## 10. Events Module

### GET /events
**Auth**: None (read), Member+ (register)
Query: `?filter[eventType]=webinar&filter[format]=virtual&sort=startAt:asc`

### GET /events/:slug
### POST /events
**Auth**: Member+ or Admin
```json
{
  "title": "Mastering HR Analytics: A Practical Workshop",
  "description": "Learn to build HR dashboards...",
  "eventType": "workshop",
  "format": "virtual",
  "startAt": "2026-08-15T10:00:00Z",
  "endAt": "2026-08-15T14:00:00Z",
  "timezone": "America/New_York",
  "capacity": 500,
  "communitySlug": "hr-analytics",
  "speakers": [
    { "userId": "uuid", "role": "speaker", "bio": "..." }
  ]
}
```

### PATCH /events/:id
### DELETE /events/:id

### POST /events/:id/register
**Auth**: Member+
### DELETE /events/:id/register
### GET /events/:id/registrations
**Auth**: Event organizer or Admin

### POST /events/:id/attend
**Auth**: Member+ (self or Moderator marking attendance)

### GET /events/:id/certificate
**Auth**: Registered attendee
Returns certificate PDF URL if attended.

### GET /events/upcoming
### GET /events/my-registrations

### POST /event-series
### GET /event-series/:id

---

## 11. Learning Module

### GET /learning/courses
**Auth**: None (catalog), Member+ (enroll)
Query: `?filter[category]=talent_acquisition&filter[level]=beginner&sort=enrollmentCount:desc`

### GET /learning/courses/:slug
### POST /learning/courses
**Auth**: Admin

### PATCH /learning/courses/:id
### DELETE /learning/courses/:id

### POST /learning/courses/:id/enroll
**Auth**: Member+

### GET /learning/courses/:id/modules
### GET /learning/courses/:id/modules/:moduleId
### POST /learning/courses/:id/modules/:moduleId/complete
**Auth**: Enrolled member
Marks module as completed, updates enrollment progress.

### POST /learning/courses/:id/modules/:moduleId/assessment
**Auth**: Enrolled member
```json
{ "answers": [{ "questionId": "uuid", "selectedOption": "uuid" }] }
```
Returns: score, pass/fail, correct answers with explanations.

### GET /learning/my-courses
**Auth**: Member+
Returns enrolled courses with progress.

### GET /learning/paths
### GET /learning/paths/:id
### POST /learning/paths/:id/enroll

### GET /learning/study-groups
### POST /learning/study-groups
```json
{
  "name": "SHRM-CP Study Group - August 2026",
  "description": "Preparing for SHRM-CP exam together",
  "purpose": "cert_prep",
  "maxMembers": 10,
  "courseId": "uuid"
}
```

### POST /learning/study-groups/:id/join
### GET /learning/study-groups/:id

### GET /learning/credits
**Auth**: Member+
Returns recertification credit dashboard:
```json
{
  "data": {
    "shrmPdc": { "earned": 25, "required": 60, "deadline": "2028-06-15", "activities": [...] },
    "hrci": { "earned": 10, "required": 60, "deadline": "2028-06-15", "activities": [...] }
  }
}
```

### POST /learning/credits/manual
**Auth**: Member+
Submit external activity for credit (requires admin verification).

### GET /learning/credits/export
**Auth**: Member+
Returns downloadable credit report for SHRM/HRCI submission.

---

## 12. AI Module

### POST /ai/conversations
**Auth**: Member+
```json
{ "capability": "policy_explanation", "title": "Optional title" }
// capability: policy_explanation | terminology | interview_gen | jd_draft | review_suggestion | email_draft | doc_summary | resume_feedback | research | compliance | meeting_agenda | onboarding | exit_analysis | survey_design | policy_comparison
```

### GET /ai/conversations
**Auth**: Member+
List user's AI conversations.

### GET /ai/conversations/:id
**Auth**: Member+

### POST /ai/conversations/:id/messages
**Auth**: Member+
```json
{ "content": "What are the legal requirements for PTO in California?" }
```
**Response**: Server-Sent Events (SSE) stream.
```
Content-Type: text/event-stream
data: {"chunk": "In California, ", "done": false}
data: {"chunk": "the law requires...", "done": false}
data: {"chunk": "", "done": true, "sources": [...], "tokensUsed": 450}
```

### DELETE /ai/conversations/:id
**Auth**: Member+

### POST /ai/conversations/:id/messages/:messageId/rate
**Auth**: Member+
```json
{ "rating": "helpful" } // helpful | not_helpful | inaccurate
```

### GET /ai/usage
**Auth**: Member+
Returns daily/monthly usage counts and limits.

---

## 13. Search Module

### GET /search
**Auth**: None (basic), Member+ (full)
```json
// Query params
{
  "q": "remote work policy template",
  "types": ["discussions", "questions", "blogs", "knowledge"],
  "filter": {
    "tags": ["remote-work"],
    "category": "compliance",
    "dateRange": { "from": "2026-01-01" }
  },
  "page": 1,
  "limit": 20,
  "sort": "relevance"
}
```
Response: `{ data: { results: [{ type, id, title, summary, score, highlights }] } }`

### GET /search/suggestions
**Auth**: Member+
Query: `?q=remote`
Returns: `["remote work", "remote hiring", "remote onboarding", "remote compliance"]`

### GET /search/related
Query: `?q=fmla`
Returns: "People also asked" suggestions.

---

## 14. Notifications Module

### GET /notifications
**Auth**: Member+
Query: `?filter[type]=comment&filter[isRead]=false&sort=createdAt:desc&page=1&limit=20`

### GET /notifications/unread-count
**Auth**: Member+
```json
{ "data": { "total": 15, "byType": { "comment": 5, "connection": 3, "system": 7 } } }
```

### POST /notifications/:id/read
### POST /notifications/read-all
### GET /notifications/preferences
### PATCH /notifications/preferences

---

## 15. Messaging Module

### GET /messages/conversations
**Auth**: Member+
Returns list of conversations with last message and unread count.

### POST /messages/conversations
**Auth**: Member+
```json
{ "participantId": "uuid" }
```
Creates or returns existing 1:1 conversation.

### GET /messages/conversations/:id/messages
**Auth**: Conversation participant
Query: `?page=1&limit=50&before=message_uuid` (cursor-based pagination)

### POST /messages/conversations/:id/messages
**Auth**: Conversation participant
```json
{ "body": "Hi! I saw your question about..." }
```
Also sends via WebSocket to the recipient.

### POST /messages/conversations/:id/messages/:messageId/read
### DELETE /messages/conversations/:id/messages/:messageId
Deletes message for the current user only (`deleted_for` field).

### POST /messages/conversations/:id/read

---

## 16. Mentorship Module

### GET /mentorship/profile
**Auth**: Member+
Returns own mentorship profile (or null if not set up).

### POST /mentorship/profile
**Auth**: Member+
```json
{
  "isAvailableAsMentor": true,
  "mentoringSpecialties": ["talent_acquisition", "hr_leadership"],
  "mentoringStyle": "Collaborative and question-driven",
  "availabilityDescription": "Available Tuesday/Thursday evenings IST",
  "maxMentees": 3
}
```

### GET /mentorship/suggestions
**Auth**: Member+
Returns mentor matching suggestions based on profile, goals, and availability.

### POST /mentorship/requests
**Auth**: Member+
```json
{
  "mentorId": "uuid",
  "goals": "I want to transition from HR Generalist to TA Specialist within 2 years",
  "expectedDurationMonths": 6
}
```

### POST /mentorship/requests/:id/accept
### POST /mentorship/requests/:id/reject

### GET /mentorship/requests
**Auth**: Member+
Query: `?filter[status]=active&filter[role]=mentee`

### GET /mentorship/requests/:id
### GET /mentorship/requests/:id/goals
### POST /mentorship/requests/:id/goals
### PATCH /mentorship/requests/:id/goals/:goalId

### GET /mentorship/requests/:id/sessions
### POST /mentorship/requests/:id/sessions
### PATCH /mentorship/requests/:id/sessions/:sessionId
```json
{ "notes": "Discussed career transition strategy...", "menteeFeedback": "Very helpful session", "menteeRating": 5 }
```

### GET /mentorship/requests/:id/complete
End the mentorship relationship.

---

## 17. Reviews & Benchmarking Module

### GET /reviews/employers
**Auth**: Member+
Query: `?filter[organization]=google&filter[industry]=technology&sort=createdAt:desc`

### POST /reviews/employers
**Auth**: Member (verified)
```json
{
  "organizationId": "uuid",
  "overallRating": 4,
  "leadershipSupportRating": 3,
  "budgetResourcesRating": 2,
  "techStackRating": 5,
  "workloadRating": 2,
  "hrInfluenceRating": 3,
  "teamCultureRating": 4,
  "careerGrowthRating": 3,
  "pros": "Great tech stack, supportive team culture",
  "cons": "HR budget is tight, workload can be overwhelming during peak",
  "advice": "Invest more in HR technology and headcount",
  "roleTitle": "HR Manager",
  "tenure": "2-3 years",
  "companySizeAtTime": "enterprise",
  "industry": "Technology",
  "location": "Mountain View, CA"
}
```
Posted anonymously (author_id encrypted).

### GET /reviews/employers/:id
### GET /reviews/employers/:id/comments
### POST /reviews/employers/:id/comments

### GET /reviews/vendors
**Auth**: None (read), Member+ (review)
Query: `?filter[category]=ats&filter[companySizeServed]=enterprise&sort=averageRating:desc`

### GET /reviews/vendors/:slug
### POST /reviews/vendors/:id/reviews
**Auth**: Member+
```json
{
  "easeOfUseRating": 4,
  "featuresRating": 5,
  "valueRating": 3,
  "supportRating": 4,
  "integrationRating": 4,
  "title": "Solid ATS with great customization",
  "body": "We've been using Greenhouse for 3 years...",
  "pros": "Excellent customization, great API, strong reporting",
  "cons": "Pricing can be high for smaller teams",
  "companySize": "enterprise",
  "industry": "Technology",
  "yearsUsing": "2-3 years"
}
```

### POST /reviews/salary
**Auth**: Member+
Submit salary data (with verification document).

### GET /reviews/salary/benchmark
**Auth**: Member+
Query: `?jobTitle=HR+Manager&country=US&industry=technology&companySize=enterprise&yearsExperience=8`
Returns aggregated benchmarking data with percentile ranges.

### POST /reviews/salary/:id/verify
**Auth**: Admin+

---

## 18. Career Module

### GET /career/paths
**Auth**: Member+
Returns all available career paths with level details.

### GET /career/paths/:id
### POST /career/assessments
**Auth**: Member+
```json
{
  "careerPathId": "uuid",
  "selfAssessedLevel": "HR Manager"
}
```
Returns: skill gaps, recommended actions (courses, certs, experiences).

### GET /career/assessments
Returns user's past assessments.

---

## 19. News & Compliance Module

### GET /news
**Auth**: None (read)
Query: `?filter[category]=regulation&filter[jurisdictions]=US-CA&sort=publishedAt:desc`

### GET /news/:slug
### GET /news/:id/comments
### POST /news/:id/comments

### GET /compliance/alerts
**Auth**: Member+
Query: `?filter[jurisdiction]=US-CA&filter[category]=labor_law&filter[severity]=critical&sort=createdAt:desc`

### GET /compliance/alerts/my-jurisdictions
**Auth**: Member+
Returns alerts based on user's profile location.

---

## 20. Reputation Module

### GET /reputation/me
**Auth**: Member+
```json
{
  "data": {
    "trustLevel": 3,
    "reputationScore": 450,
    "levelName": "Contributor",
    "nextLevel": { "name": "Trusted", "requirements": { "helpfulAnswers": 50, "promotedToKb": 10 } },
    "badges": ["problem_solver", "certified", "streak_30"],
    "stats": {
      "totalAnswers": 45,
      "acceptedAnswers": 12,
      "blogsPublished": 3,
      "coursesCompleted": 5,
      "mentorshipsCompleted": 1
    },
    "recentEvents": [
      { "type": "answer_helpful", "points": 4, "description": "Your answer received 'Insightful' reaction", "createdAt": "..." }
    ]
  }
}
```

### GET /reputation/leaderboard
**Auth**: None
Query: `?filter[specialty]=talent_acquisition&period=monthly&page=1&limit=20`

### GET /reputation/badges
Returns all available badge types with earn criteria.

---

## 21. Moderation Module

### GET /moderation/reports
**Auth**: Moderator+
Query: `?filter[status]=pending&filter[targetType]=discussion&sort=createdAt:desc`

### GET /moderation/reports/:id
### POST /moderation/reports/:id/action
**Auth**: Moderator+
```json
{ "action": "remove_content", "reason": "Violates community guidelines: inaccurate legal advice", "warnUser": true }
```

### POST /moderation/users/:userId/warn
**Auth**: Moderator+
```json
{ "reason": "Repeated posting of unverified legal claims" }
```

### POST /moderation/users/:userId/suspend
**Auth**: Admin+
```json
{ "reason": "Multiple guideline violations", "durationDays": 30 }

### GET /moderation/audit-logs
**Auth**: Admin (limited), Super Admin (full)
Query: `?filter[actorId]=uuid&filter[action]=user.suspend&sort=createdAt:desc`

---

## 22. Analytics Module (Admin)

### GET /analytics/overview
**Auth**: Admin+
```json
{
  "data": {
    "totalMembers": 50000,
    "activeMembers": 12000,
    "dailyActiveUsers": 3500,
    "monthlyActiveUsers": 18000,
    "newMembersToday": 45,
    "newMembersThisWeek": 280,
    "newMembersThisMonth": 1200,
    "communities": 85,
    "publishedBlogs": 450,
    "openQuestions": 120,
    "upcomingEvents": 12,
    "courseEnrollments": 850,
    "certificatesIssued": 230,
    "aiQueriesToday": 1200,
    "messagesToday": 5000,
    "revenue": { "mrr": 45000, "churnRate": 2.1 }
  }
}
```

### GET /analytics/members
**Auth**: Admin+
Query: `?period=6m` (1d, 1w, 1m, 3m, 6m, 1y)

### GET /analytics/content
### GET /analytics/engagement
### GET /analytics/revenue
### GET /analytics/learning
### GET /analytics/ai-usage

### GET /analytics/export
**Auth**: Admin+
Query: `?report=members&format=csv&period=1m`
Returns downloadable CSV/PDF report file.

---

## WebSocket Events

### Client → Server Events
| Event | Payload | Auth |
|---|---|---|
| `join:room` | `{ room: "notifications:{userId}" }` | JWT |
| `leave:room` | `{ room: "notifications:{userId}" }` | JWT |
| `message:typing` | `{ conversationId, isTyping }` | JWT |

### Server → Client Events
| Event | Payload | Description |
|---|---|---|
| `notification:new` | Notification object | New notification |
| `message:new` | Message object | New chat message |
| `message:typing` | `{ conversationId, userId, isTyping }` | Typing indicator |
| `discussion:comment:new` | Comment object | New comment on followed discussion |
| `discussion:reaction:new` | Reaction object | New reaction on your content |
| `user:online` | `{ userId }` | User came online |
| `user:offline` | `{ userId }` | User went offline |

---

*This API specification covers all modules. The LLM should use this as the contract to generate NestJS controllers, DTOs, and services.*