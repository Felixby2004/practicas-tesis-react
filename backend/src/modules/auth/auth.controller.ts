import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';

// Definir DTOs locales para evitar conflictos
class LoginDto {
  correo: string;
  contrasena: string;
}

class RegisterDto {
  correo: string;
  contrasena: string;
  nombre_completo: string;
  rol: string;
  codigo_univ?: string;
  carrera?: string;
  ciclo?: number;
  especialidad?: string;
  facultad?: string;
  empresa_id?: string;
  cargo?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}