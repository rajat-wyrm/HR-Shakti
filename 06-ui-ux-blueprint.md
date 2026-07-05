# HRShakti — UI/UX Blueprint

> **Document Type**: UI/UX Design Specification  
> **Version**: 1.0  
> **Date**: 2026-07-05  
> **Design System**: Tailwind CSS 4 + shadcn/ui  
> **Responsive**: Desktop (1280+), Tablet (768-1279), Mobile (<768)  

---

## 1. Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | #6366F1 (Indigo 500) | Primary buttons, links, active states, brand identity |
| `primary-dark` | #4F46E5 (Indigo 600) | Primary hover states |
| `primary-light` | #EEF2FF (Indigo 50) | Primary backgrounds, badges |
| `secondary` | #0EA5E9 (Sky 500) | Secondary actions, information |
| `accent` | #F59E0B (Amber 500) | Highlights, warnings, attention, bounties |
| `success` | #22C55E (Green 500) | Success states, accepted answers, online status |
| `danger` | #EF4444 (Red 500) | Errors, destructive actions, inaccurate flag |
| `warning` | #F97316 (Orange 500) | Warning states |
| `neutral-50` | #F8FAFC | Page backgrounds |
| `neutral-100` | #F1F5F9 | Card backgrounds |
| `neutral-200` | #E2E8F0 | Borders, dividers |
| `neutral-500` | #64748B | Secondary text |
| `neutral-700` | #334155 | Body text |
| `neutral-900` | #0F172A | Headings, primary text |
| `anonymous-purple` | #8B5CF6 (Violet 500) | Anonymous post indicator |
| `ai-gradient` | #6366F1 → #8B5CF6 → #EC4899 | AI assistant branding gradient |

### Typography

| Element | Font | Size | Weight | Line Height |
|---|---|---|---|---|
| H1 (Page Title) | Inter | 30px | 700 | 1.2 |
| H2 (Section) | Inter | 24px | 600 | 1.3 |
| H3 (Card Title) | Inter | 20px | 600 | 1.4 |
| H4 (Subsection) | Inter | 18px | 600 | 1.4 |
| Body | Inter | 16px | 400 | 1.6 |
| Body Small | Inter | 14px | 400 | 1.5 |
| Caption | Inter | 12px | 400 | 1.4 |
| Code | JetBrains Mono | 14px | 400 | 1.5 |

### Spacing Scale
4px base unit: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px

### Border Radius
- `sm`: 6px (badges, tags)
- `md`: 8px (cards, inputs, buttons)
- `lg`: 12px (modals, panels)
- `xl`: 16px (large cards)
- `full`: 9999px (avatars, pills)

### Shadows
- `sm`: `0 1px 2px rgba(0,0,0,0.05)`
- `md`: `0 4px 6px rgba(0,0,0,0.07)`
- `lg`: `0 10px 15px rgba(0,0,0,0.1)`
- `xl`: `0 20px 25px rgba(0,0,0,0.1)`

### Component Library (shadcn/ui)
Use shadcn/ui for all base components: Button, Input, Select, Dialog, Sheet, DropdownMenu, Tabs, Card, Badge, Avatar, Tooltip, Toast, Form, Command, Popover, Calendar, ScrollArea, Separator, Skeleton, Switch, Textarea, Checkbox, RadioGroup.

---

## 2. Layout Architecture

