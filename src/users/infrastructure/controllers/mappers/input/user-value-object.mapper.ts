import { UserCreationValueObject } from '@/users/domain/value-objects/user-creation.value-object';
import { UserUpdateValueObject } from '@/users/domain/value-objects/user-update.value-object';
import { UserUpdateDto } from '@/users/infrastructure/controllers/dtos/input/user-update.dto';
import { UserCreateDto } from '../../dtos/input/user-create.dto';

export class UserValueObjectMapper {
  static toCreationValueObject(dto: UserCreateDto): UserCreationValueObject {
    return UserCreationValueObject.create({
      email: dto.email,
      name: dto.name,
      googleId: dto.googleId,
      isSuperAdmin: dto.isSuperAdmin,
    });
  }

  static toUpdateValueObject(dto: UserUpdateDto): UserUpdateValueObject {
    return UserUpdateValueObject.create({
      email: dto.email,
      name: dto.name,
      googleId: dto.googleId,
      isSuperAdmin: dto.isSuperAdmin,
    });
  }
}
