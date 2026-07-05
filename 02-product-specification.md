# HRShakti — Product Specification (Refined)

> **Document Type**: Product Specification (Research-Validated)  
> **Version**: 2.0  
> **Date**: 2026-07-05  
> **Status**: Implementation Ready  
> **Supersedes**: Original SRS v1.0  

---

## 1. Product Identity

**Name**: HRShakti  
**Tagline**: The Professional Home for HR  
**Category**: HR Professional Community Platform (New Category)  
**One-Line Description**: A verified, community-first ecosystem where HR professionals network, discuss, learn, and get AI-powered assistance — all in one place.

### What HRShakti Is

HRShakti is a professional ecosystem that combines five pillars into a single, unified platform:

1. **Professional Networking** — Verified HR profiles, connections, follow model
2. **Community & Discussions** — Reddit-quality discussions with verified professional credibility
3. **Knowledge & Content** — HBR-quality articles, case studies, and a permanent knowledge base
4. **Learning & Growth** — Courses, certifications, mentorship, career pathing
5. **AI-Powered Tools** — AI assistant for daily HR tasks (policies, compliance, drafting, research)

### What HRShakti Is NOT

- HRShakti is NOT an HRMS (Human Resource Management System) — it does not manage employees, payroll, or benefits administration
- HRShakti is NOT a job board (v1) — job listings may come in v2
- HRShakti is NOT LinkedIn — it is HR-only, not a generic professional network
- HRShakti is NOT SHRM — it is a technology platform, not a membership association
- HRShakti is NOT Reddit — it has verified identities, professional quality standards, and structured knowledge

---

## 2. Vision & Objectives

### Vision
To become the world's leading digital platform for HR professionals by enabling verified collaboration, continuous learning, professional networking, and knowledge exchange — with AI as a force multiplier.

### Objectives
1. Create the largest verified HR professional community globally
2. Enable meaningful, high-quality HR discussions with professional credibility
3. Promote community-driven knowledge sharing and content creation
4. Support professional networking with verified connections
5. Provide AI-assisted HR productivity tools
6. Build a permanent, searchable HR knowledge base
7. Foster collaboration between individual professionals and organizations
8. Create the strongest retention hook in HR tech: automated recertification credit tracking

---

## 3. Target Users

### Primary Users
| Segment | Description | Estimated Market Size |
|---|---|---|
| **HR Professionals** | Practicing HR across all levels and specialties | 50M+ globally |
| **Talent Acquisition Specialists** | Recruiters, sourcers, TA leads, hiring managers | 15M+ globally |
| **HR Managers & Directors** | People managers leading HR functions | 5M+ globally |
| **CHROs & HR Leaders** | C-suite and VP-level HR executives | 500K+ globally |
| **HR Consultants** | Independent and firm-based HR consultants | 2M+ globally |
| **L&D Professionals** | Learning & Development specialists | 3M+ globally |
| **OD Specialists** | Organizational Development professionals | 1M+ globally |
| **HR Students** | University students pursuing HR degrees/certifications | 5M+ globally |

### Secondary Users
| Segment | Description |
|---|---|
| **Universities** | HR degree programs, business schools |
| **HR Associations** | SHRM chapters, CIPD, AHRM, national HR bodies |
| **Corporate Organizations** | HR departments seeking team tools, employer branding, hiring |
| **HR Tech Vendors** | ATS, HRIS, payroll, benefits platform providers |

---

## 4. User Roles & RBAC

### 4.1 Role Definitions

#### Super Admin
- Count: 1-3 accounts maximum
- Cannot be suspended by anyone except another Super Admin
- Has unrestricted access to all modules
- Manages platform configuration, other admins, AI configuration, global announcements
- Views audit logs, platform analytics, system health

#### Admin
- Count: 5-20 accounts
- Cannot modify Super Admin accounts or core platform configuration
- Manages day-to-day operations: users, organizations, communities, content, events
- Verifies HR professionals and organizations
- Sends announcements, views reports
- Manages: members, communities, events, blogs, certifications, learning resources, resources

#### Moderator
- Count: 50-200 accounts (may include trusted community members)
- Focuses on community moderation only
- Cannot manage platform settings, roles, permissions, or view analytics
- Reviews reported content, removes spam, moderates discussions
- Warns/suspends members (temporary), restores content
- Can pin discussions and community announcements

#### Member (Verified Professional)
- The primary platform user
- Has a verified professional profile
- Can create and manage their own content
- Full community participation: post, comment, connect, learn
- Earns reputation, badges, and recertification credits
- Uses AI assistant
- Cannot perform administrative or moderation actions

#### Member (Unverified)
- Registered but not yet verified
- Can browse and read all public content
- Can participate in basic community discussions (with "Unverified" label)
- Cannot publish blogs, create communities, or use AI assistant (limited to 5 queries/day)
- Verification pending — encouraged to complete profile verification

#### Guest
- Not registered
- Read-only access to public content (articles, public profiles, event listings)
- Can search content
- Must register to interact

### 4.2 Complete Permission Matrix

Legend: **✓** = Allowed | **◐** = Limited / Own Content Only | **✗** = Not Allowed

#### User Management

