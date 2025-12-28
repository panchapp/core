import { isNotNullish } from '@/common/utils/type-guards';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserCreationValueObject } from '@/users/domain/value-objects/user-creation.value-object';
import { UserUpdateValueObject } from '@/users/domain/value-objects/user-update.value-object';
import { UserDbModel } from '@/users/infrastructure/repositories/models/user-db.model';

export class UserPersistenceMapper {
  static toEntity(row: UserDbModel): UserEntity {
    return UserEntity.create({
      id: row.id,
      email: row.email,
      name: row.name,
      googleId: row.google_id,
      isSuperAdmin: row.is_super_admin,
      createdAt: row.created_at,
    });
  }

  static toDbModelFromCreationValueObject(
    valueObject: UserCreationValueObject,
  ): Partial<UserDbModel> {
    const dbModel: Partial<UserDbModel> = {};
    dbModel.email = valueObject.email;
    dbModel.name = valueObject.name;
    dbModel.google_id = valueObject.googleId;
    dbModel.is_super_admin = valueObject.isSuperAdmin;
    return dbModel;
  }

  static toDbModelFromUpdateValueObject(
    valueObject: UserUpdateValueObject,
  ): Partial<UserDbModel> {
    const dbModel: Partial<UserDbModel> = {};

    if (isNotNullish(valueObject.email)) {
      dbModel.email = valueObject.email;
    }

    if (isNotNullish(valueObject.name)) {
      dbModel.name = valueObject.name;
    }

    if (isNotNullish(valueObject.googleId)) {
      dbModel.google_id = valueObject.googleId;
    }

    if (isNotNullish(valueObject.isSuperAdmin)) {
      dbModel.is_super_admin = valueObject.isSuperAdmin;
    }

    return dbModel;
  }
}
