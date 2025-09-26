// tests/api.test.js
const request = require('supertest');
const app = require('../src/server'); // your Express app

describe('Node.js Todos API', () => {

  // Health check
  test('GET /healthz should return status ok', async () => {
    const res = await request(app).get('/healthz').expect(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  // Happy path: create todo and list
  test('POST /api/v1/todos -> create todo, then GET /api/v1/todos', async () => {
    const agent = request(app);

    // Create todo
    const post = await agent.post('/api/v1/todos')
      .send({ title: 'first task' })
      .set('Content-Type', 'application/json')
      .expect(201);

    expect(post.body).toHaveProperty('id');
    expect(post.body.title).toBe('first task');
    expect(post.body.done).toBe(false);

    // List todos
    const list = await agent.get('/api/v1/todos').expect(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBeGreaterThanOrEqual(1);
    expect(list.body[0]).toHaveProperty('title');
  });

  // Negative test: validation
  test('POST /api/v1/todos -> validation error when no title', async () => {
    await request(app).post('/api/v1/todos')
      .send({})
      .set('Content-Type', 'application/json')
      .expect(400)
      .expect(res => {
        expect(res.body).toHaveProperty('error', 'invalid_payload');
        expect(res.body).toHaveProperty('details');
      });
  });

});