| Feature | Super Admin | Admin | Moderator | Member | Guest |
|---|---|---|---|---|---|
| View Public Content | ✓ | ✓ | ✓ | ✓ | ✓ |
| Register Account | ✓ | ✓ | ✓ | ✓ | ✓ |
| Login | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit Own Profile | ✓ | ✓ | ✓ | ✓ | ✗ |
| View Member Profiles | ✓ | ✓ | ✓ | ✓ | ✓ |
| Verify HR Professionals | ✓ | ✓ | ✗ | ✗ | ✗ |
| Verify Organizations | ✓ | ✓ | ✗ | ✗ | ✗ |
| Suspend Members | ✓ | ✓ | ✓ | ✗ | ✗ |
| Permanently Delete Members | ✓ | ✓ | ✗ | ✗ | ✗ |
| Restore Suspended Members | ✓ | ✓ | ✓ | ✗ | ✗ |
| Assign Roles | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage Permissions | ✓ | ✗ | ✗ | ✗ | ✗ |
| View Audit Logs | ✓ | Limited | ✗ | ✗ | ✗ |
| Configure Platform Settings | ✓ | ✗ | ✗ | ✗ | ✗ |

#### Community Management

| Feature | Super Admin | Admin | Moderator | Member | Guest |
|---|---|---|---|---|---|
| Create Community | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit Own Community | ✓ | ✓ | ✓ | ◐ | ✗ |
| Delete Own Community | ✓ | ✓ | ✓ | ◐ | ✗ |
| Delete Any Community | ✓ | ✓ | ✗ | ✗ | ✗ |
| Join Community | ✓ | ✓ | ✓ | ✓ | ✗ |
| Leave Community | ✓ | ✓ | ✓ | ✓ | ✗ |
| Pin Community Announcement | ✓ | ✓ | ✓ | ✗ | ✗ |

#### Discussions (Reddit-Enhanced)

| Feature | Super Admin | Admin | Moderator | Member | Guest |
|---|---|---|---|---|---|
| Create Post | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit Own Post | ✓ | ✓ | ✓ | ✓ | ✗ |
| Delete Own Post | ✓ | ✓ | ✓ | ✓ | ✗ |
| Delete Any Post | ✓ | ✓ | ✓ | ✗ | ✗ |
| Lock Discussion | ✓ | ✓ | ✓ | ✗ | ✗ |
| Pin Discussion | ✓ | ✓ | ✓ | ✗ | ✗ |
| Report Content | ✓ | ✓ | ✓ | ✓ | ✗ |
| Post Anonymously | ✓ | ✓ | ✓ | ✓ | ✗ |
| Comment | ✓ | ✓ | ✓ | ✓ | ✗ |
| React (Multi-Signal) | ✓ | ✓ | ✓ | ✓ | ✗ |
| Bookmark | ✓ | ✓ | ✓ | ✓ | ✗ |
| Promote to Knowledge Base | ✓ | ✓ | ✓ | ✗ | ✗ |

#### Blogs (HBR-Quality)

| Feature | Super Admin | Admin | Moderator | Member | Guest |
|---|---|---|---|---|---|
| Write Blog | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit Own Blog | ✓ | ✓ | ✓ | ✓ | ✗ |
| Delete Own Blog | ✓ | ✓ | ✓ | ✓ | ✗ |
| Delete Any Blog | ✓ | ✓ | ✗ | ✗ | ✗ |
| Publish Official Articles | ✓ | ✓ | ✗ | ✗ | ✗ |
| Feature Blog | ✓ | ✓ | ✓ | ✗ | ✗ |
| Peer Review Blog | ✓ | ✓ | ✓ | ✓ | ✗ |

#### Questions & Answers (StackOverflow-Enhanced)

| Feature | Super Admin | Admin | Moderator | Member | Guest |
|---|---|---|---|---|---|
| Ask Question | ✓ | ✓ | ✓ | ✓ | ✗ |
| Answer Question | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit Own Answer | ✓ | ✓ | ✓ | ✓ | ✗ |
| Delete Any Answer | ✓ | ✓ | ✓ | ✗ | ✗ |
| Mark Best Answer | ✓ | ✓ | ✓ | Question Owner | ✗ |
| Set Bounty (Urgency Credits) | ✓ | ✓ | ✓ | ✓ | ✗ |
| Suggest Edits to Others' Answers | ✓ | ✓ | ✓ | ✓ | ✗ |
| Review Queue Access | ✓ | ✓ | ✓ | Trust Lvl 5+ | ✗ |

#### Events

| Feature | Super Admin | Admin | Moderator | Member | Guest |
|---|---|---|---|---|---|
| Create Event | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit Own Event | ✓ | ✓ | ✓ | ✓ | ✗ |
| Delete Any Event | ✓ | ✓ | ✗ | ✗ | ✗ |
| Register for Event | ✓ | ✓ | ✓ | ✓ | ✗ |
| Download Certificate | ✓ | ✓ | ✓ | ✓ | ✗ |
| Host Audio/Video Room | ✓ | ✓ | ✓ | ✓ | ✗ |

#### Learning

| Feature | Super Admin | Admin | Moderator | Member | Guest |
|---|---|---|---|---|---|
| Create Course | ✓ | ✓ | ✗ | ✗ | ✗ |
| Edit Course | ✓ | ✓ | ✗ | ✗ | ✗ |
| Delete Course | ✓ | ✓ | ✗ | ✗ | ✗ |
| Enroll in Course | ✓ | ✓ | ✓ | ✓ | ✗ |
| Complete Assessment | ✓ | ✓ | ✓ | ✓ | ✗ |
| Earn Recertification Credits | ✓ | ✓ | ✓ | ✓ | ✗ |

