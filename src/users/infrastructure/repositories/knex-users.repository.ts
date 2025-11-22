import { CustomException } from '@/common/exceptions/custom.exception';
import { KNEX_DATABASE_TOKEN } from '@/database/database.tokens';
import { UserCreateDto } from '@/users/domain/dtos/user-create.dto';
import { UserUpdateDto } from '@/users/domain/dtos/user-update.dto';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UsersRepository } from '@/users/domain/repositories/users.repository';
import { USERS_TABLE_TOKEN } from '@/users/domain/tokens/users.tokens';
import { UserPersistenceMapper } from '@/users/infrastructure/repositories/mappers/user-persistence.mapper';
import { UserDbModel } from '@/users/infrastructure/repositories/models/user-db.model';
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class KnexUsersRepository implements UsersRepository {
  private readonly tableName = USERS_TABLE_TOKEN;
  constructor(@Inject(KNEX_DATABASE_TOKEN) private readonly db: Knex) {}

  async findAll(): Promise<UserEntity[]> {
    try {
      const foundDbUsers = await this.db<UserDbModel>(this.tableName).select(
        '*',
      );
      return foundDbUsers.map((user) => UserPersistenceMapper.toEntity(user));
    } catch (error) {
      throw CustomException.persistence('Error finding all users', error);
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const foundDbUser = await this.db<UserDbModel>(this.tableName)
        .where({ id })
        .first();
      return foundDbUser ? UserPersistenceMapper.toEntity(foundDbUser) : null;
    } catch (error) {
      throw CustomException.persistence('Error finding user by id', error);
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const foundDbUser = await this.db<UserDbModel>(this.tableName)
        .where({ email })
        .first();
      return foundDbUser ? UserPersistenceMapper.toEntity(foundDbUser) : null;
    } catch (error) {
      throw CustomException.persistence('Error finding user by email', error);
    }
  }

  async create(user: UserCreateDto): Promise<UserEntity | null> {
    try {
      const userDbModel = UserPersistenceMapper.toDbModel(user);
      const createdDbUser = await this.db<UserDbModel>(this.tableName)
        .insert(userDbModel)
        .returning('*')
        .first();
      return createdDbUser
        ? UserPersistenceMapper.toEntity(createdDbUser)
        : null;
    } catch (error) {
      throw CustomException.persistence('Error creating user', error);
    }
  }

  async update(id: string, user: UserUpdateDto): Promise<UserEntity | null> {
    try {
      const userDbModel = UserPersistenceMapper.toDbModel(user);
      const updatedDbUser = await this.db<UserDbModel>(this.tableName)
        .where({ id })
        .update(userDbModel)
        .returning('*')
        .first();
      return updatedDbUser
        ? UserPersistenceMapper.toEntity(updatedDbUser)
        : null;
    } catch (error) {
      throw CustomException.persistence('Error updating user', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db(this.tableName).where({ id }).delete();
    } catch (error) {
      throw CustomException.persistence('Error deleting user', error);
    }
  }
}
