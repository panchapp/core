import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDto } from '@/users/infrastructure/controllers/dtos/output/user.dto';

export class UserDtoMapper {
  static toDto(entity: UserEntity): UserDto {
    const dto = new UserDto();
    dto.id = entity.id;
    dto.email = entity.email;
    dto.name = entity.name;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static toDtos(entities: UserEntity[]): UserDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
