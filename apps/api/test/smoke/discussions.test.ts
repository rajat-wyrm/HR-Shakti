import { describe, expect, it, beforeAll } from 'vitest';

const BASE = 'http://localhost:4000/api/v1';

async function loginAs(email: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Test@123' }),
  });
  const json: any = await res.json();
  return json.data?.accessToken || json.accessToken;
}

describe('Discussions Module', () => {
  let aliceToken: string;
  let bobToken: string;
  let communityId: string;
  let discussionId: string;
  let pollDiscussionId: string;
  let commentId: string;
  let replyId: string;
  let pollId: string;
  let optionId: string;
  const ts = Date.now();

  beforeAll(async () => {
    aliceToken = await loginAs('aliceorg@test.com');
    bobToken = await loginAs('boborg@test.com');
  });

  it('1. Create community for discussions', async () => {
    const res = await fetch(`${BASE}/communities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ name: 'HR Talk', slug: `hr-talk-${ts}`, description: 'HR community' }),
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    communityId = json.data.id;
  });

  it('2. Alice creates a discussion', async () => {
    const res = await fetch(`${BASE}/discussions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({
        communityId,
        title: 'Payroll compliance tips?',
        content: 'Looking for best practices in payroll compliance.',
        tags: ['payroll', 'compliance'],
      }),
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    discussionId = json.data.id;
    expect(json.data.title).toBe('Payroll compliance tips?');
  });

  it('3. Alice creates a discussion with a poll', async () => {
    const res = await fetch(`${BASE}/discussions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({
        communityId,
        title: 'Remote work poll?',
        content: 'What do you think?',
        poll: {
          question: 'Do you prefer remote work?',
          options: [{ label: 'Yes' }, { label: 'No' }, { label: 'Hybrid' }],
        },
      }),
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    pollDiscussionId = json.data.id;
    pollId = json.data.poll.id;
    optionId = json.data.poll.options[0].id;
    expect(json.data.poll).toBeDefined();
    expect(json.data.poll.options.length).toBe(3);
  });

  it('4. List discussions', async () => {
    const res = await fetch(`${BASE}/discussions?communityId=${communityId}`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.length).toBeGreaterThanOrEqual(2);
  });

  it('5. Get discussion details', async () => {
    const res = await fetch(`${BASE}/discussions/${discussionId}`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.title).toBe('Payroll compliance tips?');
  });

  it('6. Alice adds a comment', async () => {
    const res = await fetch(`${BASE}/discussions/${discussionId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ content: 'Great question! Here is my advice...' }),
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    commentId = json.data.id;
    expect(json.data.content).toBe('Great question! Here is my advice...');
  });

  it('7. Bob replies to the comment', async () => {
    const res = await fetch(`${BASE}/discussions/${discussionId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bobToken}` },
      body: JSON.stringify({ content: 'I agree with Alice!', parentId: commentId }),
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    replyId = json.data.id;
    expect(json.data.parentId).toBe(commentId);
  });

  it('8. List comments (tree order)', async () => {
    const res = await fetch(`${BASE}/discussions/${discussionId}/comments`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.length).toBeGreaterThanOrEqual(2);
  });

  it('9. Bob edits his comment', async () => {
    const res = await fetch(`${BASE}/discussions/${discussionId}/comments/${replyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bobToken}` },
      body: JSON.stringify({ content: 'I fully agree with Alice!' }),
    });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.content).toBe('I fully agree with Alice!');
  });

  it('10. Alice cannot edit Bob comment', async () => {
    const res = await fetch(`${BASE}/discussions/${discussionId}/comments/${replyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ content: 'Hacked!' }),
    });
    expect(res.status).toBe(403);
  });

  it('11. Alice deletes her comment', async () => {
    const res = await fetch(`${BASE}/discussions/${discussionId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(200);
  });

  it('12. Vote on poll', async () => {
    const res = await fetch(`${BASE}/discussions/${pollDiscussionId}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ optionId }),
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    expect(json.data.voted).toBe(true);
  });

  it('13. Toggle bookmark on', async () => {
    const res = await fetch(`${BASE}/discussions/${discussionId}/bookmark`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    expect(json.data.bookmarked).toBe(true);
  });

  it('14. Toggle bookmark off', async () => {
    const res = await fetch(`${BASE}/discussions/${discussionId}/bookmark`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    expect(json.data.bookmarked).toBe(false);
  });

  it('15. Alice updates discussion', async () => {
    const res = await fetch(`${BASE}/discussions/${discussionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ title: 'Payroll compliance tips 2026?' }),
    });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.title).toBe('Payroll compliance tips 2026?');
  });

  it('16. Bob cannot delete (not author/moderator)', async () => {
    const res = await fetch(`${BASE}/discussions/${discussionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect(res.status).toBe(403);
  });

  it('17. Alice deletes discussion', async () => {
    const res = await fetch(`${BASE}/discussions/${discussionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(200);
  });

  it('18. Discussion count via listing', async () => {
    const res = await fetch(`${BASE}/discussions?communityId=${communityId}`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.length).toBeGreaterThanOrEqual(1);
  });
});