### Desktop Layout (1280px+)
```
┌──────────────────────────────────────────────────────────────────┐
│ Header (64px height, fixed top, white bg, border-bottom)        │
│ [Logo] [Search Bar (expandable)]        [Feed] [Network] [...]  │
│                                           [Bell] [Messages] [Me]│
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──── Main Content Area (max-w-6xl, centered) ────────────────┐ │
│  │                                                             │ │
│  │   Page Content                                              │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                    │
├──────────────────────────────────────────────────────────────────┤
│ Footer (if applicable)                                            │
└──────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)
```
┌──────────────────────────────┐
│ Header (56px)                 │
│ [Logo]           [Bell] [Me] │
├──────────────────────────────┤
│                              │
│  Full-width content          │
│  (no sidebar)                │
│                              │
├──────────────────────────────┤
│ Bottom Nav (56px, fixed)     │
│ [Home] [Community] [AI] [+] │
│ [Network] [Profile]          │
└──────────────────────────────┘
```

### Header Component
- **Left**: HRShakti logo (click → home feed)
- **Center**: Global search bar (expandable on click → full search overlay)
- **Right**: Navigation links (Feed, Network, Communities, Learning) + Notification bell (with unread count badge) + Messages icon (with unread badge) + User avatar (dropdown: Profile, Settings, AI Assistant, Admin Panel, Logout)
- **Mobile**: Hamburger menu for navigation, bell + avatar on right

---

## 3. Page Specifications

### 3.1 Landing Page (Guest)
**Route**: `/`
**Layout**: Centered hero, no header sidebar

**Sections**:
1. **Hero Section** (full viewport height):
   - Large headline: "The Professional Home for HR"
   - Subheadline: "Connect, learn, and grow with 50,000+ HR professionals worldwide"
   - CTA: "Join Free" (primary button) + "See What's Inside" (secondary, scrolls down)
   - Background: Subtle gradient with abstract HR-themed illustration

2. **Social Proof Bar**: "Trusted by HR professionals at Google, Microsoft, Amazon, and 500+ companies"

3. **Value Prop Cards** (3 cards, horizontal):
   - "Verified Community" — Connect with credentialed HR professionals
   - "AI-Powered Tools" — Get instant HR policy explanations, JD drafting, and more
   - "Learn & Earn Credits" — Courses that count toward your SHRM/HRCI recertification

4. **Feature Showcase** (alternating image + text):
   - Professional Networking
   - Community Discussions
   - Knowledge Hub
   - AI Assistant
   - Learning & Certifications

5. **Testimonials** (carousel)

6. **Pricing**: Free / Pro ($19/mo) / Executive ($49/mo)

7. **CTA Section**: "Ready to join the HR community?" + "Create Free Account"

8. **Footer**: Links, social, copyright

---

### 3.2 Home Feed (Member)
**Route**: `/feed`
**Layout**: Main layout with header

**Content Structure** (two-column on desktop):
```
┌─────────────────────────────┬──────────────────────┐
│ Feed Column (2/3 width)     │ Right Sidebar (1/3)   │
│                              │                       │
│ [Create Post Button]         │ ┌─────────────────┐  │
│                              │ │ My Profile Card  │  │
│ ┌──────────────────────────┐ │ │ [Avatar] Name    │  │
│ │ Sort: [Trending ▾]      │ │ │ Trust Level 3    │  │
│ │ Filter: [All] [Following]│ │ │ 45 answers       │  │
│ └──────────────────────────┘ │ └─────────────────┘  │
│                              │                       │
│ ┌──────────────────────────┐ │ ┌─────────────────┐  │
│ │ Discussion Card          │ │ │ Trending Topics  │  │
│ │ [Flair: Question]        │ │ │ #remote-work     │  │
│ │ Title (bold)             │ │ │ #ai-in-hr        │  │
│ │ Body preview (2-3 lines) │ │ │ #performance-mgmt│  │
│ │ Tags: [remote] [policy]  │ │ └─────────────────┘  │
│ │ [Avatar] Name · 2h ago  │ │                       │
│ │ [👍 24] [💡 8] [💬 15]  │ │ ┌─────────────────┐  │
│ │ [📌] [🔗]                │ │ │ Suggested People │  │
│ └──────────────────────────┘ │ │ [Avatar] Name    │  │
│                              │ │ [Connect]        │  │
│ ┌──────────────────────────┐ │ │ [Avatar] Name    │  │
│ │ Question Card             │ │ │ [Connect]        │  │
│ │ [🟢 Accepted Answer]     │ │ └─────────────────┘  │
│ │ Title                    │ │                       │
│ │ Bounty: 100 pts 🏆       │ │ ┌─────────────────┐  │
│ │ Answers: 5 · Views: 234  │ │ │ Upcoming Events  │  │
│ └──────────────────────────┘ │ │ Event 1 · Jul 15  │  │
│                              │ │ Event 2 · Jul 20  │  │
│ (More cards...)              │ └─────────────────┘  │
│                              │                       │
│                              │ ┌─────────────────┐  │
│                              │ │ Compliance Alert │  │
│                              │ │ ⚠️ New CA PTO law│  │
│                              │ └─────────────────┘  │
└─────────────────────────────┴──────────────────────┘
```

**Feed Card Component** (shared between discussions, questions, blogs):
- Flair badge (top-left, colored)
- Anonymous indicator (purple badge with verified credential)
- Title (bold, truncated to 2 lines)
- Body preview (3 lines, truncated)
- Tags (horizontal scroll of small badges)
- Author row: Avatar + Name + Time ago + Community name
- Reaction bar: Helpful (👍) count, Insightful (💡) count, From Experience (🎯) count, Comment (💬) count
- Action icons: Bookmark (📌), Share (🔗), More menu (⋯)
- For questions: Bounty badge if applicable, Accepted Answer indicator
- For blogs: Reading time, View count
- Skeleton loading state

---

### 3.3 Discussion Detail Page
**Route**: `/discussions/:id`

**Layout**:
```
┌─────────────────────────────┬──────────────────────┐
│ Discussion (2/3)            │ Sidebar (1/3)         │
│                              │                       │
│ ┌──────────────────────────┐ │ ┌─────────────────┐  │
│ │ Title (H1)               │ │ │ Community Info   │  │
│ │ [Flair] [Anonymous 🟣]   │ │ │ Name + Members   │  │
│ │ Tags: [tag1] [tag2]     │ │ │ [Join/Leave]     │  │
│ │ Posted by [Name] · 2h    │ │ │ Rules            │  │
│ │ [Follow Author]          │ │ │ Related Posts    │  │
│ │                          │ │ └─────────────────┘  │
│ │ Full body content        │ │                       │
│ │ (rich text rendered)     │ │ ┌─────────────────┐  │
│ │                          │ │ │ If promoted to   │  │
│ │ Reactions bar            │ │ │ Knowledge Base:  │  │
│ │ [👍 24] [💡 8] [🎯 3]   │ │ │ [View in KB]     │  │
│ │ [Bookmark] [Share] [⋯]  │ │ └─────────────────┘  │
│ └──────────────────────────┘ │                       │
│                              │                       │
│ Comments Section             │                       │
│ Sort: [Best] [New] [Old]    │                       │
│                              │                       │
│ ┌──────────────────────────┐ │                       │
│ │ Comment (depth 0)        │ │                       │
│ │ [Avatar] Name · 1h       │ │                       │
│ │ Comment body             │ │                       │
│ │ [👍 5] [💡 2] [Reply]    │ │                       │
│ │                          │ │                       │
│ │  ┌─── Reply (depth 1) ──┐│                       │
│ │  │ [Avatar] Name · 45m  ││                       │
│ │  │ Reply body            ││                       │
│ │  │ [👍 2] [Reply]        ││                       │
│ │  │                      ││                       │
│ │  │   ┌─ Reply (d2) ─┐  ││                       │
│ │  │   │ Nested reply  │  ││                       │
│ │  │   └──────────────┘  ││                       │
│ │  └──────────────────────┘│                       │
│ └──────────────────────────┘ │                       │
│                              │                       │
│ [Write a Comment]            │                       │
│ ┌──────────────────────────┐ │                       │
│ │ [Toggle Anonymous 🟣]    │ │                       │
│ │ [Rich text textarea]     │ │                       │
│ │ [Post Comment]           │ │                       │
│ └──────────────────────────┘ │                       │
└─────────────────────────────┴──────────────────────┘
```

**Comment Nesting**: Indent with left border color (depth 0: no indent, depth 1: 24px indent + primary border, depth 2: 48px + lighter border, etc.). Collapse after depth 3 with "Continue this thread →" link.

---

### 3.4 Q&A Question Detail
**Route**: `/questions/:id`

Similar layout to Discussion but with:
- **Question Box**: Title + body + tags + urgency badge + bounty badge
- **Answer Count**: "5 Answers" with sort: Best (accepted first) / Newest / Most Helpful
- **Answer Cards**:
  - Accepted answer: Green left border + "✓ Accepted" badge
  - Author info with trust level badge
  - Answer body (rich text)
  - Reaction bar
  - Edit history (if edited): "Edited 2 hours ago by [Name]"
  - "Suggest Edit" button (Trust Level 3+)
- **Write Answer**: Rich text editor + submit button
- **Sidebar**: Similar questions, related tags, question stats

---

### 3.5 Profile Page
**Route**: `/profile/:username`

**Layout**:
```
┌──────────────────────────────────────────────────────────┐
│ Profile Header (Banner Image + Avatar + Info)            │
│                                                           │
│  [Banner Image - 1200x300]                               │
│  [Avatar - 120x120, overlapping banner]                  │
│  Name (H1)                                  [Edit] [⋯]   │
│  Headline                                                 │
│  Location · Trust Level 3: Contributor                   │
│  [Follow] [Connect] [Message]                            │
│  [SHRM-CP ✓] [8 yrs experience]                         │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ Tabs: [About] [Activity] [Answers] [Blogs] [Learning]   │
├──────────────────────────────────────────────────────────┤
│ Tab Content Area                                         │
│                                                           │
│ About Tab:                                               │
│ - About text                                             │
│ - Experience section (company, title, dates)             │
│ - Education section                                      │
│ - Certifications (with verification badges)              │
│ - Skills (with endorsement counts)                       │
│ - Specialties                                            │
│ - Languages                                              │
│ - Connection count, follower count                       │
│                                                           │
│ Activity Tab:                                            │
│ - Timeline of recent posts, answers, comments            │
│                                                           │
│ Answers Tab:                                             │
│ - List of answers with question title link               │
│                                                           │
│ Learning Tab:                                            │
│ - Courses in progress, completed, certificates           │
│ - Recertification credit progress                         │
│ - Badges earned                                          │
└──────────────────────────────────────────────────────────┘
```

---

### 3.6 AI Assistant Page
**Route**: `/ai`

**Layout**: Full-height chat interface (like ChatGPT)

```
┌──────────────────────────────────────────────────────────┐
│ Header: "HRShakti AI" + [New Chat] + [History]           │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Welcome message:                                         │
│  "Hi Priya! I'm your HR assistant. I can help with:       │
│   - Policy explanation                                    │
│   - Interview question generation                         │
│   - Job description drafting                              │
│   - Performance review suggestions                        │
│   - HR email drafting                                     │
│   - Compliance questions                                  │
│   What would you like help with?"                         │
│                                                           │
│  ┌──────────────────────────────────────────┐            │
│  │ [Capability Quick-Select Buttons]        │            │
│  │ [Policy] [JD Draft] [Interview Qs]      │            │
│  │ [Email] [Review] [Compliance] [More ▾]   │            │
│  └──────────────────────────────────────────┘            │
│                                                           │
│  Chat messages area (scrollable):                         │
│                                                           │
│  ┌─ User Message ─────────────────────────────┐          │
│  │ "What are the key components of a          │          │
│  │  performance improvement plan?"             │          │
│  └────────────────────────────────────────────┘          │
│                                                           │
│  ┌─ AI Response ──────────────────────────────┐          │
│  │ ⚠️ AI Generated — Review before use         │          │
│  │                                           │          │
│  │ A Performance Improvement Plan (PIP)       │          │
│  │ typically includes:                        │          │
│  │ 1. **Performance Gap Identification**...    │          │
│  │ 2. **Specific Goals**...                   │          │
│  │ 3. **Support Resources**...                │          │
│  │ 4. **Timeline**...                         │          │
│  │ 5. **Consequences**...                     │          │
│  │                                           │          │
│  │ 📎 Sources: [PIP Best Practices Guide]     │          │
│  │    [Discussion: PIP Experiences]           │          │
│  │                                           │          │
│  │ [👍 Helpful] [👎 Not Helpful] [Copy]       │          │
│  └────────────────────────────────────────────┘          │
│                                                           │
├──────────────────────────────────────────────────────────┤
│ Input Area:                                               │
│ [Rich text input] [📎 Attach] [Send ▶]                   │
│ "Be specific for better results. AI responses are for     │
│  reference only — always verify with official sources."   │
└──────────────────────────────────────────────────────────┘
```

**AI Response Features**:
- Streaming text (character by character)
- Markdown rendering (bold, lists, headings, code blocks)
- Source citations (clickable, open in new tab)
- AI disclaimer banner (always visible)
- Rate response (helpful / not helpful / inaccurate)
- Copy to clipboard

---

### 3.7 Community Page
**Route**: `/communities/:slug`

**Layout**: Three sections:
1. **Community Header**: Cover image, name, member count, description, [Join/Leave] button
2. **Community Navigation Tabs**: [Discussions] [About] [Members] [Resources] [Events]
3. **Content Area**: Based on selected tab

**Discussions Tab**: Same feed layout as home but filtered to this community.
**Members Tab**: Member list with search and role badges.
**Resources Tab**: Community-specific knowledge hub resources.

---

### 3.8 Blog Editor
**Route**: `/blogs/write`

**Layout**: Full-width editor

```
┌──────────────────────────────────────────────────────────┐
│ [← Back to Blogs]           [Save Draft] [Submit Review] │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ Title Input (H1 size, no border, placeholder: "Title")   │
│                                                           │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Rich Text Editor Toolbar:                            │ │
│ │ [B] [I] [U] [H1][H2][H3] [🔗][📷][📹][📊]        │ │
│ │ [UL][OL][📋][⬛][→←][📋ref][💡callout]              │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌──────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │  [Content editing area - full width, min 600px tall]│ │
│ │                                                     │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                           │
│ Right Panel (floating on desktop):                       │
│ ┌────────────────────┐                                   │
│ │ Category [Select ▾]│                                   │
│ │ Tags [Add tags...] │                                   │
│ │ Featured Image     │                                   │
│ │ [Upload Image]     │                                   │
│ │ Series [Select ▾]  │                                   │
│ │                    │                                   │
│ │ Word Count: 1,234  │                                   │
│ │ Reading: 5 min     │                                   │
│ └────────────────────┘                                   │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

