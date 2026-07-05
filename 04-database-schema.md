# HRShakti — Database Schema (ER Descriptions)

> **Document Type**: Database Schema Specification  
> **Version**: 1.0  
> **Date**: 2026-07-05  
> **Database**: PostgreSQL 16+  
> **ORM**: Prisma (recommended) or TypeORM  
> **Note**: This document describes entities, columns, types, and relationships. The LLM should generate the actual ORM schema/migrations.  

---

## Schema Overview

**Total Entities: ~65 tables** across 12 domains.

**Design Principles**:
- UUIDs as primary keys (not auto-increment integers) — better for distributed systems
- `created_at` and `updated_at` on every table (useful for caching, debugging, audit)
- Soft deletes: `deleted_at` timestamp (nullable) — never hard-delete user content
- JSONB columns for flexible metadata (tags, settings, preferences)
- Proper foreign keys with CASCADE/SET NULL rules
- Indexes on all frequently queried columns
- Partitioning for high-volume tables (notifications, reactions, audit_logs)

---

## 1. Users & Authentication Domain

### 1.1 users

The core user account table.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, default gen_random_uuid() | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL, LOWERCASE | Login email |
| password_hash | VARCHAR(255) | NULLABLE | Argon2id hash (null for social-only accounts) |
| first_name | VARCHAR(100) | NOT NULL | |
| last_name | VARCHAR(100) | NOT NULL | |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Public profile URL slug |
| avatar_url | VARCHAR(500) | NULLABLE | S3 URL to profile photo |
| headline | VARCHAR(200) | NULLABLE | Professional headline (e.g., "Senior HR Manager at Google") |
| about | TEXT | NULLABLE | Professional summary (max 2000 chars) |
| location_city | VARCHAR(100) | NULLABLE | |
| location_country | VARCHAR(100) | NULLABLE | ISO country code |
| location_state | VARCHAR(100) | NULLABLE | State/province for compliance alerts |
| timezone | VARCHAR(50) | NOT NULL, DEFAULT 'UTC' | IANA timezone |
| website | VARCHAR(500) | NULLABLE | |
| linkedin_url | VARCHAR(500) | NULLABLE | |
| twitter_url | VARCHAR(500) | NULLABLE | |
| profile_completion_pct | SMALLINT | NOT NULL, DEFAULT 0 | 0-100 |
| is_verified | BOOLEAN | NOT NULL, DEFAULT false | Email verified |
| is_professional_verified | BOOLEAN | NOT NULL, DEFAULT false | HR credential verified |
| role | ENUM | NOT NULL, DEFAULT 'member' | super_admin, admin, moderator, member |
| trust_level | SMALLINT | NOT NULL, DEFAULT 1 | 1-7 (see Reputation module) |
| reputation_score | INTEGER | NOT NULL, DEFAULT 0 | Behind-the-scenes score |
| status | ENUM | NOT NULL, DEFAULT 'active' | active, suspended, banned, pending_verification |
| suspension_reason | TEXT | NULLABLE | |
| suspended_at | TIMESTAMPTZ | NULLABLE | |
| suspended_by | UUID | FK → users.id, NULLABLE | Who suspended this user |
| last_login_at | TIMESTAMPTZ | NULLABLE | |
| last_activity_at | TIMESTAMPTZ | NULLABLE | Updated by a background job |
| onboarding_completed | BOOLEAN | NOT NULL, DEFAULT false | Whether onboarding wizard is done |
| onboarding_step | SMALLINT | NOT NULL, DEFAULT 1 | Current onboarding step (1-5) |
| preferences | JSONB | NOT NULL, DEFAULT '{}' | Notification prefs, theme, digest frequency |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft delete |

**Indexes**: email (UNIQUE), username (UNIQUE), status, role, is_professional_verified, trust_level, location_country, last_activity_at, created_at

---

### 1.2 user_credentials

Stores OAuth provider credentials and password history.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| provider | ENUM | NOT NULL | local, google, linkedin, microsoft |
| provider_account_id | VARCHAR(255) | NOT NULL | ID from the OAuth provider |
| access_token | TEXT | NULLABLE | Encrypted OAuth access token |
| refresh_token | TEXT | NULLABLE | Encrypted OAuth refresh token |
| token_expires_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: user_id, provider, (provider, provider_account_id) UNIQUE

---

### 1.3 sessions

Active user sessions for token management.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| refresh_token | VARCHAR(500) | NOT NULL, UNIQUE | Hashed refresh token |
| device_info | VARCHAR(500) | NULLABLE | User-agent string |
| ip_address | INET | NULLABLE | |
| is_revoked | BOOLEAN | NOT NULL, DEFAULT false | |
| expires_at | TIMESTAMPTZ | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| last_active_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: user_id, refresh_token (UNIQUE), is_revoked, expires_at

---

### 1.4 email_verifications

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| token | VARCHAR(255) | NOT NULL, UNIQUE | |
| type | ENUM | NOT NULL | email_verification, password_reset, account_deletion |
| expires_at | TIMESTAMPTZ | NOT NULL | |
| used_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: user_id, token (UNIQUE), expires_at

---

### 1.5 user_roles_history

Audit trail for role changes.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| old_role | ENUM | NOT NULL | |
| new_role | ENUM | NOT NULL | |
| changed_by | UUID | FK → users.id, NOT NULL | Who made the change |
| reason | TEXT | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

## 2. Profile Domain

### 2.1 user_experiences

Work experience entries.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| company_name | VARCHAR(200) | NOT NULL | |
| company_id | UUID | FK → organizations.id, NULLABLE | If company is on platform |
| title | VARCHAR(200) | NOT NULL | |
| description | TEXT | NULLABLE | |
| start_date | DATE | NOT NULL | |
| end_date | DATE | NULLABLE | NULL = current position |
| is_current | BOOLEAN | NOT NULL, DEFAULT false | |
| location | VARCHAR(200) | NULLABLE | |
| sort_order | SMALLINT | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: user_id, company_id, is_current, start_date

---

### 2.2 user_education

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| institution | VARCHAR(200) | NOT NULL | |
| degree | VARCHAR(100) | NOT NULL | BSc, MBA, etc. |
| field_of_study | VARCHAR(200) | NULLABLE | Human Resources, Business, etc. |
| start_year | SMALLINT | NULLABLE | |
| end_year | SMALLINT | NULLABLE | |
| description | TEXT | NULLABLE | |
| sort_order | SMALLINT | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: user_id

---

### 2.3 user_certifications

