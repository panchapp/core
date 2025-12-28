import { IsUUID } from 'class-validator';

export class UserByIdDto {
  @IsUUID()
  id!: string;
}