#### AI Assistant

| Feature | Super Admin | Admin | Moderator | Member | Guest |
|---|---|---|---|---|---|
| Use AI (Unlimited) | ✓ | ✓ | ✓ | ✓ | ✗ |
| Use AI (Limited) | — | — | — | — | 5/day |
| Manage AI Knowledge Base | ✓ | ✓ | ✗ | ✗ | ✗ |
| Configure AI | ✓ | ✗ | ✗ | ✗ | ✗ |

#### New Features (Research-Added)

| Feature | Super Admin | Admin | Moderator | Member | Guest |
|---|---|---|---|---|---|
| Write Anonymous Employer Review | ✓ | ✓ | ✓ | ✓ | ✗ |
| Review HR Tech/Vendor | ✓ | ✓ | ✓ | ✓ | ✗ |
| Submit Salary Data | ✓ | ✓ | ✓ | ✓ | ✗ |
| Request Mentorship | ✓ | ✓ | ✓ | ✓ | ✗ |
| Offer Mentorship | ✓ | ✓ | ✓ | ✓ | ✗ |
| Join Study Group | ✓ | ✓ | ✓ | ✓ | ✗ |
| Create Study Group | ✓ | ✓ | ✓ | ✓ | ✗ |
| View Career Path | ✓ | ✓ | ✓ | ✓ | ✗ |
| Access HR News Feed | ✓ | ✓ | ✓ | ✓ | ✓ |
| Receive Compliance Alerts | ✓ | ✓ | ✓ | ✓ | ✗ |

---

## 5. Module Specifications

### Module 1 — Authentication & Onboarding

**Purpose**: Secure, frictionless entry with multi-provider SSO and progressive onboarding.

**Features**:
- Registration (email + password)
- Social login: Google, LinkedIn, Microsoft (OAuth 2.0)
- Email verification (mandatory before profile creation)
- Forgot/Reset password (with rate limiting)
- JWT with refresh token session management
- Progressive onboarding wizard (5 steps, can skip and return):
  1. Basic info (name, headline, location)
  2. Professional details (current role, company, experience)
  3. Specialties & interests (select from taxonomy)
  4. Credentials (upload certifications for verification)
  5. Community preferences (join recommended communities)

**NOT included (demoted from v1)**: Device management

---

### Module 2 — Professional Profile

**Purpose**: Rich, verified professional identity that serves as the member's home base.

**Profile Sections**:
- **Identity**: Name, profile photo, headline, public profile URL
- **About**: Professional summary (rich text, 2000 chars)
- **Current Position**: Title, company, start date, description
- **Experience**: Work history (company, title, dates, description)
- **Education**: Degrees, institutions, years
- **Certifications**: SHRM-CP, PHR, SPHR, CIPD, etc. (with verification badge)
- **Skills**: HR skills with self-assessment + peer endorsement
- **Specialties**: Areas of HR expertise (from controlled taxonomy)
- **Languages**: Spoken languages with proficiency
- **Location**: City, country, timezone (for compliance alerts)
- **Website & Social Links**: LinkedIn, Twitter, personal site

**Additional Features**:
- **Profile Completion Percentage**: Visual progress bar (0-100%)
- **Verification Badge**: Green checkmark for verified credentials
- **Contribution Score**: Aggregate of all platform contributions
- **Activity Timeline**: Public feed of recent activity (posts, answers, blogs)
- **Reputation Display**: Trust level, top badges, specialties
- **Anonymous Mode Toggle**: Members can post anonymously in discussions — profile hidden, but verified credential badge still visible (e.g., "Verified SHRM-CP, 10+ years")

---

### Module 3 — Professional Network

**Purpose**: Meaningful professional connections within the HR ecosystem.

**Connection Model**:
- **Follow**: One-way (like Twitter/LinkedIn). See their public posts and activity.
- **Connect**: Two-way (like LinkedIn). Mutual connection enables messaging and deeper engagement.
- **Connection Requests**: Include a short message (max 300 chars). Accept/Reject/Ignore.
- **Mutual Connections**: Displayed on profiles — "15 mutual connections"
- **Suggested Connections**: Algorithm-based: same company, same specialty, same community, same region
- **Remove Connection**: Soft removal — no notification sent
- **Block**: Prevent all interaction and visibility

**Search & Discovery**:
- Search by name, company, title, specialty, location, certification
- Filter by: specialty, experience level, country, certification, active/inactive
- Sort by: relevance, newest, most connections, highest reputation

---

### Module 4 — Organizations

**Purpose**: Company/organization profiles for employer branding and HR department visibility.

**Organization Profile**:
- Logo, banner image, name
- Description (rich text)
- Industry, company size, headquarters, office locations
- Website, social links
- HR Team members (linked member profiles)
- Culture highlights (employer-controlled)
- Open HR positions (v2)
- Events hosted
- Community posts from the organization

**Organization Verification**:
- Admin/verified members can claim organization profiles
- Verification requires: company email domain + LinkedIn page + optional business registration
- Verified organization gets blue checkmark

---

### Module 5 — Communities

**Purpose**: Curated spaces for HR specialties and interest groups.