HR certifications with verification status.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| certification_type | VARCHAR(100) | NOT NULL | SHRM-CP, SHRM-SCP, PHR, SPHR, CIPD, etc. |
| issuing_body | VARCHAR(200) | NOT NULL | SHRM, HRCI, CIPD, etc. |
| certificate_number | VARCHAR(100) | NULLABLE | |
| issue_date | DATE | NULLABLE | |
| expiry_date | DATE | NULLABLE | NULL = lifetime |
| verification_status | ENUM | NOT NULL, DEFAULT 'pending' | pending, verified, rejected, expired |
| verification_document_url | VARCHAR(500) | NULLABLE | Uploaded certificate/proof |
| verified_by | UUID | FK → users.id, NULLABLE | Admin who verified |
| verified_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: user_id, certification_type, verification_status, expiry_date

---

### 2.4 user_skills

HR skills with self-assessment and peer endorsements.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| skill_name | VARCHAR(100) | NOT NULL | |
| proficiency | ENUM | NOT NULL | beginner, intermediate, advanced, expert |
| endorsement_count | INTEGER | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: user_id, skill_name, (user_id, skill_name) UNIQUE

---

### 2.5 user_specialties

HR specialty areas (from controlled taxonomy).

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| specialty | VARCHAR(100) | NOT NULL | From controlled taxonomy |
| is_primary | BOOLEAN | NOT NULL, DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: user_id, specialty, (user_id, specialty) UNIQUE

---

### 2.6 user_languages

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| language | VARCHAR(50) | NOT NULL | |
| proficiency | ENUM | NOT NULL | beginner, intermediate, advanced, fluent, native |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: user_id, (user_id, language) UNIQUE

---

### 2.7 user_follows

Follow relationship (one-way, like Twitter).

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| follower_id | UUID | FK → users.id, NOT NULL | Who is following |
| following_id | UUID | FK → users.id, NOT NULL | Who is being followed |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: follower_id, following_id, (follower_id, following_id) UNIQUE
**Check**: follower_id != following_id

---

### 2.8 user_connections

Mutual connection (two-way, like LinkedIn).

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| requester_id | UUID | FK → users.id, NOT NULL | Who sent the request |
| addressee_id | UUID | FK → users.id, NOT NULL | Who received the request |
| status | ENUM | NOT NULL, DEFAULT 'pending' | pending, accepted, rejected |
| message | VARCHAR(300) | NULLABLE | Connection request message |
| responded_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: requester_id, addressee_id, status, (requester_id, addressee_id) UNIQUE
**Check**: requester_id != addressee_id

---

### 2.9 user_blocks

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| blocker_id | UUID | FK → users.id, NOT NULL | |
| blocked_id | UUID | FK → users.id, NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: blocker_id, blocked_id, (blocker_id, blocked_id) UNIQUE

---

## 3. Organizations Domain

### 3.1 organizations

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(200) | NOT NULL | |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-friendly name |
| logo_url | VARCHAR(500) | NULLABLE | |
| banner_url | VARCHAR(500) | NULLABLE | |
| description | TEXT | NULLABLE | |
| industry | VARCHAR(100) | NULLABLE | |
| company_size | ENUM | NULLABLE | startup_1_10, small_11_50, medium_51_200, large_201_1000, enterprise_1001_5000, mega_5001_plus |
| headquarters_city | VARCHAR(100) | NULLABLE | |
| headquarters_country | VARCHAR(100) | NULLABLE | |
| website | VARCHAR(500) | NULLABLE | |
| linkedin_url | VARCHAR(500) | NULLABLE | |
| is_verified | BOOLEAN | NOT NULL, DEFAULT false | |
| verified_by | UUID | FK → users.id, NULLABLE | |
| verified_at | TIMESTAMPTZ | NULLABLE | |
| claimed_by | UUID | FK → users.id, NULLABLE | User who manages this org |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | NULLABLE | |

**Indexes**: name, slug (UNIQUE), industry, company_size, is_verified, headquarters_country

---

### 3.2 organization_members

Users who are listed as HR team members of an organization.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| user_id | UUID | FK → users.id, NOT NULL | |
| title | VARCHAR(200) | NULLABLE | Their HR role at this company |
| start_date | DATE | NULLABLE | |
| is_current | BOOLEAN | NOT NULL, DEFAULT true | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: organization_id, user_id, (organization_id, user_id) UNIQUE

---

### 3.3 organization_locations

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| city | VARCHAR(100) | NOT NULL | |
| country | VARCHAR(100) | NOT NULL | |
| is_primary | BOOLEAN | NOT NULL, DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: organization_id

---

## 4. Communities Domain

### 4.1 communities

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(100) | NOT NULL | |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | |
| description | TEXT | NOT NULL | |
| cover_image_url | VARCHAR(500) | NULLABLE | |
| rules | TEXT | NULLABLE | Community guidelines |
| type | ENUM | NOT NULL, DEFAULT 'public' | public, private |
| category | VARCHAR(100) | NOT NULL | Pre-seeded category |
| created_by | UUID | FK → users.id, NOT NULL | |
| member_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized, updated by trigger |
| post_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | NULLABLE | |

**Indexes**: slug (UNIQUE), category, type, created_by, member_count, is_active

---

### 4.2 community_members

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| community_id | UUID | FK → communities.id, NOT NULL | |
| user_id | UUID | FK → users.id, NOT NULL | |
| role | ENUM | NOT NULL, DEFAULT 'member' | member, moderator, admin |
| joined_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| last_visited_at | TIMESTAMPTZ | NULLABLE | |

**Indexes**: community_id, user_id, role, (community_id, user_id) UNIQUE

---

### 4.3 community_announcements

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| community_id | UUID | FK → communities.id, NOT NULL | |
| author_id | UUID | FK → users.id, NOT NULL | |
| title | VARCHAR(300) | NOT NULL | |
| body | TEXT | NOT NULL | |
| is_pinned | BOOLEAN | NOT NULL, DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: community_id, is_pinned, created_at

---

## 5. Discussions Domain

### 5.1 discussions

Reddit-enhanced discussion posts.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| author_id | UUID | FK → users.id, NOT NULL | |
| community_id | UUID | FK → communities.id, NULLABLE | NULL = General |
| title | VARCHAR(500) | NOT NULL | |
| body | TEXT | NOT NULL | Rich text content |
| post_type | ENUM | NOT NULL, DEFAULT 'text' | text, image, link, poll, case_study |
| flair | ENUM | NULLABLE | question, discussion, case_study, tool_review, career_advice, debate, news, vent |
| is_anonymous | BOOLEAN | NOT NULL, DEFAULT false | |
| anonymous_author_id | UUID | FK → users.id, NULLABLE | Encrypted reference to real author |
| image_url | VARCHAR(500) | NULLABLE | For image posts |
| link_url | VARCHAR(1000) | NULLABLE | For link posts |
| link_title | VARCHAR(500) | NULLABLE | Auto-fetched |
| link_description | TEXT | NULLABLE | Auto-fetched |
| link_thumbnail_url | VARCHAR(500) | NULLABLE | Auto-fetched |
| tags | JSONB | NOT NULL, DEFAULT '[]' | Array of tag strings (1-5) |
| helpful_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized sum of "helpful" reactions |
| insightful_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized sum of "insightful" reactions |
| from_experience_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized sum of "from_experience" reactions |
| inaccurate_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized sum of "inaccurate" reactions |
| comment_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized |
| bookmark_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized |
| view_count | INTEGER | NOT NULL, DEFAULT 0 | |
| is_pinned | BOOLEAN | NOT NULL, DEFAULT false | |
| is_locked | BOOLEAN | NOT NULL, DEFAULT false | |
| is_promoted_to_kb | BOOLEAN | NOT NULL, DEFAULT false | Promoted to Knowledge Base |
| promoted_kb_id | UUID | FK → knowledge_resources.id, NULLABLE | |
| quality_score | DECIMAL(5,2) | NOT NULL, DEFAULT 0 | Algorithm-calculated (0-100) |
| status | ENUM | NOT NULL, DEFAULT 'published' | published, removed, reported |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft delete |

