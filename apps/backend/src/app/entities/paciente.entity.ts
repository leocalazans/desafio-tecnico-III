import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Exame } from './exame.entity';

@Entity('pacientes')
@Unique(['documento'])
export class Paciente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column()
  documento: string; // CPF ou RG

  @Column({ nullable: true })
  email?: string;

  @OneToMany(() => Exame, (exame) => exame.paciente)
  exames: Exame[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
