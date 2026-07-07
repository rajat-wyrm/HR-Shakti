import { describe, it, expect, beforeAll } from 'vitest';

const BASE = 'http://localhost:4000/api/v1';

let aliceToken: string;
let bobToken: string;
let notifId: string;

beforeAll(async () => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aliceorg@test.com', password: 'Test@123' }),
  });
  const json: any = await res.json();
  aliceToken = json.data?.accessToken || json.accessToken;

  const res2 = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'boborg@test.com', password: 'Test@123' }),
  });
  const json2: any = await res2.json();
  bobToken = json2.data?.accessToken || json2.accessToken;
});

describe('Notifications Module', () => {
  it('1. Alice creates a notification', async () => {
    const res = await fetch(`${BASE}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({
        type: 'welcome',
        title: 'Welcome to the platform!',
        body: 'We are glad to have you onboard.',
        link: '/getting-started',
      }),
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    expect(json.data.title).toBe('Welcome to the platform!');
    expect(json.data.isRead).toBe(false);
    notifId = json.data.id;
  });

  it('2. Alice lists her notifications', async () => {
    const res = await fetch(`${BASE}/notifications`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.length).toBeGreaterThanOrEqual(1);
    expect(json.meta.unreadCount).toBeGreaterThanOrEqual(1);
  });

  it('3. Alice gets notification detail', async () => {
    const res = await fetch(`${BASE}/notifications/${notifId}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.id).toBe(notifId);
  });

  it('4. Bob cannot access Alices notification', async () => {
    const res = await fetch(`${BASE}/notifications/${notifId}`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect(res.status).toBe(404);
  });

  it('5. Alice marks notification as read', async () => {
    const res = await fetch(`${BASE}/notifications/${notifId}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.isRead).toBe(true);
    expect(json.data.readAt).toBeTruthy();
  });

  it('6. Filter unread only', async () => {
    const res = await fetch(`${BASE}/notifications?unreadOnly=true`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.every((n: any) => n.isRead === false)).toBe(true);
  });

  it('7. Mark all as read', async () => {
    const res = await fetch(`${BASE}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ type: 'test', title: 'Another notification' }),
    });
    expect(res.status).toBe(201);

    const res2 = await fetch(`${BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res2.status).toBe(200);

    const res3 = await fetch(`${BASE}/notifications?unreadOnly=true`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const json3: any = await res3.json();
    expect(json3.meta.unreadCount).toBe(0);
  });

  it('8. Get notification preferences', async () => {
    const res = await fetch(`${BASE}/notifications/preferences`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('9. Upsert notification preference', async () => {
    const res = await fetch(`${BASE}/notifications/preferences/new_comment`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ channel: 'email', enabled: true }),
    });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.type).toBe('new_comment');
    expect(json.data.channel).toBe('email');
  });

  it('10. Auth required for all endpoints', async () => {
    const res = await fetch(`${BASE}/notifications`);
    expect(res.status).toBe(401);
  });
});
