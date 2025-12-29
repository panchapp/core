import { PaginatedEntity } from '@/users/domain/entities/paginated.entity';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserCreationValueObject } from '@/users/domain/value-objects/user-creation.value-object';
import { UserFindAllValueObject } from '@/users/domain/value-objects/user-find-all.value-object';
import { UserUpdateValueObject } from '@/users/domain/value-objects/user-update.value-object';

export interface UsersRepository {
  findAll(
    valueObject: UserFindAllValueObject,
  ): Promise<PaginatedEntity<UserEntity>>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(valueObject: UserCreationValueObject): Promise<UserEntity | null>;
  update(
    id: string,
    valueObject: UserUpdateValueObject,
  ): Promise<UserEntity | null>;
  delete(id: string): Promise<UserEntity | null>;
}