**Community Structure**:
- Cover image, name, description, rules
- Community type: Public (open join) or Private (request to join, approval required)
- Moderators (assigned by admin or elected by community)
- Member count, activity stats
- Pinned announcements

**Community Types (Pre-Seeded)**:
- HR Technology & Innovation
- Talent Acquisition & Recruiting
- Compensation & Benefits
- HR Analytics & People Science
- HR Compliance & Employment Law
- Learning & Development
- Diversity, Equity & Inclusion
- Employee Relations & Engagement
- Organizational Development
- HR Leadership & Strategy
- Global HR & International Mobility
- Startup HR & Scaling
- HR Operations & Shared Services
- Wellness & Employee Wellbeing
- Performance Management
- HR Business Partnering

**Community Features**:
- Discussion feed (inherited from Module 6)
- Dedicated resource library (community-specific)
- Announcements (moderator-only)
- Polls (moderator + member)
- Events (linked to Module 10)
- Member directory (community-specific)
- Community statistics (posts/day, top contributors, growth)
- Community guidelines enforcement
- Study groups (linked to Module 11)

---

### Module 6 — Discussion Forum (Reddit-Enhanced)

**Purpose**: High-quality, professional HR discussions with verified credibility and quality signals.

**Content Types**:
- **Text Post**: Rich text with basic formatting (bold, italic, links, lists, code blocks)
- **Image Post**: Image upload with caption
- **Link Post**: URL with auto-preview (title, description, thumbnail)
- **Poll Post**: Question + 2-10 options, deadline, results visibility (immediate/after deadline)
- **Case Study Post**: Structured format (Situation → Challenge → Options → Your Approach → Outcome)

**Post Settings**:
- **Anonymous Mode**: Toggle to post without revealing identity (verified credential badge still shown)
- **Community**: Select which community to post in (or "General")
- **Tags**: 1-5 mandatory tags from HR taxonomy
- **Flair**: Content type indicator (Question, Discussion, Case Study, Tool Review, Career Advice, Debate, News, Vent/Rant)

**Interaction Model**:
- **Multi-Signal Reactions** (replace simple upvote/downvote):
  - 👍 Helpful (positive signal, +1 quality score)
  - 💡 Insightful (stronger positive signal, +2 quality score)
  - 🎯 From Experience (strongest positive, +3 quality score, only available to verified professionals)
  - ⚠️ Inaccurate (negative signal, flags for review)
  - 📌 Bookmark (personal save)
- **Nested Comments**: Up to 7 levels deep, with thread collapse
- **Share**: Copy link, share to community, share externally
- **Report**: With reason selection (spam, harassment, inaccurate, off-topic, sensitive content)

**Sorting Algorithms**:
- **Trending**: Time-decay + reaction velocity + credential-weighted quality score (DEFAULT)
- **Latest**: Chronological, newest first
- **Most Discussed**: Total comment count
- **Most Helpful**: Sum of "Helpful" + "Insightful" + "From Experience" reactions
- **Controversial**: High disagreement ratio (for debates)
- **Best**: Wilson score confidence interval + credential weighting (for comments within a thread)

**Moderation Tools** (for Moderators+):
- Pin/Lock discussion
- Remove post (soft delete → review queue → permanent delete)
- Warn member
- Suspend member (temporary, with reason and duration)
- Promote to Knowledge Base (curate high-quality discussions into permanent library)

---

### Module 7 — Questions & Answers (StackOverflow-Enhanced)

**Purpose**: Structured Q&A where questions get resolved and knowledge accumulates.

**Question Structure**:
- Title (max 200 chars, descriptive)
- Body (rich text, detailed problem description)
- Tags (1-5 mandatory, from HR taxonomy)
- Category (Compliance, Compensation, TA, ER, L&D, Tech, Legal, General)
- Urgency Level: Normal, High (legal deadline), Critical (termination/urgent action)
- Anonymous option
- Bounty (spend reputation points to boost visibility for urgent questions)

**Answer Structure**:
- Rich text body
- Supporting documents/links
- Code/policy snippets
- Edit history (transparent)

**Q&A Specific Features**:
- **Accepted Answer**: Question owner marks one answer as accepted (green checkmark). Accepted answer floats to top.
- **Bounty System**: Question owner can offer 50-500 reputation points as bounty. Bounty expires in 7 days. If no answer is accepted, highest-voted answer gets half the bounty.
- **Similar Questions**: Auto-suggested based on tags and title (prevents duplicates)
- **Tag Taxonomy**: Hierarchical tags across HR domains (see Database Schema)
- **Review Queues** (Trust Level 5+): First Posts, Late Answers, Triage (new vs existing question), Suggested Edits

**Search**:
- Full-text search across all questions and answers
- Filter by: tag, category, answered/unanswered, bounty, time range, reputation of answerer
- "People also asked" suggestions

---

### Module 8 — Blogs (HBR-Quality Content)

**Purpose**: Long-form, high-quality content with community involvement in quality control.

**Editor**: Rich text editor supporting:
- Headings (H1-H4)
- Paragraphs, bold, italic, underline, strikethrough
- Ordered and unordered lists
- Block quotes
- Images (upload + embed)
- Videos (embed from YouTube, Loom, Vimeo)
- Tables
- Code blocks
- Hyperlinks
- References/footnotes
- Table of contents (auto-generated)
- Callout boxes (tip, warning, info, example)

