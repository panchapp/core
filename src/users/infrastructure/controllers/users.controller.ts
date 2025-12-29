import { UsersService } from '@/users/application/services/users.service';
import { UserCreateDto } from '@/users/infrastructure/controllers/dtos/input/user-create.dto';
import { UserFindAllDto } from '@/users/infrastructure/controllers/dtos/input/user-find-all.dto';
import { UserFindByEmailDto } from '@/users/infrastructure/controllers/dtos/input/user-find-by-email.dto';
import { UserFindByIdDto } from '@/users/infrastructure/controllers/dtos/input/user-find-by-id.dto';
import { UserUpdateDto } from '@/users/infrastructure/controllers/dtos/input/user-update.dto';
import { PaginatedUserDto } from '@/users/infrastructure/controllers/dtos/output/paginated-user.dto';
import { UserDto } from '@/users/infrastructure/controllers/dtos/output/user.dto';
import { UserValueObjectMapper } from '@/users/infrastructure/controllers/mappers/input/user-value-object.mapper';
import { UserDtoMapper } from '@/users/infrastructure/controllers/mappers/output/user-dto.mapper';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAll(@Query() queryDto: UserFindAllDto): Promise<PaginatedUserDto> {
    const valueObject = UserValueObjectMapper.toFindAllValueObject(queryDto);
    const result = await this.usersService.getAll(valueObject);
    return UserDtoMapper.toPaginatedDto(result);
  }

  @Get(':id')
  async getById(@Param() paramsDto: UserFindByIdDto): Promise<UserDto> {
    const user = await this.usersService.getById(paramsDto.id);
    return UserDtoMapper.toDto(user);
  }

  @Get('email/:email')
  async getByEmail(@Param() paramsDto: UserFindByEmailDto): Promise<UserDto> {
    const user = await this.usersService.getByEmail(paramsDto.email);
    return UserDtoMapper.toDto(user);
  }

  @Post()
  async create(@Body() bodyDto: UserCreateDto): Promise<UserDto> {
    const valueObject = UserValueObjectMapper.toCreationValueObject(bodyDto);
    const user = await this.usersService.create(valueObject);
    return UserDtoMapper.toDto(user);
  }

  @Put(':id')
  async update(
    @Param() paramsDto: UserFindByIdDto,
    @Body() bodyDto: UserUpdateDto,
  ): Promise<UserDto> {
    const valueObject = UserValueObjectMapper.toUpdateValueObject(bodyDto);
    const user = await this.usersService.update(paramsDto.id, valueObject);
    return UserDtoMapper.toDto(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() paramsDto: UserFindByIdDto): Promise<void> {
    await this.usersService.delete(paramsDto.id);
  }
}
