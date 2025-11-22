import { UserCreateDto } from '@/users/domain/dtos/user-create.dto';
import { UserUpdateDto } from '@/users/domain/dtos/user-update.dto';
import { UserEntity } from '@/users/domain/entities/user.entity';

export interface UsersRepository {
  findAll(): Promise<UserEntity[]>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(user: UserCreateDto): Promise<UserEntity | null>;
  update(id: string, user: UserUpdateDto): Promise<UserEntity | null>;
  delete(id: string): Promise<void>;
}
