import { Controller, Get } from '@nestjs/common';

@Controller('api/v1/auth')
export class AuthController {
  @Get('login')
  login() {
    return { message: 'Login successful' };
  }
}
