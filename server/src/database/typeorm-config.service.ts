import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { createDatasourceOptions } from '../config/database.config';
import { DB_PARAMS } from './data-source';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...createDatasourceOptions(DB_PARAMS),
    };
  }
}
