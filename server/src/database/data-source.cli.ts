import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { createDatasourceOptions } from '../config/database.config';
import { DataSource } from 'typeorm';

// Load and expand environment variables for CLI
const result = config();
if (result.error) {
  // No .env file - that's fine, use existing env vars
} else {
  expand(result);
}

// Fetch environment variables and pass to shared config
export const DB_PARAMS = {
  username: process.env.POSTGRES_USER!,
  password: process.env.POSTGRES_PASSWORD!,
  host: process.env.POSTGRES_HOST!,
  // host: '0.0.0.0',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB!,
  nodeEnv: process.env.NODE_ENV,
};

export const ORMConfig = new DataSource(createDatasourceOptions(DB_PARAMS));
