import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

export interface DatabaseConfigParams {
  username: string;
  password: string;
  host: string;
  port: number;
  database: string;
  url?: string;
  nodeEnv?: string;
}

/**
 * Create database configuration with optional parameters
 * If no parameters provided, uses environment variables
 */
function createDatabaseConfig(params: DatabaseConfigParams): DataSourceOptions {
  // Use provided parameters (no fallback to process.env)
  const username = params.username;
  const password = params.password;
  const host = params.host;
  const port = params.port;
  const database = params.database;

  // Use provided URL or construct from components
  // const db_server_url =
  //   params.url || `postgres://${username}:${password}@${host}:${port}/${database}`;

  // console.log('Database configuration:', {
  //   username,
  //   password: password ? '***' : undefined,
  //   host,
  //   port,
  //   database,
  //   url: db_server_url.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in log
  // });

  return {
    type: 'postgres',
    // url: db_server_url,
    host: host,
    port: port,
    database: database,
    username: username,
    password: password,
    // autoLoadEntities: true,
    /**
     * Caution: DO NOT OPEN THIS, Until you know, what you
     are doing.
     * Alternative to it, you can use CLI and run
     schema:sync command.
     * This option is useful during development.
     * e.g. npm run typeorm -- schema:sync
     * e.g. npm run typeorm -- schema:sync
     --dataSource=<datasource/path>
     */
    synchronize: false,
    migrationsRun: false,
    logging: params.nodeEnv === 'development', // 'query', 'error', 'schema', 'warn', 'info', 'log'
    dropSchema: false,
    relationLoadStrategy: 'query',
    //keepConnectionAlive: true,
    // extra: {
    //   // based on https://node-postgres.com/api/pool
    //   // max connection pool size
    //   max: parseInt(maxConnection, 10) || 100,
    // },
  };
}

/**
 * Create datasource options with entities and migrations paths
 */
export function createDatasourceOptions(
  params: DatabaseConfigParams,
): DataSourceOptions {
  const baseConfig = createDatabaseConfig(params);

  return {
    ...baseConfig,
    entities: [join(__dirname, '..', 'api', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
  };
}
