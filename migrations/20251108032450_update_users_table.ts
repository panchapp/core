import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.alterTable('users', (table) => {
      table.boolean('is_super_admin').notNullable().defaultTo(false);
    });
  } catch (error) {
    console.error(
      'Error during 20251108032450_update_users_table migration up:',
      error,
    );
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('is_super_admin');
    });
  } catch (error) {
    console.error(
      'Error during 20251108032450_update_users_table migration down:',
      error,
    );
    throw error;
  }
}