**Indexes**: author_id, community_id, post_type, flair, is_anonymous, is_pinned, is_locked, quality_score, helpful_count, created_at, tags (GIN index for JSONB)

---

### 5.2 discussion_comments

Nested comments (up to 7 levels).

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| discussion_id | UUID | FK → discussions.id, NOT NULL | |
| author_id | UUID | FK → users.id, NOT NULL | |
| parent_id | UUID | FK → discussion_comments.id, NULLABLE | NULL = top-level comment |
| depth | SMALLINT | NOT NULL, DEFAULT 0 | 0-7 nesting level |
| path | LTREE | NOT NULL | Materialized path for efficient tree queries (e.g., "root.comment1.comment3") |
| body | TEXT | NOT NULL | |
| is_anonymous | BOOLEAN | NOT NULL, DEFAULT false | |
| helpful_count | INTEGER | NOT NULL, DEFAULT 0 | |
| insightful_count | INTEGER | NOT NULL, DEFAULT 0 | |
| from_experience_count | INTEGER | NOT NULL, DEFAULT 0 | |
| inaccurate_count | INTEGER | NOT NULL, DEFAULT 0 | |
| child_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized |
| is_deleted | BOOLEAN | NOT NULL, DEFAULT false | Soft delete (shows "[deleted]") |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: discussion_id, author_id, parent_id, depth, path (GiST index for LTREE), created_at

**Note**: Use PostgreSQL `LTREE` extension for efficient nested comment queries. The `path` column stores the full path from root to this comment, enabling efficient subtree queries.

---

### 5.3 discussion_polls

For poll-type discussions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| discussion_id | UUID | FK → discussions.id, NOT NULL, UNIQUE | |
| ends_at | TIMESTAMPTZ | NULLABLE | NULL = no deadline |
| show_results_before_end | BOOLEAN | NOT NULL, DEFAULT true | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### 5.4 discussion_poll_options

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| poll_id | UUID | FK → discussion_polls.id, NOT NULL | |
| option_text | VARCHAR(300) | NOT NULL | |
| vote_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized |
| sort_order | SMALLINT | NOT NULL, DEFAULT 0 | |

**Indexes**: poll_id, (poll_id, sort_order) UNIQUE

---

### 5.5 discussion_poll_votes

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| poll_id | UUID | FK → discussion_polls.id, NOT NULL | |
| option_id | UUID | FK → discussion_poll_options.id, NOT NULL | |
| user_id | UUID | FK → users.id, NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: poll_id, option_id, user_id, (poll_id, user_id) UNIQUE (one vote per user per poll)

---

### 5.6 content_reactions

Multi-signal reactions for discussions, comments, blogs, and Q&A answers (polymorphic).

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| target_type | ENUM | NOT NULL | discussion, comment, blog, qa_answer |
| target_id | UUID | NOT NULL | FK to the target table |
| reaction_type | ENUM | NOT NULL | helpful, insightful, from_experience, inaccurate |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: user_id, target_type, target_id, (user_id, target_type, target_id, reaction_type) UNIQUE
**Note**: This is a polymorphic table. The `target_type` and `target_id` columns reference different tables. The UNIQUE constraint ensures one reaction per user per target per type.

---

### 5.7 content_bookmarks

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| target_type | ENUM | NOT NULL | discussion, question, blog, knowledge, event |
| target_id | UUID | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: user_id, target_type, (user_id, target_type, target_id) UNIQUE

---

## 6. Q&A Domain

### 6.1 questions

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| author_id | UUID | FK → users.id, NOT NULL | |
| title | VARCHAR(300) | NOT NULL | Max 200 chars recommended |
| body | TEXT | NOT NULL | Detailed question |
| tags | JSONB | NOT NULL, DEFAULT '[]' | 1-5 tags |
| category | ENUM | NOT NULL | compliance, compensation, ta, er, ld, tech, legal, general |
| urgency | ENUM | NOT NULL, DEFAULT 'normal' | normal, high, critical |
| bounty_amount | INTEGER | NULLABLE | 50-500 reputation points |
| bounty_expires_at | TIMESTAMPTZ | NULLABLE | 7 days from bounty creation |
| similar_question_ids | JSONB | NOT NULL, DEFAULT '[]' | Auto-suggested similar questions |
| is_anonymous | BOOLEAN | NOT NULL, DEFAULT false | |
| helpful_count | INTEGER | NOT NULL, DEFAULT 0 | |
| insightful_count | INTEGER | NOT NULL, DEFAULT 0 | |
| answer_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized |
| view_count | INTEGER | NOT NULL, DEFAULT 0 | |
| accepted_answer_id | UUID | FK → qa_answers.id, NULLABLE | |
| has_bounty | BOOLEAN | NOT NULL, DEFAULT false | Denormalized |
| status | ENUM | NOT NULL, DEFAULT 'published' | published, closed, removed |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | NULLABLE | |

**Indexes**: author_id, category, urgency, has_bounty, accepted_answer_id, helpful_count, answer_count, created_at, tags (GIN)

---

### 6.2 qa_answers

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| question_id | UUID | FK → questions.id, NOT NULL | |
| author_id | UUID | FK → users.id, NOT NULL | |
| body | TEXT | NOT NULL | |
| is_accepted | BOOLEAN | NOT NULL, DEFAULT false | |
| accepted_at | TIMESTAMPTZ | NULLABLE | |
| helpful_count | INTEGER | NOT NULL, DEFAULT 0 | |
| insightful_count | INTEGER | NOT NULL, DEFAULT 0 | |
| from_experience_count | INTEGER | NOT NULL, DEFAULT 0 | |
| inaccurate_count | INTEGER | NOT NULL, DEFAULT 0 | |
| comment_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized |
| edit_count | INTEGER | NOT NULL, DEFAULT 0 | |
| is_deleted | BOOLEAN | NOT NULL, DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: question_id, author_id, is_accepted, helpful_count, created_at

