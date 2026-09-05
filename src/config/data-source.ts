import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Report } from '../reports/entities/report.entity';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  synchronize: false,
  entities: [User, Report],
  migrations: ['dist/migrations/*.js'],
});

export default dataSource;
