import { DataSource } from 'typeorm';

export async function clearDatabase(dataSource: DataSource) {
  await dataSource.query('DELETE FROM "exames";');
  await dataSource.query('DELETE FROM "pacientes";');
}
