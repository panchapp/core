import { CustomException } from '@/common/exceptions/custom.exception';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UsersRepository } from '@/users/domain/repositories/users.repository';
import { USERS_REPOSITORY_TOKEN } from '@/users/domain/tokens/users.tokens';
import { UserCreationValueObject } from '@/users/domain/value-objects/user-creation.value-object';
import { UserUpdateValueObject } from '@/users/domain/value-objects/user-update.value-object';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY_TOKEN)
    private readonly usersRepository: UsersRepository,
  ) {}

  async getAll(): Promise<UserEntity[]> {
    try {
      const foundUsers = await this.usersRepository.findAll();
      return foundUsers;
    } catch (error) {
      throw CustomException.from(error);
    }
  }

  async getById(id: string): Promise<UserEntity> {
    try {
      const foundUser = await this.usersRepository.findById(id);
      if (!foundUser) {
        throw CustomException.notFound('User not found', undefined, { id });
      }
      return foundUser;
    } catch (error) {
      throw CustomException.from(error);
    }
  }

  async getByEmail(email: string): Promise<UserEntity> {
    try {
      const foundUser = await this.usersRepository.findByEmail(email);
      if (!foundUser) {
        throw CustomException.notFound('User not found', undefined, { email });
      }
      return foundUser;
    } catch (error) {
      throw CustomException.from(error);
    }
  }

  async create(userValueObject: UserCreationValueObject): Promise<UserEntity> {
    try {
      const createdUser = await this.usersRepository.create(userValueObject);
      if (!createdUser) {
        throw CustomException.internalServerError(
          'Failed to create user',
          undefined,
          { email: userValueObject.email },
        );
      }
      return createdUser;
    } catch (error) {
      throw CustomException.from(error);
    }
  }

  async update(
    id: string,
    userValueObject: UserUpdateValueObject,
  ): Promise<UserEntity> {
    try {
      const updatedUser = await this.usersRepository.update(
        id,
        userValueObject,
      );
      if (!updatedUser) {
        throw CustomException.notFound('User not found', undefined, { id });
      }
      return updatedUser;
    } catch (error) {
      throw CustomException.from(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const deletedUser = await this.usersRepository.delete(id);
      if (!deletedUser) {
        throw CustomException.notFound('User not found', undefined, { id });
      }
      return;
    } catch (error) {
      throw CustomException.from(error);
    }
  }
}
