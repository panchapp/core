import { PaginatedEntity } from '@/users/domain/entities/paginated.entity';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { PaginatedUserDto } from '@/users/infrastructure/controllers/dtos/output/paginated-user.dto';
import { UserDto } from '@/users/infrastructure/controllers/dtos/output/user.dto';

export class UserDtoMapper {
  static toDto(entity: UserEntity): UserDto {
    const dto = new UserDto();
    dto.id = entity.id;
    dto.email = entity.email;
    dto.name = entity.name;
    dto.createdAt = entity.createdAt;
    dto.isSuperAdmin = entity.isSuperAdmin;
    return dto;
  }

  static toDtos(entities: UserEntity[]): UserDto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  static toPaginatedDto(
    paginatedEntity: PaginatedEntity<UserEntity>,
  ): PaginatedUserDto {
    const dto = new PaginatedUserDto();
    dto.totalCount = paginatedEntity.totalCount;
    dto.currentPage = paginatedEntity.currentPage;
    dto.totalPages = paginatedEntity.totalPages;
    dto.items = this.toDtos(paginatedEntity.items);
    return dto;
  }
}
