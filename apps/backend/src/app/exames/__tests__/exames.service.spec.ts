import { Test, TestingModule } from '@nestjs/testing';
import { ExamesService } from '../exames.service';
import { ExamesRepository } from '../exames.repository';
import { PacientesRepository } from '../../pacientes/pacientes.repository';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { repoMockFactory } from '../../../../test/utils/repo-mock';
import { CreateExameDto } from '@project/shared';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

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

      await expect(
        service.create({ pacienteId: 'nope', modalidade: 'CT', idempotencyKey: 'k1' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('retorna exame existente (idempotência)', async () => {
      const existing = { id: 'ex-1', idempotencyKey: 'k1' };

      dataSourceMock.transaction.mockImplementationOnce(async (cb) => {
        const manager = {
          findOne: jest.fn()
            .mockResolvedValueOnce({ id: 'p1' }) // paciente
            .mockResolvedValueOnce(existing),    // exame
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

    it('valida campos obrigatórios via class-validator', async () => {
      const dtos: Partial<CreateExameDto>[] = [
        { modalidade: 'CT', idempotencyKey: 'k1' },
        { pacienteId: 'p1', idempotencyKey: 'k1' },
        { pacienteId: 'p1', modalidade: 'CT' },
        {},
      ];

      for (const dto of dtos) {
        const instance = plainToInstance(CreateExameDto, dto);
        const errors = await validate(instance);
        expect(errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('findAll', () => {
    it('retorna exames paginados', async () => {
      repo.findAndCount.mockResolvedValue([
        [{ id: 'ex-1', paciente: { id: 'p1' }, modalidade: 'CT' }],
        1,
      ]);

      const res = await service.findAll(1, 10);
      expect(res.data[0].id).toBe('ex-1');
      expect(res.page).toBe(1);
      expect(res.pageSize).toBe(10);
    });

    it('trata paginação padrão', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      const res = await service.findAll();
      expect(res.page).toBe(1);
      expect(res.pageSize).toBe(10);
    });
  });

  describe('findAll - paginação extrema e filtro paciente', () => {
    it('trata page = 0 e pageSize = 0', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      const res = await service.findAll(0, 0);
      expect(res.page).toBe(0);
      expect(res.pageSize).toBe(0);
    });

    it('trata pagina além do total de registros', async () => {
      repo.findAndCount.mockResolvedValue([[], 1]);
      const res = await service.findAll(1000, 10);
      expect(res.page).toBe(1000);
    });

    it('filtra paciente inexistente', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      const res = await service.findAll(1, 10);
      expect(res.data).toHaveLength(0);
    });
  });
});
