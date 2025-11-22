import { isNotNullish } from '@/common/utils/type-guards';
import { UserEntity } from '@/users/domain/entities/user.entity';
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

  static toDbModel(user: Partial<UserEntity>): Partial<UserDbModel> {
    const dbModel: Partial<UserDbModel> = {};

    if (isNotNullish(user.id)) {
      dbModel.id = user.id;
    }

    if (isNotNullish(user.email)) {
      dbModel.email = user.email;
    }

    if (isNotNullish(user.name)) {
      dbModel.name = user.name;
    }

    if (isNotNullish(user.googleId)) {
      dbModel.google_id = user.googleId;
    }

    if (isNotNullish(user.isSuperAdmin)) {
      dbModel.is_super_admin = user.isSuperAdmin;
    }

    if (isNotNullish(user.createdAt)) {
      dbModel.created_at = user.createdAt;
    }

    return dbModel;
  }
}
