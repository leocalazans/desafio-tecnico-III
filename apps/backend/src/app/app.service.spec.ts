import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      expect(service.getData()).toEqual({ message: 'Hello API' });
    });

    it('should be callable multiple times', () => {
      expect(service.getData()).toEqual({ message: 'Hello API' });
      expect(service.getData()).toEqual({ message: 'Hello API' });
    });

    it('should handle unexpected errors', () => {
      const original = service.getData;
      service.getData = jest.fn(() => {
        throw new Error('Unexpected failure');
      });

      expect(() => service.getData()).toThrow('Unexpected failure');

      // Restaura implementação original
      service.getData = original;
    });
  });
});
