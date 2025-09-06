import { Test, TestingModule } from '@nestjs/testing';
import { ExamesService } from '../exames.service';
import { ExamesRepository } from '../exames.repository';
import { PacientesRepository } from '../../pacientes/pacientes.repository';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Exame } from '../../entities/exame.entity';
import { repoMockFactory } from '../../../../test/utils/repo-mock';

describe('ExamesService', () => {
  let service: ExamesService;
  let repo: ReturnType<typeof repoMockFactory>;
  let pacientesRepo: ReturnType<typeof repoMockFactory>;
  let dataSourceMock: any;

  beforeEach(async () => {
    dataSourceMock = { transaction: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamesService,
        { provide: ExamesRepository, useFactory: repoMockFactory },
        { provide: PacientesRepository, useFactory: repoMockFactory },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get(ExamesService);
    repo = module.get(ExamesRepository);
    pacientesRepo = module.get(PacientesRepository);
  });

  describe('create', () => {
    it('falha quando paciente não existe', async () => {
      dataSourceMock.transaction.mockImplementationOnce(async (cb) => {
        const manager = { findOne: jest.fn().mockResolvedValueOnce(null) };
        return cb(manager);
      });
      await expect(service.create({ pacienteId: 'nope', modalidade: 'CT', idempotencyKey: 'k1' } as any))
        .rejects.toThrow(BadRequestException);
    });

    it('retorna exame existente (idempotência)', async () => {
      const existing = { id: 'ex-1', idempotencyKey: 'k1' } as Exame;
      dataSourceMock.transaction.mockImplementationOnce(async (cb) => {
        const manager = {
          findOne: jest.fn()
            .mockResolvedValueOnce({ id: 'p1' })
            .mockResolvedValueOnce(existing)
        };
        return cb(manager);
      });
      const exam = await service.create({ pacienteId: 'p1', modalidade: 'CT', idempotencyKey: 'k1' } as any);
      expect(exam.id).toBe('ex-1');
    });

    it('cria exame novo quando idempotencyKey não existe', async () => {
      dataSourceMock.transaction.mockImplementationOnce(async (cb) => {
        const manager = {
          findOne: jest.fn()
            .mockResolvedValueOnce({ id: 'p1' })
            .mockResolvedValueOnce(null),
          save: jest.fn().mockResolvedValue({ id: 'ex-2', idempotencyKey: 'k2' }),
        };
        return cb(manager);
      });
      const exam = await service.create({ pacienteId: 'p1', modalidade: 'CT', idempotencyKey: 'k2' } as any);
      expect(exam.id).toBe('ex-2');
    });

    it('mapeia erro genérico para BadRequestException', async () => {
      dataSourceMock.transaction.mockRejectedValue(new Error('Unknown error'));
      await expect(service.create({ pacienteId: 'p1', modalidade: 'CT', idempotencyKey: 'k3' } as any))
        .rejects.toThrow('Unknown error');
    });

    it('valida campos obrigatórios via DTO', async () => {
      const dtos = [
        { modalidade: 'CT', idempotencyKey: 'k1' },
        { pacienteId: 'p1', idempotencyKey: 'k1' },
        { pacienteId: 'p1', modalidade: 'CT' }
      ];
      for (const dto of dtos) {
        await expect(service.create(dto as any)).rejects.toThrow();
      }
    });
  });

  describe('findAll', () => {
    it('retorna exames paginados', async () => {
      repo.findAndCount.mockResolvedValue([[{ id: 'ex-1', paciente: { id: 'p1' }, modalidade: 'CT' }], 1]);
      const res = await service.findAll(1, 10);
      expect(res).toEqual({
        data: [{ id: 'ex-1', paciente: { id: 'p1' }, modalidade: 'CT' }],
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

    it('filtra exames por pacienteId (relação paciente)', async () => {
      repo.findAndCount.mockResolvedValue([[{ id: 'ex-2', paciente: { id: 'p2' }, modalidade: 'RM' }], 1]);
      const res = await service.findAll(1, 10);
      expect(res.data[0].paciente.id).toBe('p2');
    });

    it('simula falha do repositório', async () => {
      repo.findAndCount.mockRejectedValue(new Error('DB error'));
      await expect(service.findAll()).rejects.toThrow('DB error');
    });
  });
});
