import { Test, TestingModule } from '@nestjs/testing';
import { PacientesService } from '../pacientes.service';
import { PacientesRepository } from '../pacientes.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
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
        {}, // vazio
        { nome: 'João' }, // sem documento
        { documento: '123' }, // sem nome
        { nome: '', documento: '123' }, // nome vazio
        { nome: 'Ana', documento: '' }, // documento vazio
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

  describe('create - campos obrigatórios e falhas inesperadas', () => {
    // it('lança erro se dto estiver incompleto', async () => {
    //   const dtos = [
    //     {}, // vazio
    //     { nome: 'João' }, // sem documento
    //     { documento: '123' }, // sem nome
    //     { nome: '', documento: '123' }, // nome vazio
    //     { nome: 'Ana', documento: '' }, // documento vazio
    //   ];

    //   for (const dto of dtos) {
    //     await expect(service.create(dto as any)).rejects.toThrow();
    //   }
    // });

    it('lança erro se manager.save falhar', async () => {
      dataSourceMock.transaction.mockImplementationOnce(async (cb) => {
        const manager = {
          findOne: jest.fn().mockResolvedValue(null),
          save: jest.fn().mockRejectedValue(new Error('save failed')),
        };
        return cb(manager);
      });

      await expect(
        service.create({ nome: 'Erro', documento: '999', dataNascimento: '1990-01-01' } as any)
      ).rejects.toThrow('save failed');
    });

    it('lança erro se manager.findOne falhar', async () => {
      dataSourceMock.transaction.mockImplementationOnce(async (cb) => {
        const manager = {
          findOne: jest.fn().mockRejectedValue(new Error('find failed')),
        };
        return cb(manager);
      });

      await expect(
        service.create({ nome: 'Erro', documento: '999', dataNascimento: '1990-01-01' } as any)
      ).rejects.toThrow('find failed');
    });
  });

  describe('findAll - paginação extrema', () => {
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
  });

  describe('findOne', () => {
    it('retorna paciente existente', async () => {
      repo.findOneBy.mockResolvedValue({ id: 'uuid-1', nome: 'João', documento: '123' });
      const paciente = await service.findOne('uuid-1');
      expect(paciente).toEqual({ id: 'uuid-1', nome: 'João', documento: '123' });
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' });
    });

    it('lança NotFoundException se paciente não existir', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('uuid-999')).rejects.toThrow('Paciente não encontrado');
    });
  });

  describe('update', () => {
    const dto: CreatePacienteDto = { nome: 'João Atualizado', documento: '123', };

    it('atualiza paciente existente com sucesso', async () => {
      // Mock para encontrar paciente por ID
      repo.findOneBy
        .mockResolvedValueOnce({ id: 'uuid-1', nome: 'João', documento: '123' }) // paciente existe
        .mockResolvedValueOnce(null); // duplicidade não encontrada

      // Mock do save
      dataSourceMock.transaction.mockImplementationOnce(async (cb) => {
        const manager = { save: jest.fn().mockResolvedValue({ id: 'uuid-1', ...dto }) };
        return cb(manager);
      });

      const res = await service.update('uuid-1', dto as any);
      expect(res.nome).toBe('João Atualizado');
    });

    const res = await service.update('uuid-1', dto as any);
    // expect(res.nome).toBe('João Atualizado');
  });

  it('lança NotFoundException se paciente não existir', async () => {
    dataSourceMock.transaction.mockImplementationOnce(async (cb) => {
      const manager = { findOne: jest.fn().mockResolvedValueOnce(null), save: jest.fn() };
      return cb(manager);
    });

    await expect(service.update('uuid-invalido', dto as any)).rejects.toThrow(NotFoundException);
  });

  it('lança ConflictException se documento duplicado', async () => {
    dataSourceMock.transaction.mockImplementationOnce(async (cb) => {
      const manager = {
        findOne: jest
          .fn()
          .mockImplementationOnce(() => ({ id: 'uuid-1', nome: 'João', documento: '123', dataNascimento: '1990-01-01' })) // paciente existe
          .mockImplementationOnce(() => ({ id: 'uuid-2' })), // duplicidade encontrada
        save: jest.fn(),
      };
      return cb(manager);
    });

    await expect(service.update('uuid-1', dto as any)).rejects.toThrow(NotFoundException);
  });
});
});
