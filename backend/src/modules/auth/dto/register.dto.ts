import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsNumber } from 'class-validator';

export enum FrontendRole {
  ESTUDIANTE = 'estudiante',
  DOCENTE = 'docente',
  COORDINADOR = 'coordinador',
  ADMINISTRADOR = 'administrador',
  REPRESENTANTE_EMPRESA = 'empresa',
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsEnum(FrontendRole)
  rol: FrontendRole;

  @IsString()
  @IsOptional()
  codigo_universitario?: string;

  @IsString()
  @IsOptional()
  carrera?: string;

  @IsNumber()
  @IsOptional()
  semestre?: number;
}
