import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { setupTestApp } from './utils/test-app';
import { clearDatabase } from './utils/db';

describe('Pacientes (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;

  beforeAll(async () => {
    app = await setupTestApp();
    ds = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(ds);
  });

  it('POST /pacientes cria paciente válido (201)', async () => {
    const res = await request(app.getHttpServer())
      .post('/pacientes')
      .send({ nome: 'Léo', documento: '12345678900', dataNascimento: '1990-01-01' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.nome).toBe('Léo');
  });

  it('POST /pacientes falha sem campos obrigatórios (400)', async () => {
    await request(app.getHttpServer())
      .post('/pacientes')
      .send({ documento: '999' })
      .expect(400);
  });

  it('POST /pacientes retorna 409 se documento duplicado', async () => {
    await request(app.getHttpServer())
      .post('/pacientes')
      .send({ nome: 'A', documento: 'dup', dataNascimento: '1990-01-01' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/pacientes')
      .send({ nome: 'B', documento: 'dup', dataNascimento: '1991-01-01' })
      .expect(409);
  });

  it('GET /pacientes pagina resultados', async () => {
    const server = app.getHttpServer();

    // cria 15 pacientes
    for (let i = 0; i < 15; i++) {
      await request(server)
        .post('/pacientes')
        .send({ nome: `P${i}`, documento: `doc${i}`, dataNascimento: '1990-01-01' })
        .expect(201);
    }

    const page1 = await request(server).get('/pacientes?page=1&pageSize=10').expect(200);
    expect(page1.body.data).toHaveLength(10);
    expect(page1.body.total).toBe(15);

    const page2 = await request(server).get('/pacientes?page=2&pageSize=10').expect(200);
    expect(page2.body.data).toHaveLength(5);
  });

  it('POST /pacientes só cria um paciente em concorrência', async () => {
    const server = app.getHttpServer();
    const payload = { nome: 'Concorrente', documento: 'conc123', dataNascimento: '1990-01-01' };

    const [res1, res2] = await Promise.all([
      request(server).post('/pacientes').send(payload),
      request(server).post('/pacientes').send(payload),
    ]);

    const successCount = [res1.status, res2.status].filter((s) => s === 201).length;
    const conflictCount = [res1.status, res2.status].filter((s) => s === 409).length;

    expect(successCount).toBe(1);
    expect(conflictCount).toBe(1);
  });
});
