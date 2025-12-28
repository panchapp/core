import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserCreationValueObject } from '@/users/domain/value-objects/user-creation.value-object';
import { UserUpdateValueObject } from '@/users/domain/value-objects/user-update.value-object';

export interface UsersRepository {
  findAll(): Promise<UserEntity[]>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(user: UserCreationValueObject): Promise<UserEntity | null>;
  update(id: string, user: UserUpdateValueObject): Promise<UserEntity | null>;
  delete(id: string): Promise<UserEntity | null>;
}
