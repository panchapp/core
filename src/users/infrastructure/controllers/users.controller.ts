import { Controller } from '@nestjs/common';
import { UsersService } from '@/users/application/services/users.service';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
