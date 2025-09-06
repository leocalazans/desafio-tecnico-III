import { Test, TestingModule } from '@nestjs/testing';
import { ExamesController } from '../exames.controller';
import { ExamesService } from '../exames.service';
import { BadRequestException } from '@nestjs/common';
import { CreateExameDto } from '@project/shared';

describe('ExamesController', () => {
  let controller: ExamesController;
  let service: ExamesService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamesController],
      providers: [{ provide: ExamesService, useValue: mockService }],
    }).compile();

    controller = module.get(ExamesController);
    service = module.get(ExamesService);
  });

  describe('create', () => {
    it('cria exame com sucesso', async () => {
      const dto: CreateExameDto = { pacienteId: 'p1', modalidade: 'CT', idempotencyKey: 'k1' };
      mockService.create.mockResolvedValue({ id: 'ex-1', ...dto });

      const res = await controller.create(dto);
      expect(res.id).toBe('ex-1');
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });

    it('lança BadRequestException se serviço falhar', async () => {
      const dto = { pacienteId: 'nope', modalidade: 'CT', idempotencyKey: 'k1' };
      mockService.create.mockRejectedValue(new BadRequestException('Paciente não encontrado'));

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('lança erro genérico se serviço falhar com outro erro', async () => {
      const dto = { pacienteId: 'p1', modalidade: 'CT', idempotencyKey: 'k1' };
      mockService.create.mockRejectedValue(new Error('Unknown'));

      await expect(controller.create(dto)).rejects.toThrow('Unknown');
    });
  });

  describe('findAll', () => {
    it('retorna exames com paginação', async () => {
      const mockData = { data: [{ id: 'ex-1', paciente: { id: 'p1' }, modalidade: 'CT' }], total: 1, page: 1, pageSize: 10 };
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
