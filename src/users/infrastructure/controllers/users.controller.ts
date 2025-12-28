import { UsersService } from '@/users/application/services/users.service';
import { UserByEmailDto } from '@/users/infrastructure/controllers/dtos/input/user-by-email.dto';
import { UserByIdDto } from '@/users/infrastructure/controllers/dtos/input/user-by-id.dto';
import { UserCreateDto } from '@/users/infrastructure/controllers/dtos/input/user-create.dto';
import { UserUpdateDto } from '@/users/infrastructure/controllers/dtos/input/user-update.dto';
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
} from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAll(): Promise<UserDto[]> {
    const users = await this.usersService.getAll();
    return UserDtoMapper.toDtos(users);
  }

  @Get(':id')
  async getById(@Param() paramsDto: UserByIdDto): Promise<UserDto> {
    const user = await this.usersService.getById(paramsDto.id);
    return UserDtoMapper.toDto(user);
  }

  @Get('email/:email')
  async getByEmail(@Param() paramsDto: UserByEmailDto): Promise<UserDto> {
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
    @Param() paramsDto: UserByIdDto,
    @Body() bodyDto: UserUpdateDto,
  ): Promise<UserDto> {
    const valueObject = UserValueObjectMapper.toUpdateValueObject(bodyDto);
    const user = await this.usersService.update(paramsDto.id, valueObject);
    return UserDtoMapper.toDto(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() paramsDto: UserByIdDto): Promise<void> {
    await this.usersService.delete(paramsDto.id);
  }
}
