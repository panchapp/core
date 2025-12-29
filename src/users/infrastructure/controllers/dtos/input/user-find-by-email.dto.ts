import { IsEmail } from 'class-validator';

export class UserFindByEmailDto {
  @IsEmail()
  email!: string;
}