---

### 6.3 qa_answer_comments

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| answer_id | UUID | FK → qa_answers.id, NOT NULL | |
| author_id | UUID | FK → users.id, NOT NULL | |
| body | TEXT | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: answer_id, author_id

---

### 6.4 qa_answer_edits

Edit history for transparency.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| answer_id | UUID | FK → qa_answers.id, NOT NULL | |
| editor_id | UUID | FK → users.id, NOT NULL | |
| body_before | TEXT | NOT NULL | |
| body_after | TEXT | NOT NULL | |
| edit_summary | VARCHAR(500) | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: answer_id, editor_id

---

## 7. Blogs Domain

### 7.1 blogs

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| author_id | UUID | FK → users.id, NOT NULL | |
| title | VARCHAR(300) | NOT NULL | |
| slug | VARCHAR(300) | NOT NULL | URL-friendly, auto-generated from title |
| body | TEXT | NOT NULL | Rich text |
| summary | TEXT | NULLABLE | Auto-generated or author-written (max 300 chars) |
| featured_image_url | VARCHAR(500) | NULLABLE | Required for published |
| category | VARCHAR(100) | NOT NULL | From controlled taxonomy |
| tags | JSONB | NOT NULL, DEFAULT '[]' | 1-10 tags |
| series_id | UUID | FK → blog_series.id, NULLABLE | |
| series_order | SMALLINT | NULLABLE | Position within series |
| workflow_state | ENUM | NOT NULL, DEFAULT 'draft' | draft, peer_review, editorial_review, published, featured, archived |
| reading_time_minutes | SMALLINT | NULLABLE | Auto-calculated |
| word_count | INTEGER | NULLABLE | Auto-calculated |
| helpful_count | INTEGER | NOT NULL, DEFAULT 0 | |
| insightful_count | INTEGER | NOT NULL, DEFAULT 0 | |
| comment_count | INTEGER | NOT NULL, DEFAULT 0 | |
| bookmark_count | INTEGER | NOT NULL, DEFAULT 0 | |
| view_count | INTEGER | NOT NULL, DEFAULT 0 | |
| published_at | TIMESTAMPTZ | NULLABLE | |
| reviewed_by | UUID | FK → users.id, NULLABLE | Editor who approved |
| reviewed_at | TIMESTAMPTZ | NULLABLE | |
| rejection_reason | TEXT | NULLABLE | If editorial review rejects |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | NULLABLE | |

**Indexes**: author_id, slug (UNIQUE), category, workflow_state, published_at, helpful_count, view_count, tags (GIN)

---

### 7.2 blog_series

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| author_id | UUID | FK → users.id, NOT NULL | |
| title | VARCHAR(300) | NOT NULL | |
| description | TEXT | NULLABLE | |
| blog_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### 7.3 blog_comments

Reuse the same nested comment pattern as discussions, or reference `discussion_comments` pattern with a separate table.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| blog_id | UUID | FK → blogs.id, NOT NULL | |
| author_id | UUID | FK → users.id, NOT NULL | |
| parent_id | UUID | FK → blog_comments.id, NULLABLE | |
| depth | SMALLINT | NOT NULL, DEFAULT 0 | |
| body | TEXT | NOT NULL | |
| helpful_count | INTEGER | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: blog_id, author_id, parent_id

---

### 7.4 blog_peer_reviews

Community peer review feedback.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| blog_id | UUID | FK → blogs.id, NOT NULL | |
| reviewer_id | UUID | FK → users.id, NOT NULL | |
| feedback | TEXT | NOT NULL | |
| quality_score | SMALLINT | NULLABLE | 1-5 rating |
| expertise_rating | ENUM | NULLABLE | confirms_expertise, neutral, questions_expertise |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: blog_id, reviewer_id, (blog_id, reviewer_id) UNIQUE

---

## 8. Knowledge Hub Domain

### 8.1 knowledge_resources

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| title | VARCHAR(300) | NOT NULL | |
| slug | VARCHAR(300) | UNIQUE, NOT NULL | |
| body | TEXT | NOT NULL | Rich text |
| summary | TEXT | NULLABLE | |
| resource_type | ENUM | NOT NULL | template, policy, sop, research_summary, whitepaper, case_study, best_practice, toolkit, framework, checklist |
| category | VARCHAR(100) | NOT NULL | |
| tags | JSONB | NOT NULL, DEFAULT '[]' | |
| jurisdiction | VARCHAR(100) | NULLABLE | Applicable jurisdiction (country/state) |
| version | SMALLINT | NOT NULL, DEFAULT 1 | |
| last_reviewed_at | TIMESTAMPTZ | NULLABLE | |
| next_review_at | TIMESTAMPTZ | NULLABLE | |
| reviewed_by | UUID | FK → users.id, NULLABLE | |
| source_discussion_id | UUID | FK → discussions.id, NULLABLE | If promoted from discussion |
| helpful_count | INTEGER | NOT NULL, DEFAULT 0 | |
| view_count | INTEGER | NOT NULL, DEFAULT 0 | |
| download_count | INTEGER | NOT NULL, DEFAULT 0 | |
| created_by | UUID | FK → users.id, NOT NULL | |
| status | ENUM | NOT NULL, DEFAULT 'draft' | draft, published, archived |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: slug (UNIQUE), resource_type, category, jurisdiction, status, helpful_count, created_at, tags (GIN)

---

### 8.2 knowledge_attachments

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| resource_id | UUID | FK → knowledge_resources.id, NOT NULL | |
| file_name | VARCHAR(255) | NOT NULL | |
| file_url | VARCHAR(500) | NOT NULL | S3 URL |
| file_type | VARCHAR(50) | NOT NULL | MIME type |
| file_size_bytes | INTEGER | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: resource_id

---

## 9. Events Domain

### 9.1 events

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| organizer_id | UUID | FK → users.id, NOT NULL | |
| community_id | UUID | FK → communities.id, NULLABLE | |
| title | VARCHAR(300) | NOT NULL | |
| slug | VARCHAR(300) | UNIQUE, NOT NULL | |
| description | TEXT | NOT NULL | |
| cover_image_url | VARCHAR(500) | NULLABLE | |
| event_type | ENUM | NOT NULL | webinar, workshop, conference, meetup, panel, expert_ama, audio_roundtable, study_group |
| format | ENUM | NOT NULL | virtual, in_person, hybrid |
| start_at | TIMESTAMPTZ | NOT NULL | |
| end_at | TIMESTAMPTZ | NOT NULL | |
| timezone | VARCHAR(50) | NOT NULL | |
| location | VARCHAR(500) | NULLABLE | For in-person/hybrid |
| capacity | INTEGER | NULLABLE | NULL = unlimited |
| registration_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized |
| is_series | BOOLEAN | NOT NULL, DEFAULT false | |
| series_id | UUID | FK → event_series.id, NULLABLE | |
| status | ENUM | NOT NULL, DEFAULT 'upcoming' | upcoming, live, completed, cancelled |
| recording_url | VARCHAR(500) | NULLABLE | |
| certificate_template | JSONB | NULLABLE | Certificate generation config |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | NULLABLE | |

