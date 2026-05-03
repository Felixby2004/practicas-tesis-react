import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

// Usar require para bcryptjs
const bcrypt = require('bcryptjs');

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(data: { correo: string; contrasena: string }) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: data.correo },
      include: {
        rol: true,
        estudiante: true,
        docente: true,
        representante: {
          include: {
            empresa: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(data.contrasena, usuario.contrasena);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      nombre_completo: usuario.nombre_completo,
      rol: usuario.rol.nombre,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre_completo: usuario.nombre_completo,
        rol: usuario.rol.nombre,
        estudiante: usuario.estudiante ? { id: usuario.estudiante.id } : null,
      },
    };
  }

  async register(data: any) {
    const existingUser = await this.prisma.usuario.findUnique({
      where: { correo: data.correo },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const rol = await this.prisma.rol.findUnique({
      where: { nombre: data.rol },
    });

    if (!rol) {
      throw new NotFoundException(`Rol ${data.rol} no encontrado`);
    }

    const hashedPassword = await bcrypt.hash(data.contrasena, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        correo: data.correo,
        contrasena: hashedPassword,
        nombre_completo: data.nombre_completo,
        rol_id: rol.id,
      },
    });

    if (data.rol === 'ESTUDIANTE') {
      await this.prisma.estudiante.create({
        data: {
          usuario_id: usuario.id,
          codigo_univ: data.codigo_univ || '',
          carrera_id: data.carrera_id || '',
          ciclo: data.ciclo || 1,
        },
      });
    } else if (data.rol === 'DOCENTE') {
      await this.prisma.docente.create({
        data: {
          usuario_id: usuario.id,
          especialidad: data.especialidad || '',
          facultad: data.facultad || '',
        },
      });
    } else if (data.rol === 'REPRESENTANTE_EMPRESA') {
      if (!data.empresa_id) {
        throw new Error('Para representante de empresa se requiere ID de empresa');
      }
      await this.prisma.representanteEmpresa.create({
        data: {
          usuario_id: usuario.id,
          empresa_id: data.empresa_id,
          cargo: data.cargo || '',
        },
      });
    }

    return {
      message: 'Usuario registrado exitosamente',
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre_completo: usuario.nombre_completo,
        rol: data.rol,
      },
    };
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return { valid: true, payload };
    } catch (error) {
      return { valid: false };
    }
  }
}