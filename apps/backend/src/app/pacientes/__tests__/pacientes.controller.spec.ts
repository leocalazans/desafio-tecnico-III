import { Test, TestingModule } from '@nestjs/testing';
import { PacientesController } from '../pacientes.controller';
import { PacientesService } from '../pacientes.service';
import { ConflictException } from '@nestjs/common';
import { CreatePacienteDto } from '@project/shared';

describe('PacientesController', () => {
  let controller: PacientesController;
  let service: PacientesService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PacientesController],
      providers: [{ provide: PacientesService, useValue: mockService }],
    }).compile();

    controller = module.get(PacientesController);
    service = module.get(PacientesService);
  });

  describe('create', () => {
    it('cria paciente com sucesso', async () => {
      const dto: CreatePacienteDto = { nome: 'João', documento: '123' };
      mockService.create.mockResolvedValue({ id: 'p1', ...dto });

      const res = await controller.create(dto);
      expect(res.id).toBe('p1');
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });

    it('lança 409 se serviço lança ConflictException', async () => {
      const dto = { nome: 'Maria', documento: '123', dataNascimento: '1990-01-01' };
      mockService.create.mockRejectedValue(new ConflictException('Documento já cadastrado'));

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });

    it('lança erro genérico se serviço lança outro erro', async () => {
      const dto = { nome: 'Erro', documento: '000', dataNascimento: '2000-01-01' };
      mockService.create.mockRejectedValue(new Error('Unknown'));

      await expect(controller.create(dto)).rejects.toThrow('Unknown');
    });
  });

  describe('findAll', () => {
    it('retorna lista de pacientes com paginação', async () => {
      const mockData = { data: [{ id: 'p1', nome: 'João' }], total: 1, page: 1, pageSize: 10 };
      mockService.findAll.mockResolvedValue(mockData);

      const res = await controller.findAll(1, 10);
      expect(res).toEqual(mockData);
      expect(mockService.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('trata valores padrão de paginação', async () => {
      const mockData = { data: [], total: 0, page: 1, pageSize: 10 };
      mockService.findAll.mockResolvedValue(mockData);

      const res = await controller.findAll();
      expect(res.page).toBe(1);
      expect(res.pageSize).toBe(10);
    });
  });
});
