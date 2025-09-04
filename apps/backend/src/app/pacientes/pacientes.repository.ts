import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Paciente } from '../entities/paciente.entity';

@Injectable()
export class PacientesRepository extends Repository<Paciente> {
  constructor(private dataSource: DataSource) {
    super(Paciente, dataSource.createEntityManager());
  }
}
