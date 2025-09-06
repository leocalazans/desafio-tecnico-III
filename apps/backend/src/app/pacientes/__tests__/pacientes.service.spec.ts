import { Test, TestingModule } from '@nestjs/testing';
import { PacientesService } from '../pacientes.service';
import { PacientesRepository } from '../pacientes.repository';
import { ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { repoMockFactory } from '../../../../test/utils/repo-mock';
import { CreatePacienteDto } from '@project/shared';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('PacientesService', () => {
  let service: PacientesService;
  let repo: ReturnType<typeof repoMockFactory>;
  const dataSourceMock = { transaction: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PacientesService,
        { provide: PacientesRepository, useFactory: repoMockFactory },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get(PacientesService);
    repo = module.get(PacientesRepository);
  });

  describe('create', () => {
    it('cria paciente novo com sucesso', async () => {
      dataSourceMock.transaction.mockImplementationOnce(async (cb) => {
        const manager = {
          findOne: jest.fn().mockResolvedValue(null),
          save: jest.fn().mockResolvedValue({ id: 'uuid-2', nome: 'João', documento: '123' }),
        };
        return cb(manager);
      });

      const created = await service.create({ nome: 'João', documento: '123', dataNascimento: '1990-01-01' } as any);
      expect(created.id).toBe('uuid-2');
    });

    it('lança 409 se documento já existir', async () => {
      dataSourceMock.transaction.mockImplementationOnce(async (cb) => {
        const manager = { findOne: jest.fn().mockResolvedValue({ id: 'exists' }), save: jest.fn() };
        return cb(manager);
      });

      await expect(
        service.create({ nome: 'Maria', documento: '123', dataNascimento: '1990-01-01' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('mapeia erro 23505 (unique_violation) para 409', async () => {
      dataSourceMock.transaction.mockRejectedValue({ code: '23505' });

      await expect(
        service.create({ nome: 'Ana', documento: '999', dataNascimento: '1990-01-01' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('valida campos obrigatórios via class-validator', async () => {
      const dtos: Partial<CreatePacienteDto>[] = [
        { documento: '123' },
        { nome: 'Teste' },
        {},
      ];

      for (const dto of dtos) {
        const instance = plainToInstance(CreatePacienteDto, dto);
        const errors = await validate(instance);
        expect(errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('findAll', () => {
    it('retorna pacientes paginados', async () => {
      repo.findAndCount.mockResolvedValue([
        [{ id: 'p1', nome: 'João', documento: '123' }], // data
        1, // total
      ]);

      const res = await service.findAll(1, 10);
      expect(res).toEqual({
        data: [{ id: 'p1', nome: 'João', documento: '123' }],
        total: 1,
        page: 1,
        pageSize: 10,
      });
    });

    it('trata paginação padrão', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      const res = await service.findAll();
      expect(res.page).toBe(1);
      expect(res.pageSize).toBe(10);
    });
  });
});
