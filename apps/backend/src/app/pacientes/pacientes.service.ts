import { Injectable, ConflictException } from '@nestjs/common';
import { PacientesRepository } from './pacientes.repository';
import { CreatePacienteDto } from '@project/shared';
import { DataSource } from 'typeorm';
import { Paciente } from '../entities/paciente.entity';

@Injectable()
export class PacientesService {
  constructor(
    private readonly pacientesRepo: PacientesRepository,
    private readonly dataSource: DataSource,
  ) { }

  async create(dto: CreatePacienteDto): Promise<Paciente> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const exists = await manager.findOne(Paciente, { where: { documento: dto.documento } });
        if (exists) throw new ConflictException('Documento já cadastrado');

        const paciente = this.pacientesRepo.create(dto);
        return manager.save(paciente);
      });
    } catch (error) {
      // Captura erro de constraint única do Postgres
      if (error.code === '23505') {
        throw new ConflictException('Documento já cadastrado');
      }
      throw error;
    }
  }

  async findAll(page = 1, pageSize = 10) {
    const [data, total] = await this.pacientesRepo.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, pageSize };
  }
}
