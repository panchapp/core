import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  try {
    // Enable UUID extension for PostgreSQL
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Step 1: Add new UUID columns alongside existing integer columns
    await knex.schema.alterTable('users', (table) => {
      table.uuid('id_new');
    });
    await knex.schema.alterTable('apps', (table) => {
      table.uuid('id_new');
    });
    await knex.schema.alterTable('roles', (table) => {
      table.uuid('id_new');
      table.uuid('app_id_new');
    });
    await knex.schema.alterTable('permissions', (table) => {
      table.uuid('id_new');
      table.uuid('app_id_new');
    });

    // Step 2: Generate UUIDs for all existing primary keys
    await knex.raw(`UPDATE users SET id_new = uuid_generate_v4();`);
    await knex.raw(`UPDATE apps SET id_new = uuid_generate_v4();`);
    await knex.raw(`UPDATE roles SET id_new = uuid_generate_v4();`);
    await knex.raw(`UPDATE permissions SET id_new = uuid_generate_v4();`);

    // Step 3: Map foreign keys using the new UUIDs (based on old integer relationships)
    await knex.raw(`
      UPDATE roles r
      SET app_id_new = a.id_new
      FROM apps a
      WHERE r.app_id = a.id;
    `);

    await knex.raw(`
      UPDATE permissions p
      SET app_id_new = a.id_new
      FROM apps a
      WHERE p.app_id = a.id;
    `);

    // Step 4: Update junction tables - add new UUID columns
    await knex.schema.alterTable('user_apps', (table) => {
      table.uuid('user_id_new');
      table.uuid('app_id_new');
    });
    await knex.schema.alterTable('user_roles', (table) => {
      table.uuid('user_id_new');
      table.uuid('role_id_new');
    });
    await knex.schema.alterTable('role_permissions', (table) => {
      table.uuid('role_id_new');
      table.uuid('permission_id_new');
    });
    await knex.schema.alterTable('user_permissions', (table) => {
      table.uuid('user_id_new');
      table.uuid('permission_id_new');
    });

    // Step 5: Map junction table foreign keys (using old integer IDs to link to new UUIDs)
    await knex.raw(`
      UPDATE user_apps ua
      SET
        user_id_new = u.id_new,
        app_id_new = a.id_new
      FROM users u, apps a
      WHERE ua.user_id = u.id AND ua.app_id = a.id;
    `);

    await knex.raw(`
      UPDATE user_roles ur
      SET
        user_id_new = u.id_new,
        role_id_new = r.id_new
      FROM users u, roles r
      WHERE ur.user_id = u.id AND ur.role_id = r.id;
    `);

    await knex.raw(`
      UPDATE role_permissions rp
      SET
        role_id_new = r.id_new,
        permission_id_new = p.id_new
      FROM roles r, permissions p
      WHERE rp.role_id = r.id AND rp.permission_id = p.id;
    `);

    await knex.raw(`
      UPDATE user_permissions up
      SET
        user_id_new = u.id_new,
        permission_id_new = p.id_new
      FROM users u, permissions p
      WHERE up.user_id = u.id AND up.permission_id = p.id;
    `);

    // Step 6: Drop old foreign key constraints
    await knex.raw(`
      ALTER TABLE user_apps DROP CONSTRAINT IF EXISTS user_apps_pkey;
    `);
    await knex.raw(`
      ALTER TABLE user_apps DROP CONSTRAINT IF EXISTS user_apps_user_id_foreign;
    `);
    await knex.raw(`
      ALTER TABLE user_apps DROP CONSTRAINT IF EXISTS user_apps_app_id_foreign;
    `);
    await knex.raw(`
      ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;
    `);
    await knex.raw(`
      ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_foreign;
    `);
    await knex.raw(`
      ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_foreign;
    `);
    await knex.raw(`
      ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
    `);
    await knex.raw(`
      ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_foreign;
    `);
    await knex.raw(`
      ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS role_permissions_permission_id_foreign;
    `);
    await knex.raw(`
      ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS user_permissions_pkey;
    `);
    await knex.raw(`
      ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS user_permissions_user_id_foreign;
    `);
    await knex.raw(`
      ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS user_permissions_permission_id_foreign;
    `);
    await knex.raw(`
      ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_app_id_foreign;
    `);
    await knex.raw(`
      ALTER TABLE permissions DROP CONSTRAINT IF EXISTS permissions_app_id_foreign;
    `);

    // Step 7: Drop primary key constraints
    await knex.raw(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;`);
    await knex.raw(`ALTER TABLE apps DROP CONSTRAINT IF EXISTS apps_pkey;`);
    await knex.raw(`ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_pkey;`);
    await knex.raw(
      `ALTER TABLE permissions DROP CONSTRAINT IF EXISTS permissions_pkey;`,
    );

    // Step 8: Drop old integer columns and rename new UUID columns for primary tables
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('id');
    });
    await knex.schema.alterTable('users', (table) => {
      table.renameColumn('id_new', 'id');
    });
    await knex.raw(`
      ALTER TABLE users
      ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
      ADD PRIMARY KEY (id);
    `);

    await knex.schema.alterTable('apps', (table) => {
      table.dropColumn('id');
    });
    await knex.schema.alterTable('apps', (table) => {
      table.renameColumn('id_new', 'id');
    });
    await knex.raw(`
      ALTER TABLE apps
      ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
      ADD PRIMARY KEY (id);
    `);

    await knex.schema.alterTable('roles', (table) => {
      table.dropColumn('id');
      table.dropColumn('app_id');
    });
    await knex.schema.alterTable('roles', (table) => {
      table.renameColumn('id_new', 'id');
      table.renameColumn('app_id_new', 'app_id');
    });
    await knex.raw(`
      ALTER TABLE roles
      ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
      ALTER COLUMN app_id SET NOT NULL,
      ADD PRIMARY KEY (id),
      ADD CONSTRAINT roles_app_id_foreign
      FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE;
    `);

    await knex.schema.alterTable('permissions', (table) => {
      table.dropColumn('id');
      table.dropColumn('app_id');
    });
    await knex.schema.alterTable('permissions', (table) => {
      table.renameColumn('id_new', 'id');
      table.renameColumn('app_id_new', 'app_id');
    });
    await knex.raw(`
      ALTER TABLE permissions
      ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
      ALTER COLUMN app_id SET NOT NULL,
      ADD PRIMARY KEY (id),
      ADD CONSTRAINT permissions_app_id_foreign
      FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE;
    `);

    // Step 9: Update junction tables - drop old columns and rename new ones
    await knex.schema.alterTable('user_apps', (table) => {
      table.dropColumn('user_id');
      table.dropColumn('app_id');
    });
    await knex.schema.alterTable('user_apps', (table) => {
      table.renameColumn('user_id_new', 'user_id');
      table.renameColumn('app_id_new', 'app_id');
    });
    await knex.raw(`
      ALTER TABLE user_apps
      ALTER COLUMN user_id SET NOT NULL,
      ALTER COLUMN app_id SET NOT NULL,
      ADD PRIMARY KEY (user_id, app_id),
      ADD CONSTRAINT user_apps_user_id_foreign
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      ADD CONSTRAINT user_apps_app_id_foreign
      FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE;
    `);

    await knex.schema.alterTable('user_roles', (table) => {
      table.dropColumn('user_id');
      table.dropColumn('role_id');
    });
    await knex.schema.alterTable('user_roles', (table) => {
      table.renameColumn('user_id_new', 'user_id');
      table.renameColumn('role_id_new', 'role_id');
    });
    await knex.raw(`
      ALTER TABLE user_roles
      ALTER COLUMN user_id SET NOT NULL,
      ALTER COLUMN role_id SET NOT NULL,
      ADD PRIMARY KEY (user_id, role_id),
      ADD CONSTRAINT user_roles_user_id_foreign
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      ADD CONSTRAINT user_roles_role_id_foreign
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
    `);

    await knex.schema.alterTable('role_permissions', (table) => {
      table.dropColumn('role_id');
      table.dropColumn('permission_id');
    });
    await knex.schema.alterTable('role_permissions', (table) => {
      table.renameColumn('role_id_new', 'role_id');
      table.renameColumn('permission_id_new', 'permission_id');
    });
    await knex.raw(`
      ALTER TABLE role_permissions
      ALTER COLUMN role_id SET NOT NULL,
      ALTER COLUMN permission_id SET NOT NULL,
      ADD PRIMARY KEY (role_id, permission_id),
      ADD CONSTRAINT role_permissions_role_id_foreign
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      ADD CONSTRAINT role_permissions_permission_id_foreign
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;
    `);

    await knex.schema.alterTable('user_permissions', (table) => {
      table.dropColumn('user_id');
      table.dropColumn('permission_id');
    });
    await knex.schema.alterTable('user_permissions', (table) => {
      table.renameColumn('user_id_new', 'user_id');
      table.renameColumn('permission_id_new', 'permission_id');
    });
    await knex.raw(`
      ALTER TABLE user_permissions
      ALTER COLUMN user_id SET NOT NULL,
      ALTER COLUMN permission_id SET NOT NULL,
      ADD PRIMARY KEY (user_id, permission_id),
      ADD CONSTRAINT user_permissions_user_id_foreign
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      ADD CONSTRAINT user_permissions_permission_id_foreign
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;
    `);
  } catch (error) {
    console.error(
      'Error during 20251122030629_convert_ids_to_uuid migration up:',
      error,
    );
    throw error;
  }
}

export function down(): void {
  // Note: Converting back from UUID to integer IDs is complex and would lose data
  // This is a one-way migration in practice
  throw new Error(
    'Cannot automatically convert UUIDs back to integers. Manual migration required.',
  );
}
