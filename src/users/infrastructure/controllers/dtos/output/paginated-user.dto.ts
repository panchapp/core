import { PaginatedDto } from '@/common/dtos/paginated.dto';
import { UserDto } from '@/users/infrastructure/controllers/dtos/output/user.dto';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';

export class PaginatedUserDto implements PaginatedDto<UserDto> {
  @IsInt()
  @Min(0)
  totalCount!: number;

  @IsInt()
  @Min(1)
  currentPage!: number;

  @IsInt()
  @Min(0)
  totalPages!: number;

  @IsArray()
  @ValidateNested({ each: true })
  items!: UserDto[];
}
