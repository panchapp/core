<h1 align="center">Core Service</h1>

<p align="center">
  <img src="./assets/Panchito.svg" alt="panchapp-logo" width="150" alt="Nest Logo" />
  <br>
  <br>
  <em>A robust, scalable backend service built with NestJS</em>
  <br>
  <span style="color: #42b883;">✨ Clean Architecture • 🔒 Type Safety • ⚡ High Performance</span>
  <br>
</p>

<p align="center">
  <a href="https://sonarcloud.io/summary/new_code?id=panchapp_core">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=panchapp_core&metric=alert_status" alt="Quality Gate Status" />
  </a>
  <a href="https://github.com/panchapp/core/actions/workflows/ci.yml">
    <img src="https://github.com/panchapp/core/actions/workflows/ci.yml/badge.svg" alt="CI Status" />
  </a>
</p>

<hr>

## Description

**Core** is the central backend service of the Panchapp ecosystem, built with [NestJS](https://github.com/nestjs/nest) framework. This service provides a robust foundation for handling user management, business logic, and API endpoints with clean architecture principles.

This project uses **Knex.js** for database migrations and query building with PostgreSQL.

## Environment Setup

Copy and customize environment variables:

```bash
cp env.example .env
```

## Scripts

### Development

```bash
# Install dependencies
$ pnpm install
```

```bash
# Start in development mode
$ pnpm run start
```

```bash
# Start with hot reload (recommended for development)
$ pnpm run start:dev
```

```bash
# Start with debugging enabled
$ pnpm run start:debug
```

```bash
# Start in production mode
$ pnpm run start:prod
```

### Build

```bash
# Build the application
$ pnpm run build
```

```bash
# Build migrations only
$ pnpm run build:migrations
```

```bash
# Build application and migrations
$ pnpm run build:all
```

### Testing

```bash
# Run unit tests
$ pnpm run test
```

```bash
# Run tests in watch mode
$ pnpm run test:watch
```

```bash
# Run tests with debugging enabled
$ pnpm run test:debug
```

```bash
# Run end-to-end tests
$ pnpm run test:e2e
```

```bash
# Generate test coverage report
$ pnpm run test:cov
```

### Code Quality

```bash
# Run ESLint
$ pnpm run lint
```

```bash
# Fix ESLint issues automatically
$ pnpm run lint:fix
```

```bash
# Format code with Prettier
$ pnpm run format
```

### Database

```bash
# Create a new migration file
$ pnpm run migrate:new <migration_name>
```

```bash
# Run all pending migrations
$ pnpm run migrate:latest
```

```bash
# Rollback the last batch of migrations
$ pnpm run migrate:rollback
```

```bash
# Check migration status
$ pnpm run migrate:status
```
