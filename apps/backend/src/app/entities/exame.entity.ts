import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Paciente } from './paciente.entity';

@Entity('exames')
@Unique(['idempotencyKey'])
export class Exame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paciente, (paciente) => paciente.exames, { onDelete: 'CASCADE' })
  paciente: Paciente;

  @Column()
  modalidade: string;

  @Column()
  idempotencyKey: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
