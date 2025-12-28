import { IsEmail } from 'class-validator';

export class UserByEmailDto {
  @IsEmail()
  email!: string;
}
