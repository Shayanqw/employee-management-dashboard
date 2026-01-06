const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../src/app');
const { connectDB, disconnectDB } = require('../src/db');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await connectDB(mongod.getUri());
});

afterAll(async () => {
  await disconnectDB();
  if (mongod) await mongod.stop();
});

describe('Employees API', () => {
  it('creates, lists, searches, updates, and deletes an employee', async () => {
    const payload = {
      first_name: 'Ada',
      last_name: 'Lovelace',
      email: 'ada@example.com',
      position: 'Engineer',
      salary: 120000,
    };

    // Create
    const created = await request(app).post('/api/employees').send(payload);
    expect(created.statusCode).toBe(201);
    expect(created.body).toHaveProperty('_id');

    const id = created.body._id;

    // List
    const list = await request(app).get('/api/employees');
    expect(list.statusCode).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBeGreaterThanOrEqual(1);

    // Search
    const search = await request(app).get('/api/employees/search').query({ q: 'ada' });
    expect(search.statusCode).toBe(200);
    expect(search.body.some((e) => e.email === 'ada@example.com')).toBe(true);

    // Update
    const updated = await request(app).put(`/api/employees/${id}`).send({ position: 'Senior Engineer' });
    expect(updated.statusCode).toBe(200);
    expect(updated.body.position).toBe('Senior Engineer');

    // Delete
    const deleted = await request(app).delete(`/api/employees/${id}`);
    expect(deleted.statusCode).toBe(200);
    expect(deleted.body).toEqual({ message: 'Employee deleted successfully' });
  });
});