**Indexes**: organizer_id, community_id, event_type, format, start_at, status, capacity

---

### 9.2 event_speakers

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| event_id | UUID | FK → events.id, NOT NULL | |
| user_id | UUID | FK → users.id, NOT NULL | |
| role | VARCHAR(100) | NOT NULL | speaker, moderator, panelist |
| bio | TEXT | NULLABLE | Speaker bio for this event |
| sort_order | SMALLINT | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: event_id, user_id, (event_id, user_id) UNIQUE

---

### 9.3 event_registrations

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| event_id | UUID | FK → events.id, NOT NULL | |
| user_id | UUID | FK → users.id, NOT NULL | |
| attended | BOOLEAN | NOT NULL, DEFAULT false | |
| attended_at | TIMESTAMPTZ | NULLABLE | |
| certificate_issued | BOOLEAN | NOT NULL, DEFAULT false | |
| certificate_url | VARCHAR(500) | NULLABLE | |
| feedback_submitted | BOOLEAN | NOT NULL, DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: event_id, user_id, (event_id, user_id) UNIQUE

---

### 9.4 event_series

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| title | VARCHAR(300) | NOT NULL | |
| description | TEXT | NULLABLE | |
| recurrence | ENUM | NOT NULL | weekly, biweekly, monthly |
| created_by | UUID | FK → users.id, NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

## 10. Learning Domain

### 10.1 courses

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| title | VARCHAR(300) | NOT NULL | |
| slug | VARCHAR(300) | UNIQUE, NOT NULL | |
| description | TEXT | NOT NULL | |
| cover_image_url | VARCHAR(500) | NULLABLE | |
| category | VARCHAR(100) | NOT NULL | |
| tags | JSONB | NOT NULL, DEFAULT '[]' | |
| level | ENUM | NOT NULL | beginner, intermediate, advanced |
| duration_hours | DECIMAL(4,1) | NOT NULL | Total estimated hours |
| module_count | SMALLINT | NOT NULL, DEFAULT 0 | Denormalized |
| enrollment_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized |
| completion_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized |
| average_rating | DECIMAL(3,2) | NULLABLE | |
| certification_credit_hours | DECIMAL(4,1) | NULLABLE | SHRM/HRCI credit hours |
| certification_type | VARCHAR(50) | NULLABLE | SHRM_PDC, HRCI credit type |
| path_id | UUID | FK → learning_paths.id, NULLABLE | If part of a path |
| path_order | SMALLINT | NULLABLE | Order within path |
| created_by | UUID | FK → users.id, NOT NULL | |
| status | ENUM | NOT NULL, DEFAULT 'draft' | draft, published, archived |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: slug (UNIQUE), category, level, status, enrollment_count, average_rating

---

### 10.2 course_modules

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| course_id | UUID | FK → courses.id, NOT NULL | |
| title | VARCHAR(300) | NOT NULL | |
| description | TEXT | NULLABLE | |
| content_type | ENUM | NOT NULL | video, reading, interactive |
| video_url | VARCHAR(500) | NULLABLE | S3/HLS URL |
| video_duration_seconds | INTEGER | NULLABLE | |
| reading_content | TEXT | NULLABLE | For reading modules |
| sort_order | SMALLINT | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: course_id, sort_order, (course_id, sort_order) UNIQUE

---

### 10.3 course_module_assessments

Knowledge check questions within modules.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| module_id | UUID | FK → course_modules.id, NOT NULL | |
| question_text | TEXT | NOT NULL | |
| question_type | ENUM | NOT NULL | multiple_choice, true_false, short_answer |
| options | JSONB | NOT NULL, DEFAULT '[]' | For multiple choice: [{text, is_correct}] |
| explanation | TEXT | NULLABLE | Shown after answering |
| sort_order | SMALLINT | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: module_id, sort_order

---

### 10.4 learning_paths

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| title | VARCHAR(300) | NOT NULL | |
| description | TEXT | NOT NULL | |
| category | VARCHAR(100) | NOT NULL | |
| course_ids | JSONB | NOT NULL, DEFAULT '[]' | Ordered list of course IDs |
| total_duration_hours | DECIMAL(5,1) | NOT NULL | |
| enrollment_count | INTEGER | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### 10.5 course_enrollments

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| course_id | UUID | FK → courses.id, NOT NULL | |
| user_id | UUID | FK → users.id, NOT NULL | |
| progress_percent | DECIMAL(5,2) | NOT NULL, DEFAULT 0 | 0-100 |
| completed_at | TIMESTAMPTZ | NULLABLE | |
| certificate_url | VARCHAR(500) | NULLABLE | |
| final_assessment_score | DECIMAL(5,2) | NULLABLE | 0-100 |
| final_assessment_passed | BOOLEAN | NULLABLE | |
| credits_earned | DECIMAL(4,1) | NULLABLE | |
| last_accessed_module_id | UUID | FK → course_modules.id, NULLABLE | Resume point |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: course_id, user_id, (course_id, user_id) UNIQUE, progress_percent, completed_at

---

### 10.6 module_progress

Track per-module progress.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| enrollment_id | UUID | FK → course_enrollments.id, NOT NULL | |
| module_id | UUID | FK → course_modules.id, NOT NULL | |
| is_completed | BOOLEAN | NOT NULL, DEFAULT false | |
| assessment_score | DECIMAL(5,2) | NULLABLE | |
| video_position_seconds | INTEGER | NULLABLE | Resume video position |
| notes | TEXT | NULLABLE | User notes for this module |
| completed_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: enrollment_id, module_id, (enrollment_id, module_id) UNIQUE

---

### 10.7 study_groups

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(200) | NOT NULL | |
| description | TEXT | NULLABLE | |
| purpose | ENUM | NOT NULL | cert_prep, topic_deep_dive, accountability, peer_learning |
| max_members | SMALLINT | NOT NULL, DEFAULT 15 | 5-15 |
| course_id | UUID | FK → courses.id, NULLABLE | If studying a specific course |
| created_by | UUID | FK → users.id, NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### 10.8 study_group_members

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| study_group_id | UUID | FK → study_groups.id, NOT NULL | |
| user_id | UUID | FK → users.id, NOT NULL | |
| role | ENUM | NOT NULL, DEFAULT 'member' | member, leader |
| joined_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| last_active_at | TIMESTAMPTZ | NULLABLE | |

**Indexes**: study_group_id, user_id, (study_group_id, user_id) UNIQUE

