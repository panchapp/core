import { CustomException } from '@/common/exceptions/custom.exception';
import { UserCreateDto } from '@/users/domain/dtos/user-create.dto';
import { UserUpdateDto } from '@/users/domain/dtos/user-update.dto';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UsersRepository } from '@/users/domain/repositories/users.repository';
import { USERS_REPOSITORY_TOKEN } from '@/users/domain/tokens/users.tokens';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY_TOKEN)
    private readonly usersRepository: UsersRepository,
  ) {}

  async getAllUsers(): Promise<UserEntity[]> {
    try {
      const foundUsers = await this.usersRepository.findAll();
      return foundUsers;
    } catch (error) {
      throw CustomException.from(error);
    }
  }

  async getUserById(id: string): Promise<UserEntity | null> {
    try {
      const foundUser = await this.usersRepository.findById(id);
      return foundUser;
    } catch (error) {
      throw CustomException.from(error);
    }
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    try {
      const foundUser = await this.usersRepository.findByEmail(email);
      return foundUser;
    } catch (error) {
      throw CustomException.from(error);
    }
  }

  async createUser(user: UserCreateDto): Promise<UserEntity | null> {
    try {
      const createdUser = await this.usersRepository.create(user);
      return createdUser;
    } catch (error) {
      throw CustomException.from(error);
    }
  }

  async updateUser(
    id: string,
    user: UserUpdateDto,
  ): Promise<UserEntity | null> {
    try {
      const updatedUser = await this.usersRepository.update(id, user);
      return updatedUser;
    } catch (error) {
      throw CustomException.from(error);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.usersRepository.delete(id);
    } catch (error) {
      throw CustomException.from(error);
    }
  }
}
