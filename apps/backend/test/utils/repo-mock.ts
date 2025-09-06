import { DeepPartial } from 'typeorm';

type Entity = Record<string, any>;

export const repoMockFactory = <T extends Entity>() => ({
  // Simula criação de entidade (apenas retorna o DTO ou entidade)
  create: jest.fn().mockImplementation((dto: DeepPartial<T>) => dto),

  // Simula salvar entidade, adicionando um id se não existir
  save: jest.fn().mockImplementation((entity: DeepPartial<T>) =>
    Promise.resolve({ id: 'mock-id-' + Math.random().toString(36).substr(2, 5), ...entity })
  ),

  findOne: jest.fn().mockResolvedValue(undefined), // por padrão retorna undefined
  findOneBy: jest.fn().mockResolvedValue(undefined),
  findAndCount: jest.fn().mockResolvedValue([[], 0]),
  find: jest.fn().mockResolvedValue([]),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
});