---

### 10.9 recertification_credits

Tracks all credit-earning activities.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| source_type | ENUM | NOT NULL | course, webinar, event, article, answer, blog, external |
| source_id | UUID | NULLABLE | Reference to the activity |
| source_title | VARCHAR(300) | NOT NULL | Description of the activity |
| credits | DECIMAL(4,1) | NOT NULL | Number of credits earned |
| certification_type | VARCHAR(50) | NOT NULL | SHRM_PDC, HRCI, CIPD_CPD |
| credit_date | DATE | NOT NULL | When the activity occurred |
| is_manual_submission | BOOLEAN | NOT NULL, DEFAULT false | |
| is_verified | BOOLEAN | NOT NULL, DEFAULT true | |
| verified_by | UUID | FK → users.id, NULLABLE | For manual submissions |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: user_id, certification_type, credit_date, source_type, is_verified

---

## 11. Messaging Domain

### 11.1 conversations

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| is_group | BOOLEAN | NOT NULL, DEFAULT false | v1: always false (1:1 only) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### 11.2 conversation_participants

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| conversation_id | UUID | FK → conversations.id, NOT NULL | |
| user_id | UUID | FK → users.id, NOT NULL | |
| last_read_at | TIMESTAMPTZ | NULLABLE | For read receipts |
| is_muted | BOOLEAN | NOT NULL, DEFAULT false | |
| joined_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: conversation_id, user_id, (conversation_id, user_id) UNIQUE

---

### 11.3 messages

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| conversation_id | UUID | FK → conversations.id, NOT NULL | |
| sender_id | UUID | FK → users.id, NOT NULL | |
| body | TEXT | NOT NULL | |
| message_type | ENUM | NOT NULL, DEFAULT 'text' | text, image, file |
| file_url | VARCHAR(500) | NULLABLE | |
| file_name | VARCHAR(255) | NULLABLE | |
| file_size_bytes | INTEGER | NULLABLE | |
| is_read | BOOLEAN | NOT NULL, DEFAULT false | Denormalized for query perf |
| read_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| deleted_for | JSONB | NOT NULL, DEFAULT '[]' | Array of user IDs who deleted this message |

**Indexes**: conversation_id, sender_id, is_read, created_at
**Partitioning**: Consider partitioning by month on created_at for high-volume messaging

---

## 12. Mentorship Domain

### 12.1 mentorship_profiles

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL, UNIQUE | |
| is_available_as_mentor | BOOLEAN | NOT NULL, DEFAULT false | |
| mentoring_specialties | JSONB | NOT NULL, DEFAULT '[]' | |
| mentoring_style | VARCHAR(200) | NULLABLE | |
| availability_description | TEXT | NULLABLE | |
| max_mentees | SMALLINT | NOT NULL, DEFAULT 3 | |
| active_mentee_count | SMALLINT | NOT NULL, DEFAULT 0 | |
| mentee_reviews_avg | DECIMAL(3,2) | NULLABLE | |
| completed_mentorships | INTEGER | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### 12.2 mentorship_requests

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| mentor_id | UUID | FK → users.id, NOT NULL | |
| mentee_id | UUID | FK → users.id, NOT NULL | |
| goals | TEXT | NOT NULL | What the mentee wants to achieve |
| expected_duration_months | SMALLINT | NOT NULL, DEFAULT 3 | |
| status | ENUM | NOT NULL, DEFAULT 'pending' | pending, accepted, rejected, active, completed, cancelled |
| matched_by | ENUM | NULLABLE | algorithm, mentee_request, mentor_invite |
| rejection_reason | TEXT | NULLABLE | |
| started_at | TIMESTAMPTZ | NULLABLE | |
| expected_end_at | TIMESTAMPTZ | NULLABLE | |
| completed_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: mentor_id, mentee_id, status, (mentor_id, mentee_id, status) UNIQUE where pending/active

---

### 12.3 mentorship_goals

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| mentorship_id | UUID | FK → mentorship_requests.id, NOT NULL | |
| goal_text | TEXT | NOT NULL | |
| target_date | DATE | NULLABLE | |
| is_completed | BOOLEAN | NOT NULL, DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### 12.4 mentorship_sessions

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| mentorship_id | UUID | FK → mentorship_requests.id, NOT NULL | |
| scheduled_at | TIMESTAMPTZ | NOT NULL | |
| duration_minutes | SMALLINT | NOT NULL, DEFAULT 60 | |
| notes | TEXT | NULLABLE | Mentor's session notes |
| mentee_feedback | TEXT | NULLABLE | |
| mentee_rating | SMALLINT | NULLABLE | 1-5 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

## 13. Reviews & Benchmarking Domain

### 13.1 employer_reviews

Anonymous HR department reviews (Glassdoor-for-HR, from HR perspective).

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| author_id | UUID | FK → users.id, NOT NULL | Encrypted reference |
| organization_id | UUID | FK → organizations.id, NOT NULL | |
| overall_rating | SMALLINT | NOT NULL, CHECK (1-5) | |
| leadership_support_rating | SMALLINT | NOT NULL, CHECK (1-5) | |
| budget_resources_rating | SMALLINT | NOT NULL, CHECK (1-5) | |
| tech_stack_rating | SMALLINT | NOT NULL, CHECK (1-5) | |
| workload_rating | SMALLINT | NOT NULL, CHECK (1-5) | |
| hr_influence_rating | SMALLINT | NOT NULL, CHECK (1-5) | |
| team_culture_rating | SMALLINT | NOT NULL, CHECK (1-5) | |
| career_growth_rating | SMALLINT | NOT NULL, CHECK (1-5) | |
| pros | TEXT | NOT NULL | |
| cons | TEXT | NOT NULL | |
| advice | TEXT | NULLABLE | |
| role_title | VARCHAR(200) | NULLABLE | |
| tenure | VARCHAR(50) | NULLABLE | e.g., "2-3 years" |
| company_size_at_time | ENUM | NULLABLE | |
| industry | VARCHAR(100) | NULLABLE | |
| location | VARCHAR(200) | NULLABLE | |
| helpful_count | INTEGER | NOT NULL, DEFAULT 0 | |
| comment_count | INTEGER | NOT NULL, DEFAULT 0 | |
| status | ENUM | NOT NULL, DEFAULT 'published' | published, removed, under_review |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: organization_id, overall_rating, leadership_support_rating, industry, location, created_at
**Note**: `author_id` is encrypted. Only Super Admin can decrypt for abuse investigation.

---

### 13.2 hr_vendor_profiles

