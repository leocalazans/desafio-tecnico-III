import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exame } from '../entities/exame.entity';
import { ExamesController } from './exames.controller';
import { ExamesService } from './exames.service';
import { ExamesRepository } from './exames.repository';
import { PacientesModule } from '../pacientes/pacientes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Exame]), PacientesModule],
  controllers: [ExamesController],
  providers: [ExamesService, ExamesRepository],
})
export class ExamesModule { }
