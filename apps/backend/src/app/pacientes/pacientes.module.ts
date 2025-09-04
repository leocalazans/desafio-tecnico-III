import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paciente } from '../entities/paciente.entity';
import { PacientesController } from './pacientes.controller';
import { PacientesService } from './pacientes.service';
import { PacientesRepository } from './pacientes.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Paciente])],
  controllers: [PacientesController],
  providers: [PacientesService, PacientesRepository],
  exports: [PacientesRepository],
})
export class PacientesModule { }
