# AGENTS.md

## Project Context

- This is the NestJS backend for the Kim Son Agriculture Database Management System.
- Work on backend only. Do not implement or modify frontend code.
- The database is PostgreSQL with PostGIS.
- The system contains both administrative management data and map/geospatial data.

## Coding Rules

- Do not modify frontend code.
- Do not hardcode database configuration.
- Use environment variables through `.env` and `.env.example`.
- Do not use `synchronize: true` for production.
- All schema changes must be made through migrations.
- APIs must use DTO validation.
- Prefer a clear module architecture: module, controller, service, dto, entity/repository.
- API responses should be consistent.
- Map data must use PostGIS with SRID 4326.
- Geometry columns must have GIST indexes.
- Important tables should include `created_at` and `updated_at` when appropriate.

## Testing and Build

- After each change, run `pnpm build`.
- If the project has lint/test configured, run `pnpm lint` and `pnpm test`.
- If there are errors, report them clearly. Do not make broad unrelated fixes.

## Database Domain

Main business domains include:

- Administrative unit management.
- Organization/agency management.
- User management.
- Role and permission management.
- Report period management.
- Report management.
- Category management.
- Map layer and map object management.
- Dashboard metric management.
- Audit log management.