**Blog Workflow States**:
1. **Draft**: Author saves work-in-progress
2. **Peer Review**: Community members can review and provide feedback (comment-only, not edit)
3. **Editorial Review**: Admin/editor reviews for quality standards (HBR 5-criteria: Expertise, Evidence, Originality, Usefulness, Writing Quality)
4. **Published**: Live on the platform
5. **Featured**: Highlighted by editors on homepage and category pages
6. **Archived**: Removed from active feed, still searchable

**Blog Features**:
- Categories (controlled taxonomy)
- Tags (1-10)
- Featured image (required for published)
- Author profile (linked)
- Estimated reading time (auto-calculated)
- Comments (nested, same model as discussions)
- Multi-signal reactions (same as discussions)
- Bookmarks
- Share (link, community, external)
- Related articles (auto-suggested by tags)
- Series support (group related articles into a series)
- Newsletter integration (authors can have subscribers)

---

### Module 9 — Knowledge Hub

**Purpose**: Curated, permanent repository of HR knowledge. The "evergreen" layer of the platform.

**Content Types**:
- HR Templates (offer letters, performance review forms, onboarding checklists)
- HR Policies (sample policies across jurisdictions)
- Standard Operating Procedures (SOPs)
- Research Summaries (distilled from academic research)
- Whitepapers (vendor-neutral, expert-reviewed)
- Case Studies (structured: Situation → Challenge → Approach → Outcome → Lessons)
- Best Practices (consensus-based, peer-reviewed)
- Toolkits (curated collections of templates + guides for specific HR functions)
- Frameworks (visual models: competency frameworks, org design models, etc.)
- Checklists (step-by-step process guides)

**Content Quality**:
- All Knowledge Hub content goes through editorial review
- Content has version history
- Content has "Last Reviewed" and "Next Review" dates
- Content has quality rating from community (multi-signal reactions)
- Content can be "Promoted" from community discussions (Module 6)

**Organization**:
- Category tree (HR Operations, Talent Acquisition, Compensation, Compliance, L&D, ER, OD, Analytics, Technology, Legal)
- Tags
- Search (full-text + semantic via Elasticsearch)
- Filter by: type, category, tags, quality rating, date, jurisdiction
- "Most Used" and "Highest Rated" sorts

---

### Module 10 — Events

**Purpose**: Professional HR events — virtual, in-person, and hybrid.

**Event Types**:
- **Webinar**: Online presentation with Q&A (30-90 min)
- **Workshop**: Interactive online session (2-4 hours)
- **Conference**: Multi-session event (1-3 days)
- **Meetup**: Local in-person gathering
- **Panel Discussion**: Multiple speakers on a topic (60 min)
- **Expert AMA**: Scheduled Q&A with a verified expert (60 min)
- **Audio Roundtable**: Drop-in voice room for peer discussion (30-60 min)
- **Study Group Session**: Focused learning session for certification prep

**Event Features**:
- Title, description, cover image
- Date/time with timezone support
- Event type and format (virtual/in-person/hybrid)
- Speaker profiles (linked member profiles)
- Agenda/schedule
- Registration (with capacity limit)
- Calendar integration (Google Calendar, Outlook .ics)
- Reminder notifications (24h, 1h before)
- Live attendance tracking
- Recording (auto-recorded for virtual events, uploaded post-event)
- Certificates of attendance (auto-generated, downloadable PDF)
- Feedback form (post-event)
- Event series support (recurring events)
- Community-linked events (appear in community feed)

---

### Module 11 — Learning & Certifications

**Purpose**: HR-specific learning with progress tracking, assessments, and recertification credit integration.

**Course Structure**:
- **Modules**: Each course has 5-20 modules
- **Module Format**: Video (5-15 min) + reading material + knowledge check (3-5 questions)
- **Final Assessment**: 10-30 questions, 70% pass threshold
- **Certificate**: Auto-generated on completion
- **Recertification Credits**: Auto-awarded and tracked (SHRM PDCs, HRCI credits)

**Learning Features**:
- **Learning Paths**: Curated sequences of courses for specific goals (e.g., "Talent Acquisition Specialist Path," "HR Business Partner Path," "SHRM-CP Prep Path")
- **Progress Tracking**: Visual progress bar per course, per path, overall dashboard
- **Mobile-First**: Download videos for offline learning
- **Notes**: Take notes within each module (saved to profile)
- **Bookmarks**: Save specific module positions for later
- **Discussion**: Every module has a discussion thread (community-centered learning)
- **Peer Assignments**: Optional practical assignments with peer review

**Study Groups**:
- Members create/join study groups (5-15 members)
- Group progress dashboard
- Group discussion space
- Scheduled study sessions
- Accountability features (streaks, check-ins)

**Recertification Credit Tracking**:
- Dashboard shows: credits earned, credits needed, deadline, activities breakdown
- Auto-credit for: course completion, webinar attendance, event participation, contributing answers, publishing articles
- Manual credit submission (for external activities)
- Export credit report (for SHRM/HRCI submission)
- Integration with SHRM/HRCI credit submission APIs (v2)

---

### Module 12 — AI Assistant

**Purpose**: AI-powered HR productivity tool that augments (not replaces) professional judgment.

