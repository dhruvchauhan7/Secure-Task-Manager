import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../api/src/app/app.module';

const request = require('supertest');

type LoginResponse = { accessToken: string };

describe('API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    // Match your main.ts CORS/global prefix behavior
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function login(email: string, password: string) {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(201);

    const body = res.body as LoginResponse;
    expect(body.accessToken).toBeTruthy();
    return body.accessToken;
  }

  it('Auth: login returns accessToken', async () => {
    await login('owner@demo.com', 'Owner123!');
  });

  it('RBAC: viewer cannot create/update/delete tasks (403)', async () => {
    const token = await login('viewer@demo.com', 'Viewer123!');

    // create forbidden
    await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Viewer create', description: 'no', status: 'OPEN' })
      .expect(403);

    // update forbidden (use a fake id, should still be forbidden BEFORE not-found ideally)
    await request(app.getHttpServer())
      .put('/api/tasks/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'x', description: null, status: 'OPEN' })
      .expect(403);

    // delete forbidden
    await request(app.getHttpServer())
      .delete('/api/tasks/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('Tasks: owner can CRUD task', async () => {
    const token = await login('owner@demo.com', 'Owner123!');

    // CREATE
    const created = await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'E2E Task',
        description: 'created in test',
        status: 'OPEN',
        category: 'Work',
      })
      .expect(201);

    expect(created.body?.id).toBeTruthy();
    const id = created.body.id as string;

    // LIST
    const list = await request(app.getHttpServer())
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(list.body)).toBe(true);

    // UPDATE (your UI uses PUT)
    const updated = await request(app.getHttpServer())
      .put(`/api/tasks/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'E2E Task Updated',
        description: 'updated in test',
        status: 'IN_PROGRESS',
        category: 'Personal',
      })
      .expect(200);

    expect(updated.body.title).toBe('E2E Task Updated');

    // DELETE
    await request(app.getHttpServer())
      .delete(`/api/tasks/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
