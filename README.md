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
# Start in production mode
$ pnpm run start:prod
```

```bash
# Build the application
$ pnpm run build
```

```bash
# Build and analyze bundle
$ pnpm run build:analyze
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
$ pnpm run migrate:make <migration_name>
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
