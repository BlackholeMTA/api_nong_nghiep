import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

type DatabaseConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

function getRequiredConfig(configService: ConfigService, name: string): string {
  return configService.getOrThrow<string>(name);
}

function parsePort(value: string): number {
  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('DATABASE_PORT must be a positive integer');
  }

  return port;
}

function buildDatabaseConfigFromService(
  configService: ConfigService,
): DatabaseConfig {
  return {
    host: getRequiredConfig(configService, 'DATABASE_HOST'),
    port: parsePort(getRequiredConfig(configService, 'DATABASE_PORT')),
    username: getRequiredConfig(configService, 'DATABASE_USER'),
    password: getRequiredConfig(configService, 'DATABASE_PASSWORD'),
    database: getRequiredConfig(configService, 'DATABASE_NAME'),
  };
}

export function buildTypeOrmOptions(
  databaseConfig: DatabaseConfig,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: databaseConfig.host,
    port: databaseConfig.port,
    username: databaseConfig.username,
    password: databaseConfig.password,
    database: databaseConfig.database,
    synchronize: false,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  };
}

export function createTypeOrmModuleOptions(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return buildTypeOrmOptions(buildDatabaseConfigFromService(configService));
}
