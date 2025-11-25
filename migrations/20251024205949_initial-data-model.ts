import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  try {
    // Create users table
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('email', 255).unique().notNullable();
      table.string('name', 255);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.string('google_id', 255);
    });

    // Create apps table
    await knex.schema.createTable('apps', (table) => {
      table.increments('id').primary();
      table.string('name', 255).unique().notNullable();
      table.text('description');
    });

    // Create roles table
    await knex.schema.createTable('roles', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table
        .integer('app_id')
        .notNullable()
        .references('id')
        .inTable('apps')
        .onDelete('CASCADE');
    });

    // Create permissions table
    await knex.schema.createTable('permissions', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table
        .integer('app_id')
        .notNullable()
        .references('id')
        .inTable('apps')
        .onDelete('CASCADE');
    });

    // Create user_apps table (which apps a user can access)
    await knex.schema.createTable('user_apps', (table) => {
      table
        .integer('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table
        .integer('app_id')
        .notNullable()
        .references('id')
        .inTable('apps')
        .onDelete('CASCADE');
      table.primary(['user_id', 'app_id']);
    });

    // Create user_roles table (assign a role per user per app)
    await knex.schema.createTable('user_roles', (table) => {
      table
        .integer('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table
        .integer('role_id')
        .notNullable()
        .references('id')
        .inTable('roles')
        .onDelete('CASCADE');
      table.primary(['user_id', 'role_id']);
    });

    // Create role_permissions table (permissions granted by a role)
    await knex.schema.createTable('role_permissions', (table) => {
      table
        .integer('role_id')
        .notNullable()
        .references('id')
        .inTable('roles')
        .onDelete('CASCADE');
      table
        .integer('permission_id')
        .notNullable()
        .references('id')
        .inTable('permissions')
        .onDelete('CASCADE');
      table.primary(['role_id', 'permission_id']);
    });

    // Create user_permissions table (direct permissions, if you need overrides)
    await knex.schema.createTable('user_permissions', (table) => {
      table
        .integer('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table
        .integer('permission_id')
        .notNullable()
        .references('id')
        .inTable('permissions')
        .onDelete('CASCADE');
      table.primary(['user_id', 'permission_id']);
    });
  } catch (error) {
    console.error(
      'Error during 20251024205949_initial-data-model migration up:',
      error,
    );
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    // Drop tables in reverse order to handle foreign key constraints
    await knex.schema.dropTableIfExists('user_permissions');
    await knex.schema.dropTableIfExists('role_permissions');
    await knex.schema.dropTableIfExists('user_roles');
    await knex.schema.dropTableIfExists('user_apps');
    await knex.schema.dropTableIfExists('permissions');
    await knex.schema.dropTableIfExists('roles');
    await knex.schema.dropTableIfExists('apps');
    await knex.schema.dropTableIfExists('users');
  } catch (error) {
    console.error(
      'Error during 20251024205949_initial-data-model migration down:',
      error,
    );
    throw error;
  }
}