HR tech vendor directory.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(200) | NOT NULL | |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | |
| logo_url | VARCHAR(500) | NULLABLE | |
| website | VARCHAR(500) | NOT NULL | |
| description | TEXT | NOT NULL | |
| category | VARCHAR(100) | NOT NULL | ATS, HRIS, payroll, benefits, LMS, recruitment_marketing, etc. |
| pricing_model | ENUM | NULLABLE | freemium, per_employee, flat_monthly, quote_based, open_source |
| company_size_served | JSONB | NOT NULL, DEFAULT '[]' | startup, smb, mid_market, enterprise |
| deployment_type | ENUM | NULLABLE | cloud, on_premise, hybrid |
| claimed_by | UUID | FK → users.id, NULLABLE | Vendor rep who claimed |
| is_verified | BOOLEAN | NOT NULL, DEFAULT false | |
| average_rating | DECIMAL(3,2) | NULLABLE | |
| review_count | INTEGER | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### 13.3 hr_vendor_reviews

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| vendor_id | UUID | FK → hr_vendor_profiles.id, NOT NULL | |
| author_id | UUID | FK → users.id, NOT NULL | |
| ease_of_use_rating | SMALLINT | NOT NULL, CHECK (1-5) | |
| features_rating | SMALLINT | NOT NULL, CHECK (1-5) | |
| value_rating | SMALLINT | NOT NULL, CHECK (1-5) | |
| support_rating | SMALLINT | NOT NULL, CHECK (1-5) | |
| integration_rating | SMALLINT | NOT NULL, CHECK (1-5) | |
| title | VARCHAR(300) | NOT NULL | |
| body | TEXT | NOT NULL | |
| pros | TEXT | NULLABLE | |
| cons | TEXT | NULLABLE | |
| company_size | ENUM | NULLABLE | |
| industry | VARCHAR(100) | NULLABLE | |
| years_using | VARCHAR(50) | NULLABLE | |
| helpful_count | INTEGER | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: vendor_id, author_id, ease_of_use_rating, (vendor_id, author_id) UNIQUE

---

### 13.4 salary_submissions

Verified salary benchmarking data.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| job_title | VARCHAR(200) | NOT NULL | |
| company_name | VARCHAR(200) | NULLABLE | Optional, can be anonymous |
| industry | VARCHAR(100) | NULLABLE | |
| company_size | ENUM | NULLABLE | |
| location_city | VARCHAR(100) | NULLABLE | |
| location_country | VARCHAR(100) | NOT NULL | |
| location_state | VARCHAR(100) | NULLABLE | |
| base_salary_annual | INTEGER | NOT NULL | In USD |
| bonus_annual | INTEGER | NULLABLE | In USD |
| total_compensation | INTEGER | NOT NULL | In USD |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'USD' | |
| years_experience | SMALLINT | NOT NULL | |
| years_at_company | SMALLINT | NULLABLE | |
| education_level | ENUM | NULLABLE | |
| certification | VARCHAR(100) | NULLABLE | |
| hr_specialty | VARCHAR(100) | NULLABLE | |
| gender | ENUM | NULLABLE | male, female, non_binary, prefer_not_to_say |
| verification_status | ENUM | NOT NULL, DEFAULT 'pending' | pending, verified, rejected |
| verification_document_url | VARCHAR(500) | NULLABLE | Paystub/offer letter |
| is_anonymous | BOOLEAN | NOT NULL, DEFAULT true | |
| effective_date | DATE | NOT NULL | When this salary was effective |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: user_id, job_title, industry, company_size, location_country, location_state, years_experience, base_salary_annual, verification_status, effective_date

---

## 14. Notifications Domain

### 14.1 notifications

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| recipient_id | UUID | FK → users.id, NOT NULL | |
| type | ENUM | NOT NULL | new_follower, connection_request, connection_accepted, comment, reply, reaction, answer_accepted, event_reminder, community_invitation, blog_approved, course_completed, certificate_earned, credit_earned, announcement, compliance_alert, mentorship_request, mention, system |
| title | VARCHAR(300) | NOT NULL | |
| body | TEXT | NULLABLE | |
| data | JSONB | NOT NULL, DEFAULT '{}' | Related entity IDs, action URLs |
| is_read | BOOLEAN | NOT NULL, DEFAULT false | |
| read_at | TIMESTAMPTZ | NULLABLE | |
| email_sent | BOOLEAN | NOT NULL, DEFAULT false | |
| email_sent_at | TIMESTAMPTZ | NULLABLE | |
| push_sent | BOOLEAN | NOT NULL, DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: recipient_id, type, is_read, created_at
**Partitioning**: Partition by month on created_at for high-volume notifications

---

## 15. AI Domain

### 15.1 ai_conversations

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| title | VARCHAR(300) | NULLABLE | Auto-generated from first message |
| capability | ENUM | NULLABLE | policy_explanation, terminology, interview_gen, jd_draft, review_suggestion, email_draft, doc_summary, resume_feedback, research, compliance, meeting_agenda, onboarding, exit_analysis, survey_design, policy_comparison |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: user_id, capability, created_at

---

### 15.2 ai_messages

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| conversation_id | UUID | FK → ai_conversations.id, NOT NULL | |
| role | ENUM | NOT NULL | user, assistant, system |
| content | TEXT | NOT NULL | |
| sources | JSONB | NOT NULL, DEFAULT '[]' | RAG source references |
| model_used | VARCHAR(50) | NULLABLE | Which LLM model |
| tokens_used | INTEGER | NULLABLE | |
| latency_ms | INTEGER | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: conversation_id, role, created_at

---

## 16. Moderation & Audit Domain

### 16.1 content_reports

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| reporter_id | UUID | FK → users.id, NOT NULL | |
| target_type | ENUM | NOT NULL | discussion, comment, blog, answer, review, message |
| target_id | UUID | NOT NULL | |
| reason | ENUM | NOT NULL | spam, harassment, inaccurate, off_topic, sensitive_content, pii_leak, other |
| description | TEXT | NULLABLE | |
| status | ENUM | NOT NULL, DEFAULT 'pending' | pending, reviewed, action_taken, dismissed |
| reviewed_by | UUID | FK → users.id, NULLABLE | |
| review_action | VARCHAR(100) | NULLABLE | What action was taken |
| reviewed_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: reporter_id, target_type, target_id, status, reviewed_by

---

### 16.2 audit_logs

Immutable audit trail for all admin/moderation actions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| actor_id | UUID | FK → users.id, NOT NULL | |
| actor_role | ENUM | NOT NULL | super_admin, admin, moderator |
| action | VARCHAR(100) | NOT NULL | E.g., user.suspend, content.remove, role.assign |
| target_type | VARCHAR(100) | NOT NULL | E.g., user, discussion, blog, community |
| target_id | UUID | NOT NULL | |
| details | JSONB | NOT NULL, DEFAULT '{}' | Before/after values, reason, etc. |
| ip_address | INET | NULLABLE | |
| user_agent | VARCHAR(500) | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: actor_id, action, target_type, target_id, created_at
**Partitioning**: Partition by month on created_at
**Note**: This table is APPEND-ONLY. No updates or deletes allowed. This is the immutable audit trail.

