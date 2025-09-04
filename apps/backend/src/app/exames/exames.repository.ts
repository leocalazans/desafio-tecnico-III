import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Exame } from '../entities/exame.entity';

@Injectable()
export class ExamesRepository extends Repository<Exame> {
  constructor(private dataSource: DataSource) {
    super(Exame, dataSource.createEntityManager());
  }
}