### 3.9 Learning Dashboard
**Route**: `/learning/my-learning`

**Layout**:
```
┌──────────────────────────────────────────────────────────┐
│ My Learning                                               │
│                                                           │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Recertification Credits Progress                      │ │
│ │ SHRM PDCs: [████████░░░░░░░░░] 25/60  |  Due: Jun  │ │
│ │ HRCI:     [████░░░░░░░░░░░░░░░] 10/60  |  Due: Jun  │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                           │
│ In Progress (3)                                          │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│ │ [Cover]     │ │ [Cover]     │ │ [Cover]     │         │
│ │ Course Name │ │ Course Name │ │ Course Name │         │
│ │ [████░░] 45%│ │ [██░░░░] 20%│ │ [██████] 80%│         │
│ │ Module 5/12 │ │ Module 2/10 │ │ Module 9/10 │         │
│ │ [Continue]  │ │ [Continue]  │ │ [Continue]  │         │
│ └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                           │
│ Completed (5)                                             │
│ ┌─────────────┐ ┌─────────────┐                          │
│ │ [Cover]     │ │ [Cover]     │  [View All Completed]   │
│ │ Course Name │ │ Course Name │                          │
│ │ ✓ Complete  │ │ ✓ Complete  │                          │
│ │ [Certificate]│ │ [Certificate]│                         │
│ └─────────────┘ └─────────────┘                          │
│                                                           │
│ Study Groups (1)                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ SHRM-CP Study Group · 8/10 members · Next: Jul 10    │ │
│ │ [Go to Group]                                        │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

### 3.10 Course Detail / Module Player
**Route**: `/learning/courses/:courseId/:moduleId`

**Layout**: Split view (video/content on left, navigation on right)

```
┌──────────────────────────────────────────────────────────┐
│ [← Back to Course]  Course Name > Module 5 of 12        │
├───────────────────────────────────┬──────────────────────┤
│                                   │ Module Navigation     │
│  [Video Player / Reading Area]    │ ☑ Module 1: Intro   │
│                                   │ ☑ Module 2: ...     │
│                                   │ ☑ Module 3: ...     │
│                                   │ ☑ Module 4: ...     │
│                                   │ ▶ Module 5: Current │
│                                   │ ☐ Module 6: ...     │
│                                   │ ☐ Module 7: ...     │
│                                   │ ...                  │
│                                   │                      │
│                                   │ ─── Discussion ───   │
│                                   │ [Ask a question]     │
│                                   │ [3 questions]        │
├───────────────────────────────────┴──────────────────────┤
│ [← Previous]          Progress: [████░░░░] 42%  [Next →]│
│                                                           │
│ Knowledge Check (after module):                           │
│ Q: What is the primary purpose of a PIP?                 │
│ ○ To document performance issues                          │
│ ● To help employees improve                              │
│ ○ To justify termination                                │
│ ○ To reduce compensation                                  │
│ [Check Answer]                                           │
└──────────────────────────────────────────────────────────┘
```

---

### 3.11 Messages (Inbox)
**Route**: `/messages`

**Layout**: Three-panel (conversation list, active chat, info panel)

```
┌──────────┬────────────────────────────┬────────────────┐
│ Search   │ John Smith                 │                │
│ ──────── │ [Online ●]                 │ Member since   │
│          │                             │ Jan 2025       │
│ [Avatar] │ ┌──────────────────────┐   │ SHRM-CP ✓     │
│ John     │ │ Hey, about the TA    │   │ TA Specialist  │
│ Smith    │ │ position...          │   │ 8 connections  │
│ 2h ago   │ └──────────────────────┘   │                │
│ [You:]   │         2:30 PM ✓✓         │                │
│ That's   │                             │                │
│ great... │ ┌──────────────────────┐   │                │
│          │ │ Yes, I'd recommend  │   │                │
│ [Avatar] │ │ using a structured  │   │                │
│ Jane     │ │ interview process   │   │                │
│ Doe      │ │ with scorecard...   │   │                │
│ 1d ago   │ └──────────────────────┘   │                │
│ [You:]   │         2:35 PM             │                │
│ Thanks.. │                             │                │
│          │ ┌──────────────────────┐   │                │
│ [Avatar] │ │ [Type a message...]  │   │                │
│ Mike     │ │ [📎] [Send ▶]       │   │                │
│ Johnson  │ └──────────────────────┘   │                │
│ 3d ago   │                             │                │
│          │                             │                │
└──────────┴────────────────────────────┴────────────────┘
```

**Mobile**: Single panel. Tap conversation → full-screen chat. Back → conversation list.

---

### 3.12 Admin Panel
**Route**: `/admin/*`
**Layout**: Separate admin sidebar + header

**Sidebar Items**:
- Dashboard (overview stats)
- Users (list, verify, suspend, restore)
- Organizations (list, verify)
- Communities (list, manage, moderators)
- Content (blogs, knowledge hub)
- Events (list, approve, analytics)
- Learning (courses, credits)
- Moderation (reports, actions, audit logs)
- Analytics (detailed reports, exports)
- Settings (platform config, announcements)

**Dashboard**: Grid of stat cards + line charts (member growth, content velocity, engagement) + recent activity feed.

---

## 4. Key Component Specifications

### Reaction Button (Multi-Signal)
```
[👍 Helpful 24] [💡 Insightful 8] [🎯 From Exp. 3]
```
- Each reaction type is a separate button
- Click toggles user's reaction (on/off)
- Active state: filled icon + primary color
- "From Experience" only available to Trust Level 2+ verified professionals
- Hover tooltip: "Mark as helpful" / "This provides practical insight"
- "Inaccurate" is accessed via the ⋯ menu (not a visible button) to discourage casual use

### Anonymous Toggle
```
[🟣 Post Anonymously] (toggle switch)
```
When active: Shows purple indicator, profile hidden, but verification badge still visible.
Warning tooltip: "Your identity will be hidden, but your verified credential badge will still be shown."

### Trust Level Badge
```
[⭐ Contributor] — small badge next to username in comments/answers
```
Different colors per level: Level 1 (gray), Level 2 (blue), Level 3 (green), Level 4 (purple), Level 5 (gold), Level 6 (orange), Level 7 (red with glow)

### Certification Badge
```
[SHRM-CP ✓] — green checkmark, only shown for verified certifications
```

### Notification Dropdown
```
[Bell icon with red dot if unread]
┌──────────────────────────────┐
│ Notifications          [Mark all read]│
│ ─────────────────────────── │
│ 👤 John followed you · 2m   │
│ 💬 Priya replied to... · 1h │
│ 🎓 Certificate earned! · 3h │
│ ⚠️ New CA compliance... · 5h │
│ ─────────────────────────── │
│ [View All Notifications]    │
└──────────────────────────────┘
```

---

## 5. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1280px+ | Full layout, sidebar visible |
| Desktop | 1024-1279px | Slightly narrower sidebar |
| Tablet | 768-1023px | Single column, sidebar collapses to horizontal scroll or Sheet |
| Mobile | <768px | Bottom nav, full-width cards, no sidebar, stacked layouts |

---

## 6. Loading States & Skeletons

Every data-dependent component MUST have a skeleton loading state:
- **Feed Cards**: Gray rectangles matching card layout (3 lines + avatar circle)
- **Profile**: Avatar circle + 3 text line skeletons
- **Discussion**: Full comment skeleton with nested replies
- **Course Module**: Video player skeleton + text lines

Use shadcn/ui `<Skeleton />` component. Show skeletons for minimum 300ms before data (prevents flash of loading state).

---

## 7. Empty States

Every list view MUST have an illustrated empty state:
- No discussions: "Be the first to start a discussion in this community" + [Create Post] button
- No answers: "No answers yet. Your expertise could help!" + [Write Answer] button
- No connections: "Start building your HR network" + [Find Professionals] button
- No search results: "No results found. Try different keywords or browse categories."

---

*This UI/UX blueprint should be read alongside the Product Specification (02) and API Contracts (05) for complete frontend implementation guidance.*