import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { buildTypeOrmOptions } from '../config/database.config';

loadEnv();

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parsePort(value: string): number {
  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('DATABASE_PORT must be a positive integer');
  }

  return port;
}

export default new DataSource(
  buildTypeOrmOptions({
    host: getRequiredEnv('DATABASE_HOST'),
    port: parsePort(getRequiredEnv('DATABASE_PORT')),
    username: getRequiredEnv('DATABASE_USER'),
    password: getRequiredEnv('DATABASE_PASSWORD'),
    database: getRequiredEnv('DATABASE_NAME'),
  }),
);
