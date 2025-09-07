import { Paciente } from '../paciente.entity';
import { Exame } from '../exame.entity';

describe('Paciente entity', () => {
  it('should create a Paciente instance with all fields', () => {
    const paciente = new Paciente();
    paciente.id = 'uuid-paciente';
    paciente.nome = 'Maria Souza';
    paciente.documento = '123.456.789-00';
    paciente.email = 'maria@test.com';
    paciente.exames = [];

    paciente.createdAt = new Date();
    paciente.updatedAt = new Date();

    // Assertions
    expect(paciente.id).toBe('uuid-paciente');
    expect(paciente.nome).toBe('Maria Souza');
    expect(paciente.documento).toBe('123.456.789-00');
    expect(paciente.email).toBe('maria@test.com');
    expect(paciente.exames).toEqual([]);
    expect(paciente.createdAt).toBeInstanceOf(Date);
    expect(paciente.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow multiple Paciente instances with different documentos', () => {
    const paciente1 = new Paciente();
    paciente1.documento = '111.111.111-11';

    const paciente2 = new Paciente();
    paciente2.documento = '222.222.222-22';

    expect(paciente1.documento).not.toBe(paciente2.documento);
  });

  it('should be able to hold Exame instances', () => {
    const paciente = new Paciente();
    const exame = new Exame();
    exame.id = 'uuid-exame';
    paciente.exames = [exame];

    expect(paciente.exames.length).toBe(1);
    expect(paciente.exames[0].id).toBe('uuid-exame');
  });
});
