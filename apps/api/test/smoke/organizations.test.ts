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

describe('Organizations Module', () => {
  let orgId: string;
  let aliceToken: string;
  let bobToken: string;

  beforeAll(async () => {
    aliceToken = await loginAs('aliceorg@test.com');
    bobToken = await loginAs('boborg@test.com');
  });

  it('1. Alice creates Org', async () => {
    const res = await fetch(`${BASE}/organizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ name: 'Acme Corp', slug: 'acme-corp', industry: 'Technology', companySize: '51-200' }),
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    orgId = json.data.id;
    expect(json.data.name).toBe('Acme Corp');
    expect(json.data.slug).toBe('acme-corp');
  });

  it('2. List organizations', async () => {
    const res = await fetch(`${BASE}/organizations`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.length).toBeGreaterThanOrEqual(1);
  });

  it('3. Get org by slug', async () => {
    const res = await fetch(`${BASE}/organizations/acme-corp`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.slug).toBe('acme-corp');
  });

  it('4. Update org (Alice admin)', async () => {
    const res = await fetch(`${BASE}/organizations/${orgId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ companySize: '201-500' }),
    });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.companySize).toBe('201-500');
  });

  it('5. Bob cannot update (not admin)', async () => {
    const res = await fetch(`${BASE}/organizations/${orgId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bobToken}` },
      body: JSON.stringify({ name: 'Hacked' }),
    });
    expect(res.status).toBe(403);
  });

  it('6. Bob claims org', async () => {
    const res = await fetch(`${BASE}/organizations/${orgId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bobToken}` },
      body: JSON.stringify({ workEmail: 'bob@acmecorp.com' }),
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    expect(json.data.claimId).toBeDefined();
  });

  it('7. Bob cannot claim again', async () => {
    const res = await fetch(`${BASE}/organizations/${orgId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bobToken}` },
      body: JSON.stringify({ workEmail: 'bob@acmecorp.com' }),
    });
    expect(res.status).toBe(409);
  });

  it('8. Alice adds Bob as member', async () => {
    const bobRes = await fetch(`${BASE}/users/by-email/boborg@test.com`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const bobJson: any = await bobRes.json();
    const bobUserId = bobJson.data.id;

    const res = await fetch(`${BASE}/organizations/${orgId}/members/${bobUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ role: 'member', title: 'Engineer' }),
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    expect(json.data.role).toBe('member');
  });

  it('9. Alice removes Bob', async () => {
    const bobRes = await fetch(`${BASE}/users/by-email/boborg@test.com`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const bobJson: any = await bobRes.json();
    const bobUserId = bobJson.data.id;

    const res = await fetch(`${BASE}/organizations/${orgId}/members/${bobUserId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(200);
  });

  it('10. Bob cannot remove Alice', async () => {
    const aliceRes = await fetch(`${BASE}/users/by-email/aliceorg@test.com`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    const aliceJson: any = await aliceRes.json();
    const aliceUserId = aliceJson.data.id;

    const res = await fetch(`${BASE}/organizations/${orgId}/members/${aliceUserId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect(res.status).toBe(403);
  });
});
