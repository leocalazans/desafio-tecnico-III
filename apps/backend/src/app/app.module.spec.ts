import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppModule', () => {
  let module: TestingModule;

  it('Compila o module', async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(module).toBeDefined();
  });

  it('Deve Carregar AppController e AppService', () => {
    const appController = module.get<AppController>(AppController);
    const appService = module.get<AppService>(AppService);

    expect(appController).toBeInstanceOf(AppController);
    expect(appService).toBeInstanceOf(AppService);
  });
});
