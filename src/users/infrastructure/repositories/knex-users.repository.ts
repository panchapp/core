import { isEmptyObject } from '@/common/utils/object-utils';
import { handlePgDatabaseError } from '@/common/utils/pg-database-error.util';
import { KNEX_DATABASE_TOKEN } from '@/database/database.tokens';
import { PaginatedEntity } from '@/users/domain/entities/paginated.entity';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UsersRepository } from '@/users/domain/repositories/users.repository';
import { USERS_TABLE_TOKEN } from '@/users/domain/tokens/users.tokens';
import { UserCreationValueObject } from '@/users/domain/value-objects/user-creation.value-object';
import { UserFindAllValueObject } from '@/users/domain/value-objects/user-find-all.value-object';
import { UserUpdateValueObject } from '@/users/domain/value-objects/user-update.value-object';
import { UserPersistenceMapper } from '@/users/infrastructure/repositories/mappers/user-persistence.mapper';
import { UserDbModel } from '@/users/infrastructure/repositories/models/user-db.model';
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class KnexUsersRepository implements UsersRepository {
  private readonly tableName = USERS_TABLE_TOKEN;
  constructor(@Inject(KNEX_DATABASE_TOKEN) private readonly db: Knex) {}

  async findAll(
    valueObject: UserFindAllValueObject,
  ): Promise<PaginatedEntity<UserEntity>> {
    try {
      const { page, limit, searchValue, isSuperAdmin } = valueObject;

      // Build base query for counting and fetching
      let baseQuery = this.db<UserDbModel>(this.tableName);

      // Apply filters
      if (searchValue) {
        baseQuery = baseQuery.where('email', 'ilike', `%${searchValue}%`);
        baseQuery = baseQuery.orWhere('name', 'ilike', `%${searchValue}%`);
      }

      if (isSuperAdmin !== undefined) {
        baseQuery = baseQuery.where('is_super_admin', isSuperAdmin);
      }

      // Get total count (before pagination)
      const totalCountResult = await baseQuery
        .clone()
        .count('* as count')
        .first();
      const totalCount = Number(
        (totalCountResult as { count?: string | number })?.count ?? 0,
      );

      // Apply pagination and fetch users
      const offset = (page - 1) * limit;
      const foundDbUsers = await baseQuery
        .clone()
        .select('*')
        .limit(limit)
        .offset(offset);

      const users = foundDbUsers.map((user) =>
        UserPersistenceMapper.toEntity(user),
      );

      return {
        items: users,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      };
    } catch (error) {
      throw handlePgDatabaseError(error, 'Error finding all users');
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const foundDbUser = await this.db<UserDbModel>(this.tableName)
        .where({ id })
        .first();

      return foundDbUser ? UserPersistenceMapper.toEntity(foundDbUser) : null;
    } catch (error) {
      throw handlePgDatabaseError(error, 'Error finding user by id');
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const foundDbUser = await this.db<UserDbModel>(this.tableName)
        .where({ email })
        .first();

      return foundDbUser ? UserPersistenceMapper.toEntity(foundDbUser) : null;
    } catch (error) {
      throw handlePgDatabaseError(error, 'Error finding user by email');
    }
  }

  async create(
    userValueObject: UserCreationValueObject,
  ): Promise<UserEntity | null> {
    try {
      const userDbModel =
        UserPersistenceMapper.toDbModelFromCreationValueObject(userValueObject);

      const createdDbUser = await this.db<UserDbModel>(this.tableName)
        .insert(userDbModel)
        .returning('*');

      return createdDbUser && createdDbUser.length > 0
        ? UserPersistenceMapper.toEntity(createdDbUser[0])
        : null;
    } catch (error) {
      throw handlePgDatabaseError(error, 'Error creating user');
    }
  }

  async update(
    id: string,
    userValueObject: UserUpdateValueObject,
  ): Promise<UserEntity | null> {
    try {
      const userDbModel =
        UserPersistenceMapper.toDbModelFromUpdateValueObject(userValueObject);

      if (isEmptyObject(userDbModel)) {
        return this.findById(id);
      }

      const updatedDbUser = await this.db<UserDbModel>(this.tableName)
        .where({ id })
        .limit(1)
        .update(userDbModel)
        .returning('*');

      return updatedDbUser && updatedDbUser.length > 0
        ? UserPersistenceMapper.toEntity(updatedDbUser[0])
        : null;
    } catch (error) {
      throw handlePgDatabaseError(error, 'Error updating user');
    }
  }

  async delete(id: string): Promise<UserEntity | null> {
    try {
      const deletedDbUser = await this.db<UserDbModel>(this.tableName)
        .where({ id })
        .limit(1)
        .delete()
        .returning('*');

      return deletedDbUser && deletedDbUser.length > 0
        ? UserPersistenceMapper.toEntity(deletedDbUser[0])
        : null;
    } catch (error) {
      throw handlePgDatabaseError(error, 'Error deleting user');
    }
  }
}
