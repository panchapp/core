import { IsDate, IsEmail, IsString, IsUUID } from 'class-validator';

export class UserDto {
  @IsUUID()
  id!: string;

  @IsEmail()
  email!: string;

  @IsString()
  name!: string;

  @IsDate()
  createdAt?: Date;
}