**AI Capabilities**:
1. **HR Policy Explanation**: Explain complex HR policies, regulations, and legal requirements in plain language
2. **HR Terminology**: Define and provide context for HR terms and acronyms
3. **Interview Question Generation**: Generate role-specific, behavioral, and situational interview questions
4. **Job Description Drafting**: Create comprehensive job descriptions from basic inputs (title, level, key responsibilities)
5. **Performance Review Suggestions**: Draft performance review feedback — positive, constructive, and developmental
6. **HR Email Drafting**: Compose professional HR emails (offer letters, rejection emails, policy updates, investigation follow-ups)
7. **HR Document Summarization**: Summarize long HR documents, research papers, policy documents
8. **Resume Feedback**: Analyze resumes for HR roles and provide improvement suggestions
9. **HR Research Assistance**: Find relevant HR research, case law, and best practices on specific topics
10. **Compliance Explanation**: Explain labor laws and compliance requirements by jurisdiction (with legal disclaimer)
11. **Meeting Agenda Generation**: Create structured meeting agendas for HR meetings (one-on-ones, investigations, policy reviews)
12. **Onboarding Checklist Creation**: Generate role-specific onboarding checklists
13. **Exit Interview Analysis**: Analyze exit interview responses for patterns and themes
14. **Employee Survey Design**: Create effective employee survey questions for specific purposes (engagement, pulse, 360)
15. **Policy Comparison**: Compare HR policies across jurisdictions (e.g., leave policies across US states or countries)

**AI Content Disclosure**:
- All AI-generated content is clearly labeled: "Generated by HRShakti AI — Review and verify before use"
- AI content is visually distinct from human-created platform content
- AI cannot be used to generate community posts, blog articles, or Q&A answers (prevents AI spam)
- AI has a built-in legal disclaimer for compliance and legal topics

**AI Usage Limits**:
- Free/Guest: 5 queries/day
- Member: Unlimited queries
- Rate limiting: 30 queries/hour, 200 queries/day (prevent abuse)

---

### Module 13 — Global Search

**Purpose**: Find anything on the platform quickly and accurately.

**Search Sources**: Members, Organizations, Communities, Discussions, Q&A, Blogs, Events, Courses, Knowledge Hub resources

**Search Features**:
- **Keyword Search**: Full-text search via Elasticsearch/OpenSearch
- **Semantic Search**: AI-powered understanding of search intent (v2)
- **Auto-Suggestions**: As-you-type suggestions with result type indicators
- **People Also Asked**: Related search suggestions
- **Advanced Filters**: Category, skills, country, experience level, tags, date range, content type
- **Saved Searches**: Save frequently used search queries
- **Search Within**: Filter results within a specific community, topic, or content type

**Performance**: Search results in < 500ms

---

### Module 14 — Notifications

**Purpose**: Keep members informed without overwhelming them.

**Notification Triggers**:
- New follower, connection request accepted
- Comment/reply on your content
- Reaction on your content
- Answer accepted on your question
- Community invitation, community announcement
- Blog approved/featured, peer review requested
- Event reminder (24h, 1h before), event starting
- Course completed, certificate earned, recertification credit earned
- Mentorship request, study group invitation
- Compliance alert (new regulation in your jurisdiction)
- System announcement

**Notification Channels**:
- **In-App**: Notification bell with unread count, categorized (All, Mentions, Community, Learning, System)
- **Email**: Digest (daily/weekly), immediate (for important: connection requests, event reminders, compliance alerts)
- **Push** (v2, mobile app): Configurable per notification type

**Notification Preferences**:
- Per-type on/off for both in-app and email
- Quiet hours setting
- "Mention only" mode (only notify when @mentioned)

---

### Module 15 — Messaging

**Purpose**: Private, professional communication between connected members.

**Features**:
- One-to-one text chat
- Image/file sharing
- Read receipts (show when message was read)
- Message search within conversation
- Message reactions
- Link previews
- Typing indicator (for active conversation only)

**NOT included (demoted from v1)**: Group messaging, voice/video calls (v2), typing indicator for all states

---

### Module 16 — Mentorship

**Purpose**: Connect HR professionals for structured mentoring relationships.

**Mentorship Model**:
- Members can offer mentorship (set availability, specialties, mentoring style)
- Members can request mentorship (specify goals, preferred mentor profile)
- Algorithmic matching based on: career stage, specialty, goals, location/timezone, availability
- Mentor and mentee both must accept the match
- Structured mentoring framework: Goal setting → Regular check-ins → Progress tracking → Feedback

**Features**:
- Mentor profiles with specialties, experience, mentee reviews
- Mentee profiles with goals, expectations
- Matching suggestions (weekly)
- In-app messaging for mentor-mentee communication
- Goal tracking dashboard
- Session scheduling
- Feedback after each session
- Mentorship duration (3-6 months, renewable)

---

### Module 17 — Employer Reviews & Salary Benchmarking

**Purpose**: Transparent, verified employer intelligence from the HR professional's perspective.

**HR Department Reviews**:
- Anonymous posting with verified HR credential badge
- Structured format (adapted from Glassdoor):
  - Overall rating (1-5 stars)
  - Dimensional ratings: Leadership Support for HR, HR Budget & Resources, HR Tech Stack Quality, Workload & Burnout Level, HR Influence on Strategy, Team Culture, Career Growth Opportunities
  - Pros (text, required)
  - Cons (text, required)
  - Advice to HR Leadership (optional)
  - Role/tenure at the company
  - Company size, industry, location
