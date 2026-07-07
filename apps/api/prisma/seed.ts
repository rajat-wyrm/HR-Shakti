import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Users
  const user1 = await prisma.user.create({
    data: {
      email: 'admin@hrshakti.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      username: 'rajesh_kumar',
      headline: 'Senior HR Professional | People Operations Expert',
      about: 'Experienced HR leader with 15+ years in people operations, talent acquisition, and employee engagement across IT and manufacturing sectors.',
      locationCity: 'Bangalore',
      locationCountry: 'India',
      locationState: 'Karnataka',
      timezone: 'Asia/Kolkata',
      isVerified: true,
      role: 'admin',
      trustLevel: 5,
      reputationScore: 2500,
      profileCompletionPct: 100,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'priya@hrshakti.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash',
      firstName: 'Priya',
      lastName: 'Sharma',
      username: 'priya_sharma',
      headline: 'Talent Acquisition Lead | Building Dream Teams',
      about: 'Passionate about connecting great talent with amazing companies. Specialized in tech hiring and employer branding.',
      locationCity: 'Mumbai',
      locationCountry: 'India',
      locationState: 'Maharashtra',
      timezone: 'Asia/Kolkata',
      isVerified: true,
      role: 'moderator',
      trustLevel: 4,
      reputationScore: 1800,
      profileCompletionPct: 90,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'vikram@hrshakti.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash',
      firstName: 'Vikram',
      lastName: 'Patel',
      username: 'vikram_patel',
      headline: 'HR Manager | Employee Engagement Specialist',
      about: 'Focused on creating positive workplace cultures and driving employee satisfaction through innovative HR practices.',
      locationCity: 'Delhi',
      locationCountry: 'India',
      locationState: 'Delhi',
      timezone: 'Asia/Kolkata',
      isVerified: true,
      role: 'member',
      trustLevel: 3,
      reputationScore: 1200,
      profileCompletionPct: 85,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: 'ananya@hrshakti.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash',
      firstName: 'Ananya',
      lastName: 'Reddy',
      username: 'ananya_reddy',
      headline: 'Compensation & Benefits Analyst',
      about: 'Data-driven HR professional specializing in C&B benchmarking, pay equity analysis, and benefits optimization.',
      locationCity: 'Hyderabad',
      locationCountry: 'India',
      locationState: 'Telangana',
      timezone: 'Asia/Kolkata',
      role: 'member',
      trustLevel: 2,
      reputationScore: 800,
      profileCompletionPct: 75,
    },
  });

  const user5 = await prisma.user.create({
    data: {
      email: 'mohan@hrshakti.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$placeholder_hash',
      firstName: 'Mohan',
      lastName: 'Singh',
      username: 'mohan_singh',
      headline: 'Learning & Development Manager',
      about: 'Designing impactful training programs and building learning cultures that drive organizational growth.',
      locationCity: 'Chennai',
      locationCountry: 'India',
      locationState: 'Tamil Nadu',
      timezone: 'Asia/Kolkata',
      role: 'member',
      trustLevel: 3,
      reputationScore: 1000,
      profileCompletionPct: 80,
    },
  });

  console.log('Created 5 users');

  // 2. Create Organizations
  const org1 = await prisma.organization.create({
    data: {
      name: 'TechVision Solutions',
      slug: 'techvision-solutions',
      description: 'Leading IT services company specializing in digital transformation and cloud solutions.',
      website: 'https://techvision.example.com',
      industry: 'Information Technology',
      companySize: '1000-5000',
      headquarters: 'Bangalore, India',
      foundedYear: 2010,
      isVerified: true,
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: 'GreenField Manufacturing',
      slug: 'greenfield-manufacturing',
      description: 'Sustainable manufacturing company focused on eco-friendly industrial solutions.',
      website: 'https://greenfield.example.com',
      industry: 'Manufacturing',
      companySize: '5000-10000',
      headquarters: 'Pune, India',
      foundedYear: 2005,
      isVerified: true,
    },
  });

  const org3 = await prisma.organization.create({
    data: {
      name: 'HealthPlus Labs',
      slug: 'healthplus-labs',
      description: 'Healthcare technology startup revolutionizing patient care through AI-powered diagnostics.',
      website: 'https://healthplus.example.com',
      industry: 'Healthcare',
      companySize: '100-500',
      headquarters: 'Mumbai, India',
      foundedYear: 2018,
      isVerified: false,
    },
  });

  console.log('Created 3 organizations');

  // 3. Create Organization Memberships
  await prisma.organizationMember.createMany({
    data: [
      { organizationId: org1.id, userId: user1.id, role: 'admin', title: 'Head of People Operations' },
      { organizationId: org1.id, userId: user2.id, role: 'member', title: 'Talent Acquisition Lead' },
      { organizationId: org2.id, userId: user3.id, role: 'admin', title: 'HR Manager' },
      { organizationId: org3.id, userId: user4.id, role: 'member', title: 'Compensation Analyst' },
    ],
  });

  console.log('Created organization memberships');

  // 4. Create User Experiences
  await prisma.userExperience.createMany({
    data: [
      {
        userId: user1.id,
        title: 'Head of People Operations',
        company: 'TechVision Solutions',
        location: 'Bangalore',
        isCurrent: true,
        startDate: new Date('2020-01-01'),
        description: 'Leading HR strategy, talent management, and employee engagement initiatives for 3000+ employees.',
      },
      {
        userId: user1.id,
        title: 'Senior HR Manager',
        company: 'InfoTech Global',
        location: 'Bangalore',
        isCurrent: false,
        startDate: new Date('2015-06-01'),
        endDate: new Date('2019-12-31'),
        description: 'Managed end-to-end HR operations for a team of 500 employees.',
      },
      {
        userId: user2.id,
        title: 'Talent Acquisition Lead',
        company: 'TechVision Solutions',
        location: 'Mumbai',
        isCurrent: true,
        startDate: new Date('2021-03-01'),
        description: 'Driving tech hiring strategy and employer branding initiatives.',
      },
      {
        userId: user3.id,
        title: 'HR Manager',
        company: 'GreenField Manufacturing',
        location: 'Delhi',
        isCurrent: true,
        startDate: new Date('2019-07-01'),
        description: 'Overseeing HR operations for manufacturing plants across North India.',
      },
    ],
  });

  console.log('Created user experiences');

  // 5. Create User Education
  await prisma.userEducation.createMany({
    data: [
      {
        userId: user1.id,
        institution: 'IIM Bangalore',
        degree: 'MBA',
        fieldOfStudy: 'Human Resources Management',
        startDate: new Date('2012-06-01'),
        endDate: new Date('2014-05-31'),
      },
      {
        userId: user2.id,
        institution: 'XLRI Jamshedpur',
        degree: 'PGDM',
        fieldOfStudy: 'HRM',
        startDate: new Date('2013-06-01'),
        endDate: new Date('2015-05-31'),
      },
      {
        userId: user3.id,
        institution: 'Delhi University',
        degree: 'MBA',
        fieldOfStudy: 'Organizational Behavior',
        startDate: new Date('2014-06-01'),
        endDate: new Date('2016-05-31'),
      },
    ],
  });

  console.log('Created user education');

  // 6. Create User Skills
  await prisma.userSkill.createMany({
    data: [
      { userId: user1.id, skill: 'Talent Management', endorsements: 45 },
      { userId: user1.id, skill: 'Employee Engagement', endorsements: 38 },
      { userId: user1.id, skill: 'HR Strategy', endorsements: 52 },
      { userId: user1.id, skill: 'Performance Management', endorsements: 30 },
      { userId: user2.id, skill: 'Talent Acquisition', endorsements: 42 },
      { userId: user2.id, skill: 'Employer Branding', endorsements: 35 },
      { userId: user2.id, skill: 'Interviewing', endorsements: 48 },
      { userId: user3.id, skill: 'Employee Relations', endorsements: 28 },
      { userId: user3.id, skill: 'Compliance', endorsements: 22 },
      { userId: user4.id, skill: 'Compensation Analysis', endorsements: 32 },
      { userId: user4.id, skill: 'Benefits Administration', endorsements: 25 },
      { userId: user5.id, skill: 'Training Design', endorsements: 30 },
      { userId: user5.id, skill: 'Learning Management', endorsements: 28 },
    ],
  });

  console.log('Created user skills');

  // 7. Create Connections & Follows
  await prisma.connection.createMany({
    data: [
      { requesterId: user1.id, targetId: user2.id, status: 'accepted' },
      { requesterId: user1.id, targetId: user3.id, status: 'accepted' },
      { requesterId: user2.id, targetId: user3.id, status: 'pending' },
      { requesterId: user4.id, targetId: user1.id, status: 'accepted' },
    ],
  });

  await prisma.follow.createMany({
    data: [
      { followerId: user2.id, targetId: user1.id },
      { followerId: user3.id, targetId: user1.id },
      { followerId: user4.id, targetId: user2.id },
      { followerId: user5.id, targetId: user1.id },
    ],
  });

  console.log('Created connections and follows');

  // 8. Create Communities
  const community1 = await prisma.community.create({
    data: {
      name: 'HR Best Practices',
      slug: 'hr-best-practices',
      description: 'A community for HR professionals to share best practices, discuss challenges, and learn from each other.',
      accessType: 'public',
      memberCount: 1250,
      discussionCount: 340,
    },
  });

  const community2 = await prisma.community.create({
    data: {
      name: 'Talent Acquisition India',
      slug: 'talent-acquisition-india',
      description: 'Dedicated to talent acquisition professionals in India. Share sourcing strategies, interview tips, and hiring trends.',
      accessType: 'public',
      memberCount: 890,
      discussionCount: 180,
    },
  });

  const community3 = await prisma.community.create({
    data: {
      name: 'HR Tech & Innovation',
      slug: 'hr-tech-innovation',
      description: 'Exploring the intersection of HR and technology. AI, automation, people analytics, and more.',
      accessType: 'restricted',
      memberCount: 450,
      discussionCount: 95,
    },
  });

  console.log('Created 3 communities');

  // 9. Create Community Members & Moderators
  await prisma.communityMember.createMany({
    data: [
      { communityId: community1.id, userId: user1.id },
      { communityId: community1.id, userId: user2.id },
      { communityId: community1.id, userId: user3.id },
      { communityId: community1.id, userId: user4.id },
      { communityId: community2.id, userId: user2.id },
      { communityId: community2.id, userId: user3.id },
      { communityId: community3.id, userId: user1.id },
      { communityId: community3.id, userId: user4.id },
    ],
  });

  await prisma.communityModerator.createMany({
    data: [
      { communityId: community1.id, userId: user1.id },
      { communityId: community2.id, userId: user2.id },
    ],
  });

  console.log('Created community members and moderators');

  // 10. Create Discussions
  const disc1 = await prisma.discussion.create({
    data: {
      communityId: community1.id,
      authorId: user1.id,
      title: 'How to improve employee retention in IT companies?',
      content: `I've been seeing a lot of attrition in our IT division. Despite competitive salaries, people are leaving. What strategies have worked for you?\n\nHere are some things we've tried:\n- Flexible work arrangements\n- Career development programs\n- Regular pulse surveys\n- Manager training on people skills\n\nWould love to hear what's working in your organizations.`,
      tags: ['retention', 'employee-engagement', 'best-practices'],
      helpfulCount: 45,
      insightfulCount: 32,
      fromExpCount: 28,
      commentCount: 23,
      viewCount: 890,
    },
  });

  const disc2 = await prisma.discussion.create({
    data: {
      communityId: community2.id,
      authorId: user2.id,
      title: 'Best sourcing strategies for niche tech roles in 2024',
      content: `Finding specialized talent like AI/ML engineers, cloud architects, and cybersecurity experts is getting harder. Here are some strategies that have worked for us:\n\n1. Employee referral programs with higher incentives\n2. Partnerships with coding bootcamps\n3. GitHub/Stack Overflow talent scouting\n4. Niche job boards and communities\n5. LinkedIn Recruiter with Boolean search mastery\n\nWhat are your top sourcing channels?`,
      tags: ['sourcing', 'tech-hiring', 'recruitment'],
      helpfulCount: 67,
      insightfulCount: 41,
      fromExpCount: 55,
      commentCount: 31,
      viewCount: 1200,
    },
  });

  const disc3 = await prisma.discussion.create({
    data: {
      communityId: community1.id,
      authorId: user3.id,
      title: 'Managing remote workforce effectively - Lessons from manufacturing sector',
      content: `Even in manufacturing, we've had to adapt to remote/hybrid work for our office staff. Here are some key lessons:\n\n- Clear communication protocols are essential\n- Regular 1-on-1 check-ins matter more than ever\n- Invest in collaboration tools\n- Trust your team but verify through outcomes\n- Create virtual water cooler moments\n\nThe shift hasn't been easy, but it's been worth it.`,
      tags: ['remote-work', 'management', 'manufacturing'],
      helpfulCount: 38,
      insightfulCount: 29,
      fromExpCount: 42,
      commentCount: 18,
      viewCount: 650,
    },
  });

  const disc4 = await prisma.discussion.create({
    data: {
      communityId: community3.id,
      authorId: user4.id,
      title: 'People Analytics: Building data-driven HR decisions',
      content: `HR is becoming more data-driven. Here's how we built our analytics capability:\n\n1. Started with basic dashboards (headcount, attrition, hiring velocity)\n2. Graduated to predictive models (flight risk, performance prediction)\n3. Now using AI for personalized learning recommendations\n\nThe key is starting small and building executive buy-in through quick wins.`,
      tags: ['people-analytics', 'hr-tech', 'data-driven'],
      helpfulCount: 55,
      insightfulCount: 48,
      fromExpCount: 35,
      commentCount: 27,
      viewCount: 980,
    },
  });

  console.log('Created 4 discussions');

  // 11. Create Discussion Comments
  await prisma.discussionComment.createMany({
    data: [
      {
        discussionId: disc1.id,
        authorId: user3.id,
        content: 'We implemented a "stay interview" program where managers proactively ask high performers what keeps them and what might make them leave. It helped us identify issues before they became resignation letters.',
        helpfulCount: 12,
        insightfulCount: 8,
      },
      {
        discussionId: disc1.id,
        authorId: user2.id,
        content: 'Career pathing has been huge for us. When people can see a clear growth trajectory, they are much more likely to stay. We created role matrices for each department.',
        helpfulCount: 15,
        insightfulCount: 10,
      },
      {
        discussionId: disc2.id,
        authorId: user1.id,
        content: 'GitHub contributions and open-source work can be gold mines for finding genuine talent. Look for consistent contributors to relevant projects.',
        helpfulCount: 20,
        insightfulCount: 18,
      },
      {
        discussionId: disc2.id,
        authorId: user4.id,
        content: 'Don\'t underestimate the power of a strong employer brand. We saw a 40% increase in quality applications after revamping our careers page and sharing employee stories.',
        helpfulCount: 18,
        insightfulCount: 15,
      },
    ],
  });

  console.log('Created discussion comments');

  // 12. Create Tags
  await prisma.tag.createMany({
    data: [
      { name: 'Talent Acquisition', slug: 'talent-acquisition', category: 'Recruitment', questionCount: 45 },
      { name: 'Employee Engagement', slug: 'employee-engagement', category: 'Culture', questionCount: 38 },
      { name: 'Compensation & Benefits', slug: 'compensation-benefits', category: 'Compensation', questionCount: 52 },
      { name: 'HR Technology', slug: 'hr-technology', category: 'Technology', questionCount: 30 },
      { name: 'Performance Management', slug: 'performance-management', category: 'Management', questionCount: 42 },
      { name: 'Learning & Development', slug: 'learning-development', category: 'Development', questionCount: 35 },
      { name: 'Employee Relations', slug: 'employee-relations', category: 'Culture', questionCount: 28 },
      { name: 'Compliance & Labor Law', slug: 'compliance-labor-law', category: 'Legal', questionCount: 33 },
    ],
  });

  console.log('Created tags');

  // 13. Create Q&A Questions
  const tags = await prisma.tag.findMany();

  const q1 = await prisma.question.create({
    data: {
      authorId: user3.id,
      title: 'How to handle salary negotiations for lateral hires?',
      content: 'We are hiring experienced professionals and facing challenges in salary negotiations. The candidates often have higher expectations than our internal pay bands. How do you handle this?',
      answerCount: 3,
      viewCount: 450,
      helpfulCount: 25,
      insightfulCount: 18,
      status: 'open',
    },
  });

  await prisma.questionTag.createMany({
    data: [
      { questionId: q1.id, tagId: tags.find(t => t.name === 'Compensation & Benefits')!.id },
      { questionId: q1.id, tagId: tags.find(t => t.name === 'Talent Acquisition')!.id },
    ],
  });

  const q2 = await prisma.question.create({
    data: {
      authorId: user5.id,
      title: 'What are the best L&D platforms for mid-size companies?',
      content: 'Looking for learning management systems and content platforms suitable for a 500-person company. Budget is around $10-15 per employee per month. What do you recommend?',
      answerCount: 5,
      viewCount: 380,
      helpfulCount: 30,
      insightfulCount: 12,
      status: 'open',
    },
  });

  await prisma.questionTag.createMany({
    data: [
      { questionId: q2.id, tagId: tags.find(t => t.name === 'Learning & Development')!.id },
      { questionId: q2.id, tagId: tags.find(t => t.name === 'HR Technology')!.id },
    ],
  });

  const q3 = await prisma.question.create({
    data: {
      authorId: user1.id,
      title: 'Best practices for conducting return-to-office transitions?',
      content: 'Our leadership wants to bring employees back to office 3 days a week. How do we manage this transition smoothly without losing talent?',
      answerCount: 4,
      viewCount: 620,
      helpfulCount: 40,
      insightfulCount: 22,
      status: 'open',
    },
  });

  await prisma.questionTag.createMany({
    data: [
      { questionId: q3.id, tagId: tags.find(t => t.name === 'Employee Engagement')!.id },
      { questionId: q3.id, tagId: tags.find(t => t.name === 'Performance Management')!.id },
    ],
  });

  console.log('Created Q&A questions with tags');

  // 14. Create Answers
  await prisma.answer.createMany({
    data: [
      {
        questionId: q1.id,
        authorId: user1.id,
        content: 'We use a "total rewards" approach. Instead of just focusing on base salary, we highlight the complete package - benefits, ESOPs, learning budget, flexible work, etc. This often helps candidates see the full value.',
        helpfulCount: 15,
        insightfulCount: 10,
      },
      {
        questionId: q1.id,
        authorId: user2.id,
        content: 'Consider using a salary band flexibility pool (5-10% above standard bands) for critical hires. Get pre-approval from finance for specific roles that are hard to fill.',
        helpfulCount: 12,
        insightfulCount: 8,
      },
      {
        questionId: q2.id,
        authorId: user5.id,
        content: 'We use a combination of LinkedIn Learning for general skills and Udemy Business for technical skills. Total cost comes to about $12/employee/month. The analytics are great for tracking engagement.',
        helpfulCount: 18,
        insightfulCount: 12,
      },
      {
        questionId: q2.id,
        authorId: user4.id,
        content: 'For mid-size companies, I recommend looking at Lessonly (now Seismic Learning) for onboarding and compliance training, and Coursera for Business for professional development courses.',
        helpfulCount: 14,
        insightfulCount: 9,
      },
    ],
  });

  console.log('Created Q&A answers');

  // 15. Create Blog Posts
  const blog1 = await prisma.blogPost.create({
    data: {
      authorId: user1.id,
      title: 'The Future of HR: Trends Shaping People Operations in 2024',
      slug: 'future-of-hr-2024',
      content: `The HR landscape is evolving rapidly. Here are the key trends every HR professional should watch:\n\n## 1. AI-Powered HR\nArtificial intelligence is transforming everything from recruitment to performance management. AI chatbots handle routine queries, predictive analytics identify flight risks, and machine learning optimizes training recommendations.\n\n## 2. Employee Experience as a Strategy\nEX is no longer just about engagement surveys. It's about creating a holistic employee journey that encompasses every touchpoint - from onboarding to exit.\n\n## 3. Skills-Based Organizations\nThe shift from job-based to skills-based workforce planning is accelerating. Companies are focusing on skills inventories rather than rigid job descriptions.\n\n## 4. Wellbeing as a Business Priority\nMental health, financial wellness, and work-life integration are now board-level discussions. Organizations are investing in comprehensive wellbeing programs.\n\n## 5. People Analytics Maturity\nHR is becoming more data-driven, moving from descriptive to predictive and prescriptive analytics.`,
      excerpt: 'Exploring the five major trends that are reshaping HR and people operations in 2024 and beyond.',
      tags: ['hr-trends', 'future-of-work', 'people-operations'],
      status: 'published',
      publishedAt: new Date('2024-01-15'),
      readCount: 2340,
      helpfulCount: 156,
      commentCount: 42,
    },
  });

  const blog2 = await prisma.blogPost.create({
    data: {
      authorId: user2.id,
      title: 'Building an Employer Brand That Attracts Top Talent',
      slug: 'employer-branding-guide',
      content: `Your employer brand is your reputation as a workplace. Here's how to build one that attracts the best candidates:\n\n## Know Your Employee Value Proposition (EVP)\nWhat makes your company unique? Is it the culture, growth opportunities, or mission? Define it clearly.\n\n## Showcase Employee Stories\nAuthentic stories from real employees are more powerful than any marketing message. Create video testimonials, blog posts, and social media content featuring your team.\n\n## Invest in Your Careers Page\nYour careers page is often the first impression candidates have. Make it mobile-friendly, visually appealing, and informative.\n\n## Leverage Social Media\nShare behind-the-scenes content, team achievements, and company culture on LinkedIn, Instagram, and Twitter.\n\n## Measure and Iterate\nTrack your employer brand metrics - application rates, source of hire, Glassdoor ratings, and employee NPS.`,
      excerpt: 'A comprehensive guide to building an employer brand that attracts and retains top talent.',
      tags: ['employer-branding', 'talent-acquisition', 'recruitment'],
      status: 'published',
      publishedAt: new Date('2024-02-10'),
      readCount: 1850,
      helpfulCount: 120,
      commentCount: 35,
    },
  });

  const blog3 = await prisma.blogPost.create({
    data: {
      authorId: user4.id,
      title: 'Designing a Competitive Compensation Package for 2024',
      slug: 'compensation-package-2024',
      content: `In today's competitive talent market, a well-designed compensation package can be your differentiator.\n\n## Market Benchmarking\nUse reliable salary surveys (Mercer, Willis Towers Watson, Aon) to ensure your pay is competitive. Don't just look at base salary - consider total compensation.\n\n## Pay Transparency\nMore companies are adopting pay transparency. It builds trust and helps with pay equity. Consider publishing salary ranges for all positions.\n\n## Variable Pay & Incentives\nDesign incentive plans that align individual performance with company goals. Consider a mix of short-term (annual bonus) and long-term (ESOPs, RSUs) incentives.\n\n## Benefits Innovation\nThink beyond traditional benefits. Student loan assistance, wellness stipends, sabbaticals, and learning budgets are increasingly valued by employees.`,
      excerpt: 'How to design competitive compensation packages that attract talent and drive performance.',
      tags: ['compensation', 'benefits', 'pay-equity'],
      status: 'published',
      publishedAt: new Date('2024-03-05'),
      readCount: 1620,
      helpfulCount: 98,
      commentCount: 28,
    },
  });

  console.log('Created 3 blog posts');

  // 16. Create Blog Comments
  await prisma.blogComment.createMany({
    data: [
      {
        postId: blog1.id,
        authorId: user2.id,
        content: 'Great article! The AI-powered HR section really resonates with what we are seeing in our organization. We are piloting an AI chatbot for employee queries.',
      },
      {
        postId: blog1.id,
        authorId: user3.id,
        content: 'Skills-based organizations is such an important trend. We are already seeing the shift in how we write job descriptions and plan career paths.',
      },
      {
        postId: blog2.id,
        authorId: user1.id,
        content: 'Employer branding has become critical. We invested in a careers page revamp last year and saw a 35% increase in quality applications.',
      },
    ],
  });

  console.log('Created blog comments');

  // 17. Create Employer Reviews
  await prisma.employerReview.createMany({
    data: [
      {
        organizationId: org1.id,
        reviewerId: user3.id,
        title: 'Great place to work with growth opportunities',
        content: 'TechVision is an excellent employer. The leadership team genuinely cares about employee wellbeing and provides ample opportunities for growth.',
        rating: 4,
        leadershipSupport: 4,
        budgetResources: 3,
        techStack: 5,
        workload: 3,
        influenceRating: 4,
        pros: 'Great culture, good work-life balance, competitive pay, strong learning opportunities.',
        cons: 'Can be bureaucratic in decision making, some legacy systems need modernization.',
        isVerified: true,
        helpfulCount: 28,
      },
      {
        organizationId: org2.id,
        reviewerId: user4.id,
        title: 'Solid manufacturing company with room for HR innovation',
        content: 'GreenField is a stable employer with good benefits. The company is traditional but open to new HR practices.',
        rating: 3,
        leadershipSupport: 3,
        budgetResources: 4,
        techStack: 2,
        workload: 4,
        influenceRating: 3,
        pros: 'Job security, good benefits, international opportunities.',
        cons: 'Slow to adopt new technologies, hierarchical culture.',
        isVerified: true,
        helpfulCount: 15,
      },
    ],
  });

  console.log('Created employer reviews');

  // 18. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        type: 'discussion_reply',
        title: 'New reply on your discussion',
        body: 'Priya Sharma replied to "How to improve employee retention"',
        data: { discussionId: disc1.id },
        isRead: false,
      },
      {
        userId: user1.id,
        type: 'connection_request',
        title: 'New connection request',
        body: 'Ananya Reddy wants to connect with you',
        data: { userId: user4.id },
        isRead: true,
      },
      {
        userId: user2.id,
        type: 'blog_reaction',
        title: 'Your blog post received reactions',
        body: 'Your article "Building an Employer Brand" received 10 new reactions',
        data: { blogId: blog2.id },
        isRead: false,
      },
      {
        userId: user3.id,
        type: 'answer_accepted',
        title: 'Your answer was accepted',
        body: 'Your answer to a Q&A question was marked as accepted',
        isRead: false,
      },
    ],
  });

  console.log('Created notifications');

  console.log('\nSeed completed successfully!');
  console.log('---');
  console.log('Test accounts:');
  console.log('  admin@hrshakti.com (Admin)');
  console.log('  priya@hrshakti.com (Moderator)');
  console.log('  vikram@hrshakti.com (Member)');
  console.log('  ananya@hrshakti.com (Member)');
  console.log('  mohan@hrshakti.com (Member)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
