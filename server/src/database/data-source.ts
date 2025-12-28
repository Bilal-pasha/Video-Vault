import { createDatasourceOptions } from '../config/database.config';
import { DataSource } from 'typeorm';

// Fetch environment variables and pass to shared config
export const DB_PARAMS = {
  username: process.env.DATABASE_USERNAME!,
  password: process.env.DATABASE_PASSWORD!,
  host: process.env.DATABASE_HOST!,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME!,
  nodeEnv: process.env.NODE_ENV,
};

export const ORMConfig = new DataSource(createDatasourceOptions(DB_PARAMS));