- Company can respond publicly (with verified company account)
- Threaded discussion on reviews

**HR Tech Vendor Directory**:
- Vendor profiles (ATS, HRIS, payroll, benefits, LMS, recruitment marketing, etc.)
- User reviews with ratings (Ease of Use, Features, Value, Support, Integration)
- Comparison tool (side-by-side vendor comparison)
- Filter by: category, company size, price range, deployment type
- Vendor can claim profile and respond to reviews

**Verified Salary Benchmarking**:
- Members submit salary data with verification (paystub/offer letter upload)
- Data points: title, company, location, base salary, bonus, total comp, years of experience, company size, industry
- Time-weighted (recent data weighted more heavily)
- Standardized job level mapping
- Filter by: title, industry, company size, region, experience
- Aggregated views with percentile ranges
- Personal salary report (compared to market)

---

### Module 18 — Career Pathing

**Purpose**: Help HR professionals plan and navigate their career progression.

**Career Paths**:
- Pre-defined HR career maps:
  - HR Generalist Path: Coordinator → Generalist → Senior Generalist → HR Manager → HR Director → VP HR → CHRO
  - Talent Acquisition Path: Coordinator → Recruiter → Senior Recruiter → TA Manager → Head of TA → VP Talent
  - L&D Path: Training Coordinator → L&D Specialist → L&D Manager → Head of L&D → VP People Development
  - HR Business Partner Path: HR BP → Senior HR BP → HR BP Lead → HR Director → CHRO
  - Compensation & Benefits Path: C&B Analyst → C&B Manager → Total Rewards Director → VP Total Rewards
  - HR Analytics Path: HR Analyst → People Analyst → Head of People Analytics → VP People Science
- Each path shows: typical timeline, required skills, recommended certifications, key responsibilities at each level

**Features**:
- Self-assessment against current level
- Skill gap identification
- Recommended learning (courses, certifications, experiences)
- Mentorship suggestions based on career goals
- Peer comparison (anonymized, aggregate)

---

### Module 19 — HR News & Compliance Alerts

**Purpose**: Keep HR professionals informed of regulatory changes, industry trends, and news.

**HR News Feed**:
- AI-curated HR news from trusted sources
- Categories: Regulation, Technology, Trends, Research, Opinion
- Personalized based on user's specialty, location, and interests
- Member-submitted news (with editorial review)
- Commenting and discussion on news items

**Compliance Alerts**:
- Location-aware: Based on member's country/state/jurisdiction
- Types: New legislation, regulatory updates, filing deadlines, compliance requirements
- Push notification for critical alerts
- Summary of what changed and what HR needs to do
- Link to relevant Knowledge Hub resources

---

### Module 20 — Reputation & Gamification

**Purpose**: Recognize professional contributions with meaningful, functional rewards.

**Trust Levels** (replacing simple reputation points):

| Level | Name | Requirements | Unlocked Privileges |
|---|---|---|---|
| 1 | Newcomer | Registered, email verified | Create posts, comment, basic profile |
| 2 | Member | Verified professional credential | Full community access, AI assistant, publish blogs |
| 3 | Contributor | 10+ helpful answers, 3+ blog posts | Peer review access, suggest edits, create communities |
| 4 | Trusted | 50+ helpful answers, 10+ promoted to KB | Review queue access, advanced filters, bounty setting |
| 5 | Expert | 100+ helpful answers, 25+ promoted to KB, peer endorsed | Approve/reject peer edits, mentor badge, community moderator eligibility |
| 6 | Authority | 200+ helpful answers, expert in 2+ specialties, 1+ year tenure | Category moderator, case study publication, featured blog |
| 7 | Legend | 500+ helpful answers, top 1% contributor, 2+ year tenure | Platform ambassador, advisory board eligibility, custom badge |

**Badges** (Professional Value, Not Vanity):

| Badge | How to Earn | Meaning |
|---|---|---|
| First Answer | Answer your first question | Getting started |
| Problem Solver | 10 accepted answers | Consistently helpful |
| Knowledge Keeper | 5 answers promoted to Knowledge Base | Creates lasting value |
| Community Builder | Create a community with 100+ members | Builds community |
| Mentor | Complete 3+ mentorship relationships | Develops others |
| Certified | Verified SHRM-CP/SCP, PHR/SPHR, or equivalent | Credentialed professional |
| Top Contributor | Top 10 contributor in a specialty this month | Active expert |
| Course Creator | Create an approved course | Shares knowledge |
| Case Study Author | Publish a peer-reviewed case study | Thought leader |
| Streak (7/30/100/365) | Consecutive days of activity | Consistent presence |

**Reputation Scoring** (behind the scenes, not displayed as a single number):
- Answer helpfulness: +2 per "Helpful", +4 per "Insightful", +6 per "From Experience"
- Blog quality: +5 per published, +10 per featured, +15 per peer-endorsed
- Community participation: +1 per comment, +3 per resource shared
- Learning: +2 per course completed
- Mentoring: +5 per completed mentorship
- Penalties: -10 for reported and confirmed inaccurate content, -50 for suspension

---

### Module 21 — Analytics (Admin Dashboard)

**Purpose**: Platform health monitoring and growth tracking for administrators.

