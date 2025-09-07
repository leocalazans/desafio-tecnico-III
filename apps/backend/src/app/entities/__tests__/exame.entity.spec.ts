import { Exame } from '../exame.entity';
import { Paciente } from '../paciente.entity';

describe('Exame entity', () => {
  let paciente: Paciente;

  beforeEach(() => {
    paciente = new Paciente();
    paciente.id = 'uuid-paciente';
    paciente.nome = 'João da Silva';
  });

  it('should create an Exame instance with all fields', () => {
    const exame = new Exame();
    exame.id = 'uuid-exame';
    exame.paciente = paciente;
    exame.modalidade = 'RAIO_X';
    exame.idempotencyKey = 'unique-key';
    exame.createdAt = new Date();
    exame.updatedAt = new Date();

    expect(exame.id).toBe('uuid-exame');
    expect(exame.paciente).toBe(paciente);
    expect(exame.paciente.id).toBe('uuid-paciente');
    expect(exame.modalidade).toBe('RAIO_X');
    expect(exame.idempotencyKey).toBe('unique-key');
    expect(exame.createdAt).toBeInstanceOf(Date);
    expect(exame.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow multiple Exame instances with different idempotencyKeys', () => {
    const exame1 = new Exame();
    exame1.idempotencyKey = 'key1';

    const exame2 = new Exame();
    exame2.idempotencyKey = 'key2';

    expect(exame1.idempotencyKey).not.toBe(exame2.idempotencyKey);
  });
});
