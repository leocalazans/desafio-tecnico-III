import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { clearDatabase } from './utils/db';
import { setupTestApp } from './utils/test-app';

describe('Exames (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;
  let server: any;

  beforeAll(async () => {
    app = await setupTestApp();

    ds = app.get(DataSource);
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(ds);
  });

  async function criaPaciente(nome = 'Paciente X', documento = 'doc-x') {
    const res = await request(server)
      .post('/pacientes')
      .send({ nome, documento, dataNascimento: '1990-01-01' })
      .expect(201);
    return res.body;
  }

  it('POST /exames cria exame (201) e reaproveita por idempotencyKey (200)', async () => {
    const paciente = await criaPaciente('Léo', 'cpf-1');

    const dto = { pacienteId: paciente.id, modalidade: 'CT', idempotencyKey: 'key-123' };

    const res1 = await request(server).post('/exames').send(dto).expect(201);
    const res2 = await request(server).post('/exames').send(dto).expect(200);

    expect(res1.body.id).toBe(res2.body.id);
  });

  it('POST /exames falha com paciente inexistente (400)', async () => {
    await request(server)
      .post('/exames')
      .send({ pacienteId: '00000000-0000-0000-0000-000000000000', modalidade: 'CT', idempotencyKey: 'k' })
      .expect(400);
  });

  it('POST /exames concorrência: duas requisições simultâneas com mesma idempotencyKey → apenas um persiste', async () => {
    const paciente = await criaPaciente('Concorrente', 'cpf-2');
    const dto = { pacienteId: paciente.id, modalidade: 'CT', idempotencyKey: 'key-concurrent' };

    const [a, b] = await Promise.allSettled([
      request(server).post('/exames').send(dto),
      request(server).post('/exames').send(dto),
    ]);

    // Ambas devem ter status 201/200, e o ID tem que ser o mesmo sempre que houver body
    const resA = (a as any).value;
    const resB = (b as any).value;

    expect([200, 201]).toContain(resA.status);
    expect([200, 201]).toContain(resB.status);

    const idA = resA.body?.id;
    const idB = resB.body?.id;

    expect(idA).toBeDefined();
    expect(idB).toBeDefined();
    expect(idA).toBe(idB);
  });

  it('GET /exames pagina resultados', async () => {
    const paciente = await criaPaciente('Paginado', 'cpf-3');

    for (let i = 0; i < 12; i++) {
      await request(server)
        .post('/exames')
        .send({ pacienteId: paciente.id, modalidade: 'CT', idempotencyKey: `k-${i}` })
        .expect(201);
    }

    const page1 = await request(server).get('/exames?page=1&pageSize=10').expect(200);
    const page2 = await request(server).get('/exames?page=2&pageSize=10').expect(200);

    expect(page1.body.data).toHaveLength(10);
    expect(page1.body.total).toBe(12);
    expect(page2.body.data).toHaveLength(2);
  });

  it('POST /exames valida campos obrigatórios (400)', async () => {
    const paciente = await criaPaciente('Validação', 'cpf-4');

    // falta idempotencyKey
    await request(server)
      .post('/exames')
      .send({ pacienteId: paciente.id, modalidade: 'CT' })
      .expect(400);

    // falta modalidade
    await request(server)
      .post('/exames')
      .send({ pacienteId: paciente.id, idempotencyKey: 'k-miss' })
      .expect(400);
  });
  it('GET /exames/:id retorna exame existente (200)', async () => {
    const paciente = await criaPaciente('Paciente GET', 'cpf-5');
    const dto = { pacienteId: paciente.id, modalidade: 'CT', idempotencyKey: 'key-get' };

    const created = await request(server).post('/exames').send(dto).expect(201);

    const found = await request(server).get(`/exames/${created.body.id}`).expect(200);

    expect(found.body.id).toBe(created.body.id);
    expect(found.body.modalidade).toBe('CT');
  });

  it('GET /exames/:id retorna 404 se não existir', async () => {
    await request(server)
      .get('/exames/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('POST /exames aceita mesma idempotencyKey em pacientes diferentes', async () => {
    const p1 = await criaPaciente('Paciente 1', 'cpf-6');
    const p2 = await criaPaciente('Paciente 2', 'cpf-7');

    const dto1 = { pacienteId: p1.id, modalidade: 'CT', idempotencyKey: 'key-shared' };
    const dto2 = { pacienteId: p2.id, modalidade: 'CT', idempotencyKey: 'key-shared' };

    const r1 = await request(server).post('/exames').send(dto1).expect(201);
    const r2 = await request(server).post('/exames').send(dto2).expect(201);

    expect(r1.body.id).not.toBe(r2.body.id);
  });

  it('GET /exames filtra por pacienteId', async () => {
    const p1 = await criaPaciente('Paciente Filtro 1', 'cpf-8');
    const p2 = await criaPaciente('Paciente Filtro 2', 'cpf-9');

    // cria 2 exames no p1 e 1 exame no p2
    await request(server).post('/exames').send({ pacienteId: p1.id, modalidade: 'CT', idempotencyKey: 'kf-1' }).expect(201);
    await request(server).post('/exames').send({ pacienteId: p1.id, modalidade: 'CT', idempotencyKey: 'kf-2' }).expect(201);
    await request(server).post('/exames').send({ pacienteId: p2.id, modalidade: 'CT', idempotencyKey: 'kf-3' }).expect(201);

    const res1 = await request(server).get(`/exames?pacienteId=${p1.id}`).expect(200);
    const res2 = await request(server).get(`/exames?pacienteId=${p2.id}`).expect(200);

    expect(res1.body.data).toHaveLength(2);
    expect(res2.body.data).toHaveLength(1);
  });
});