**Super Admin Dashboard**:
- Total Members, New Members (daily/weekly/monthly)
- Active Members (DAU, WAU, MAU)
- Communities: Total, Active, Growth Rate
- Content: Discussions, Q&A, Blogs, Knowledge Hub
- Learning: Course Enrollments, Completions, Certificates Issued
- AI Usage: Queries/day, Most Used Features, User Satisfaction
- Events: Upcoming, Attendance Rate, Satisfaction Score
- Revenue: Subscriptions, Conversions, Churn Rate
- Moderation: Reports, Actions Taken, Response Time

**Admin Dashboard** (subset):
- Member management (search, verify, suspend, restore)
- Content management (blogs, events, communities)
- Reports (exportable CSV/PDF)

---

### Module 22 — Admin Panel

**Purpose**: Administrative control over all platform operations.

**Sections**:
- User Management (search, verify, suspend, restore, role assignment)
- Organization Management (verify, edit, remove)
- Community Management (create, edit, delete, assign moderators)
- Content Management (blogs, resources, knowledge hub)
- Event Management (create, edit, approve, feature)
- Course Management (create, edit, approve, manage enrollments)
- Certification Management (manage certification types, track credits)
- Resource Management (knowledge hub, templates, policies)
- Report Management (view/export reports)
- Notification Management (send announcements, manage system notifications)
- Moderation Queue (review reported content, take action)

---

### Module 23 — Moderation

**Purpose**: Maintain content quality and community standards.

**Moderation Tools**:
- **Reported Content Queue**: User-flagged content with reason, reporter, timestamp
- **Content Review**: Approve, remove, or escalate reported content
- **Spam Detection**: Auto-flag potential spam (new accounts, link-heavy posts, repetitive content)
- **Content Actions**: Warn member, remove content (soft delete), lock discussion, pin/unpin
- **Member Actions**: Warn, suspend (temporary with duration), recommend for permanent ban
- **Content Restoration**: Restore soft-deleted content
- **Audit Trail**: Every moderation action logged (actor, action, reason, timestamp, affected resource)

**AI-Assisted Moderation**:
- Auto-detect: spam, harassment, personal information (PII), HR-sensitive content (salaries, medical info)
- Auto-flag for human review (never auto-remove)
- Suggest community rules violations
- Detect duplicate questions/discussions
- Legal disclaimer injection for sensitive topics

---

## 6. Non-Functional Requirements

### Performance
- Page load time: < 2 seconds (P95)
- API response time: < 300ms average, < 1s (P99)
- Search response time: < 500ms
- Concurrent users: Support 100,000+ concurrent users
- Database query time: < 100ms for indexed queries
- CDN for static assets with edge caching

### Availability
- 99.9% uptime SLA
- Multi-AZ deployment
- Automatic failover
- Read replicas for database

### Scalability
- Horizontal scaling for application servers (stateless)
- Distributed caching (Redis cluster)
- Database read replicas + connection pooling
- Message queue for async operations (RabbitMQ/Kafka)
- CDN for media assets (S3 + CloudFront)
- Auto-scaling based on load metrics

### Security
- HTTPS only (TLS 1.3)
- Password hashing: Argon2id
- OAuth 2.0 + JWT with refresh tokens
- Role-Based Access Control (RBAC)
- Secure session management (httpOnly, secure, SameSite cookies)
- Input validation and sanitization (server-side)
- CSRF protection (double-submit cookie pattern)
- XSS protection (Content Security Policy, output encoding)
- SQL injection prevention (parameterized queries / ORM)
- Rate limiting on all endpoints
- Audit logging for all administrative actions
- PII detection and masking for anonymous content
- Encrypted storage for sensitive data (salary data, reviews)

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Screen reader compatibility (ARIA labels, semantic HTML)
- Responsive design: Desktop (1280px+), Tablet (768-1279px), Mobile (< 768px)
- Minimum touch target size: 44x44px
- Color contrast ratio: 4.5:1 minimum
- Focus indicators on all interactive elements
- Skip navigation links
- Alt text for all images

---

## 7. Guiding Principles

1. **Community First**: Every feature should encourage collaboration and knowledge sharing over passive consumption.

2. **Verified Credibility**: Professional profiles, verified credentials, and credential-weighted content signals ensure quality and trust.

3. **Quality Over Quantity**: The algorithm prioritizes professional quality over popularity. One insightful answer from a verified CHRO is worth more than 50 generic responses.

4. **Security by Design**: Protect user data, enable anonymous discussion for sensitive topics, and maintain audit trails for all administrative actions.

5. **AI as Assistant, Not Replacement**: AI enhances HR productivity but never replaces professional judgment. All AI content is clearly labeled and requires human review.

6. **Knowledge Persistence**: Community discussions should not die. High-quality contributions get promoted to a permanent, searchable knowledge base.

7. **Scalable Architecture**: Modular design allows each module to evolve independently while integrating seamlessly.

8. **Mobile-First**: HR professionals are busy and mobile. Every feature must work beautifully on mobile before desktop.

9. **Recertification as Retention**: Automatic credit tracking for every platform activity creates the strongest retention hook in the HR space.

10. **Dual Identity**: HR professionals need both professional credibility (verified profiles) and safe spaces for honest discussion (anonymous mode). Both must coexist.

---

*This product specification is implementation-ready. It should be read alongside the Technical Architecture (03), Database Schema (04), API Contracts (05), UI/UX Blueprint (06), and Auth/RBAC/Security (07) documents for complete implementation guidance.*