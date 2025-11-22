import { UsersService } from '@/users/application/services/users.service';
import { Controller } from '@nestjs/common';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
