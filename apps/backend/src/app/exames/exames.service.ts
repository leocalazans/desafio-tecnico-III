import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { ExamesRepository } from './exames.repository';
import { PacientesRepository } from '../pacientes/pacientes.repository';
import { CreateExameDto } from '@project/shared';
import { DataSource } from 'typeorm';
import { Exame } from '../entities/exame.entity';

@Injectable()
export class ExamesService {
  constructor(
    private readonly examesRepo: ExamesRepository,
    private readonly pacientesRepo: PacientesRepository,
    private readonly dataSource: DataSource,
  ) { }

  async create(dto: CreateExameDto): Promise<Exame> {
    return await this.dataSource.transaction(async (manager) => {
      // Paciente deve existir
      const paciente = await manager.findOne(this.pacientesRepo.target, {
        where: { id: dto.pacienteId },
      });
      if (!paciente) throw new BadRequestException('Paciente não encontrado');

      // Idempotência: verifica se exame já existe
      const existing = await manager.findOne(this.examesRepo.target, {
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) return existing; // Retorna o mesmo exame sem recriar

      // Criação do exame
      const exame = this.examesRepo.create({
        paciente,
        modalidade: dto.modalidade,
        idempotencyKey: dto.idempotencyKey,
      });

      return manager.save(exame);
    });
  }

  async findAll(page = 1, pageSize = 10) {
    const [data, total] = await this.examesRepo.findAndCount({
      relations: ['paciente'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, pageSize };
  }
}