---

## 17. Reputation & Badges Domain

### 17.1 user_badges

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| badge_type | VARCHAR(100) | NOT NULL | first_answer, problem_solver, knowledge_keeper, etc. |
| awarded_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| awarded_reason | TEXT | NULLABLE | Context for why badge was awarded |

**Indexes**: user_id, badge_type, (user_id, badge_type) UNIQUE

---

### 17.2 reputation_events

Ledger of all reputation changes.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| event_type | ENUM | NOT NULL | answer_helpful, answer_insightful, blog_published, course_completed, etc. |
| points_change | INTEGER | NOT NULL | Positive or negative |
| source_type | VARCHAR(50) | NOT NULL | discussion, answer, blog, course, mentorship |
| source_id | UUID | NULLABLE | |
| new_total | INTEGER | NOT NULL | Running total |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: user_id, event_type, source_type, created_at

---

## 18. Career Pathing Domain

### 18.1 career_paths

Pre-defined HR career path templates.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(200) | NOT NULL | e.g., "HR Generalist Path", "Talent Acquisition Path" |
| description | TEXT | NOT NULL | |
| category | VARCHAR(100) | NOT NULL | |
| levels | JSONB | NOT NULL, DEFAULT '[]' | Array of {level, title, typical_years, skills, certifications} |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### 18.2 user_career_assessments

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| career_path_id | UUID | FK → career_paths.id, NOT NULL | |
| self_assessed_level | VARCHAR(100) | NOT NULL | Which level they think they're at |
| skill_gaps | JSONB | NOT NULL, DEFAULT '[]' | Identified skill gaps |
| recommended_actions | JSONB | NOT NULL, DEFAULT '[]' | Courses, certs, experiences |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

## 19. News & Compliance Domain

### 19.1 hr_news_articles

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| title | VARCHAR(300) | NOT NULL | |
| slug | VARCHAR(300) | UNIQUE, NOT NULL | |
| source_url | VARCHAR(1000) | NULLABLE | External source URL |
| source_name | VARCHAR(200) | NULLABLE | e.g., "SHRM", "Bloomberg Law" |
| summary | TEXT | NOT NULL | AI-generated or editorial summary |
| body | TEXT | NULLABLE | Full article text |
| category | ENUM | NOT NULL | regulation, technology, trends, research, opinion |
| tags | JSONB | NOT NULL, DEFAULT '[]' | |
| jurisdictions | JSONB | NOT NULL, DEFAULT '[]' | Affected jurisdictions |
| is_featured | BOOLEAN | NOT NULL, DEFAULT false | |
| comment_count | INTEGER | NOT NULL, DEFAULT 0 | |
| view_count | INTEGER | NOT NULL, DEFAULT 0 | |
| published_at | TIMESTAMPTZ | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: slug (UNIQUE), category, jurisdictions (GIN), published_at, is_featured

---

### 19.2 compliance_alerts

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| title | VARCHAR(300) | NOT NULL | |
| description | TEXT | NOT NULL | What changed |
| action_required | TEXT | NULLABLE | What HR needs to do |
| jurisdiction | VARCHAR(100) | NOT NULL | Country/state |
| category | VARCHAR(100) | NOT NULL | labor_law, leave_policy, minimum_wage, discrimination, safety, benefits |
| effective_date | DATE | NULLABLE | When the change takes effect |
| source_url | VARCHAR(1000) | NULLABLE | |
| severity | ENUM | NOT NULL | info, warning, critical | |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: jurisdiction, category, severity, effective_date, is_active

---

## 20. Analytics Domain (Admin)

### 20.1 daily_platform_stats

Aggregated daily statistics for the admin dashboard.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | |
| date | DATE | NOT NULL | |
| total_members | INTEGER | NOT NULL | |
| new_members | INTEGER | NOT NULL | |
| active_members | INTEGER | NOT NULL | DAU |
| weekly_active_members | INTEGER | NOT NULL | WAU |
| monthly_active_members | INTEGER | NOT NULL | MAU |
| new_discussions | INTEGER | NOT NULL | |
| new_questions | INTEGER | NOT NULL | |
| new_answers | INTEGER | NOT NULL | |
| new_blogs | INTEGER | NOT NULL | |
| event_registrations | INTEGER | NOT NULL | |
| course_enrollments | INTEGER | NOT NULL | |
| course_completions | INTEGER | NOT NULL | |
| certificates_issued | INTEGER | NOT NULL | |
| ai_queries | INTEGER | NOT NULL | |
| messages_sent | INTEGER | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: date (UNIQUE)

---

## Entity Relationship Summary

### Key Relationships

```
users 1──* user_experiences
users 1──* user_education
users 1──* user_certifications
users 1──* user_skills
users 1──* user_specialties
users 1──* user_languages
users *──* users (follows: follower_id, following_id)
users *──* users (connections: requester_id, addressee_id)
users *──* users (blocks: blocker_id, blocked_id)

organizations 1──* organization_members ── users
organizations 1──* organization_locations

communities 1──* community_members ── users
communities 1──* community_announcements ── users
communities 1──* discussions

users 1──* discussions ── communities
discussions 1──* discussion_comments (self-referential, nested)
discussions 1──1 discussion_polls 1──* discussion_poll_options 1──* discussion_poll_votes

users 1──* questions
questions 1──* qa_answers ── users
qa_answers 1──* qa_answer_comments
qa_answers 1──* qa_answer_edits

users 1──* blogs ── blog_series
blogs 1──* blog_comments (nested)
blogs 1──* blog_peer_reviews

knowledge_resources 1──* knowledge_attachments

events 1──* event_speakers ── users
events 1──* event_registrations ── users
events *──1 event_series

courses 1──* course_modules 1──* course_module_assessments
courses *──1 learning_paths
users 1──* course_enrollments
course_enrollments 1──* module_progress
study_groups *──* users (study_group_members)
users 1──* recertification_credits

conversations *──* users (conversation_participants)
conversations 1──* messages

users 1──1 mentorship_profiles
users 1──* mentorship_requests (as mentor or mentee)
mentorship_requests 1──* mentorship_goals
mentorship_requests 1──* mentorship_sessions

organizations 1──* employer_reviews
hr_vendor_profiles 1──* hr_vendor_reviews
users 1──* salary_submissions

users 1──* notifications
users 1──* ai_conversations 1──* ai_messages

content_reports ── users (reporter) + polymorphic target
audit_logs ── users (actor) + polymorphic target

users 1──* user_badges
users 1──* reputation_events
```

---

*This schema covers all entities required for the HRShakti platform as defined in the Product Specification (02-product-specification.md). The LLM should use this as the reference to generate the Prisma schema or TypeORM entities, including all relations, indexes, and constraints.*