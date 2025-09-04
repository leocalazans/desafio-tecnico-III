import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateExame1710000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'exames',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'pacienteId', type: 'uuid' },
          { name: 'modalidade', type: 'varchar' },
          { name: 'idempotencyKey', type: 'varchar' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
        uniques: [{ columnNames: ['idempotencyKey'] }],
      }),
    );

    await queryRunner.createForeignKey(
      'exames',
      new TableForeignKey({
        columnNames: ['pacienteId'],
        referencedTableName: 'pacientes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('exames');
  }
}
