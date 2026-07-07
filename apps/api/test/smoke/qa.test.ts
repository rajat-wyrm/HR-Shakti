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

describe('Q&A Module', () => {
  let aliceToken: string;
  let bobToken: string;
  let questionId: string;
  let answerId: string;

  beforeAll(async () => {
    aliceToken = await loginAs('aliceorg@test.com');
    bobToken = await loginAs('boborg@test.com');
  });

  it('1. Alice creates a question', async () => {
    const res = await fetch(`${BASE}/qa/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({
        title: 'How to handle payroll compliance?',
        content: 'Looking for best practices in payroll compliance.',
        tags: ['payroll', 'compliance'],
      }),
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    questionId = json.data.id;
    expect(json.data.title).toBe('How to handle payroll compliance?');
    expect(json.data.tags.length).toBe(2);
  });

  it('2. List questions', async () => {
    const res = await fetch(`${BASE}/qa/questions`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.length).toBeGreaterThanOrEqual(1);
  });

  it('3. Get question details', async () => {
    const res = await fetch(`${BASE}/qa/questions/${questionId}`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.id).toBe(questionId);
  });

  it('4. Bob answers the question', async () => {
    const res = await fetch(`${BASE}/qa/questions/${questionId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bobToken}` },
      body: JSON.stringify({ content: 'Here is my detailed answer about payroll compliance...' }),
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    answerId = json.data.id;
    expect(json.data.content).toContain('payroll');
  });

  it('5. Accept an answer', async () => {
    const res = await fetch(`${BASE}/qa/questions/${questionId}/answers/${answerId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    expect(json.data.accepted).toBe(true);
  });

  it('6. Bob cannot accept (only question author)', async () => {
    const res = await fetch(`${BASE}/qa/questions/${questionId}/answers/${answerId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect(res.status).toBe(403);
  });

  it('7. Vote on question', async () => {
    const res = await fetch(`${BASE}/qa/questions/${questionId}/vote/helpful`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    expect(json.data.helpful).toBe(true);
  });

  it('8. Vote on answer', async () => {
    const res = await fetch(`${BASE}/qa/questions/${questionId}/answers/${answerId}/vote/insightful`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    expect(json.data.insightful).toBe(true);
  });

  it('9. Update answer', async () => {
    const res = await fetch(`${BASE}/qa/questions/${questionId}/answers/${answerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bobToken}` },
      body: JSON.stringify({ content: 'Updated answer content...' }),
    });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.content).toContain('Updated');
  });

  it('10. Alice cannot update Bob answer', async () => {
    const res = await fetch(`${BASE}/qa/questions/${questionId}/answers/${answerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ content: 'trying to hack' }),
    });
    expect(res.status).toBe(403);
  });

  it('11. List tags', async () => {
    const res = await fetch(`${BASE}/qa/tags`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.length).toBeGreaterThanOrEqual(2);
  });

  it('12. Delete answer', async () => {
    const res = await fetch(`${BASE}/qa/questions/${questionId}/answers/${answerId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect(res.status).toBe(200);
  });

  it('13. Update question', async () => {
    const res = await fetch(`${BASE}/qa/questions/${questionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ title: 'Updated: Payroll compliance best practices' }),
    });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.title).toContain('Updated');
  });

  it('14. Bob cannot delete (not author)', async () => {
    const res = await fetch(`${BASE}/qa/questions/${questionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect(res.status).toBe(403);
  });

  it('15. Alice deletes question', async () => {
    const res = await fetch(`${BASE}/qa/questions/${questionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(200);
  });
});
