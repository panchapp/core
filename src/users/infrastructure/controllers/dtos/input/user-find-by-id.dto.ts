import { IsUUID } from 'class-validator';

export class UserFindByIdDto {
  @IsUUID()
  id!: string;
}
