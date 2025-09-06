import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return "Hello API" from controller', () => {
      expect(appController.getData()).toEqual({ message: 'Hello API' });
    });

    it('should call AppService.getData', () => {
      const serviceSpy = jest.spyOn(appService, 'getData');
      appController.getData();
      expect(serviceSpy).toHaveBeenCalled();
    });

    it('should handle unexpected service errors', () => {
      jest.spyOn(appService, 'getData').mockImplementationOnce(() => {
        throw new Error('Service failure');
      });

      expect(() => appController.getData()).toThrow('Service failure');
    });
  });
});
