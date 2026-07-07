import { describe, it, expect, beforeAll } from 'vitest';

const BASE = 'http://localhost:4000/api/v1';

let aliceToken: string;
let bobToken: string;
let postId: string;
let postSlug: string;
let commentId: string;
let seriesId: string;
let seriesSlug: string;

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

describe('Blogs Module', () => {
  it('1. Alice creates a blog post (draft)', async () => {
    const res = await fetch(`${BASE}/blogs/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({
        title: 'The Future of HR Tech',
        content: 'Full article content about HR technology trends.',
        excerpt: 'A brief excerpt about HR tech.',
        tags: ['hr-tech', 'innovation'],
        status: 'draft',
      }),
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    expect(json.data.title).toBe('The Future of HR Tech');
    expect(json.data.status).toBe('draft');
    postId = json.data.id;
    postSlug = json.data.slug;
  });

  it('2. List posts excludes draft from public', async () => {
    const res = await fetch(`${BASE}/blogs/posts`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.find((p: any) => p.id === postId)).toBeUndefined();
  });

  it('3. Alice publishes the post', async () => {
    const res = await fetch(`${BASE}/blogs/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ status: 'published' }),
    });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.status).toBe('published');
  });

  it('4. List published posts publicly', async () => {
    const res = await fetch(`${BASE}/blogs/posts`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.find((p: any) => p.id === postId)).toBeTruthy();
  });

  it('5. Get post by slug', async () => {
    const res = await fetch(`${BASE}/blogs/posts/${postSlug}`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.id).toBe(postId);
  });

  it('6. Bob adds a comment', async () => {
    const res = await fetch(`${BASE}/blogs/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bobToken}` },
      body: JSON.stringify({ content: 'Great article! Very informative.' }),
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    expect(json.data.content).toContain('Great article');
    commentId = json.data.id;
  });

  it('7. List comments on post', async () => {
    const res = await fetch(`${BASE}/blogs/posts/${postId}/comments`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.length).toBeGreaterThanOrEqual(1);
  });

  it('8. Bob updates his comment', async () => {
    const res = await fetch(`${BASE}/blogs/posts/${postId}/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bobToken}` },
      body: JSON.stringify({ content: 'Updated: Excellent piece!' }),
    });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.content).toContain('Updated');
  });

  it('9. Alice cannot update Bobs comment', async () => {
    const res = await fetch(`${BASE}/blogs/posts/${postId}/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ content: 'Hacked!' }),
    });
    expect(res.status).toBe(403);
  });

  it('10. Vote helpful on post', async () => {
    const res = await fetch(`${BASE}/blogs/posts/${postId}/vote`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    expect(json.data.helpful).toBe(true);
  });

  it('11. Bob cannot delete Alices post', async () => {
    const res = await fetch(`${BASE}/blogs/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect(res.status).toBe(403);
  });

  it('12. Bob deletes his comment', async () => {
    const res = await fetch(`${BASE}/blogs/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect(res.status).toBe(200);
  });

  it('13. Alice deletes her post', async () => {
    const res = await fetch(`${BASE}/blogs/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(200);
  });

  it('14. Create a blog series', async () => {
    const res = await fetch(`${BASE}/blogs/series`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({
        title: 'HR Tech Deep Dive',
        description: 'A series exploring HR technology.',
      }),
    });
    expect(res.status).toBe(201);
    const json: any = await res.json();
    expect(json.data.title).toBe('HR Tech Deep Dive');
    seriesId = json.data.id;
    seriesSlug = json.data.slug;
  });

  it('15. List series', async () => {
    const res = await fetch(`${BASE}/blogs/series`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.length).toBeGreaterThanOrEqual(1);
  });

  it('16. Get series by slug', async () => {
    const res = await fetch(`${BASE}/blogs/series/${seriesSlug}`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.id).toBe(seriesId);
  });

  it('17. Update series', async () => {
    const res = await fetch(`${BASE}/blogs/series/${seriesId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ title: 'HR Tech Deep Dive Updated' }),
    });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.data.title).toContain('Updated');
  });

  it('18. Delete series', async () => {
    const res = await fetch(`${BASE}/blogs/series/${seriesId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status).toBe(200);
  });
});
