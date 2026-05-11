import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../services/email.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  private generarContrasena(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let contrasena = '';
    for (let i = 0; i < 10; i++) {
      contrasena += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return contrasena;
  }

  async createEstudiante(data: any) {
    const existingUser = await this.prisma.usuario.findUnique({
      where: { correo: data.correo },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const contrasenaTemporal = this.generarContrasena();
    const hashedPassword = await bcrypt.hash(contrasenaTemporal, 10);

    const rol = await this.prisma.rol.findUnique({
      where: { nombre: 'ESTUDIANTE' },
    });

    const usuario = await this.prisma.usuario.create({
      data: {
        correo: data.correo,
        contrasena: hashedPassword,
        nombre_completo: data.nombre_completo,
        rol_id: rol!.id,
        debe_cambiar_contrasena: true,
      },
    });

    await this.prisma.estudiante.create({
      data: {
        usuario_id: usuario.id,
        codigo_univ: data.codigo_univ,
        carrera_id: data.carrera_id,
        ciclo: data.ciclo,
        expediente_url: data.expediente_url,
        activo: true,
      },
    });

    await this.emailService.sendWelcomeEmail(data.correo, data.nombre_completo, contrasenaTemporal);

    return {
      message: 'Estudiante creado exitosamente',
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre_completo: usuario.nombre_completo,
        contrasena_temporal: contrasenaTemporal,
      },
    };
  }

  async createDocente(data: any) {
    const existingUser = await this.prisma.usuario.findUnique({
      where: { correo: data.correo },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const contrasenaTemporal = this.generarContrasena();
    const hashedPassword = await bcrypt.hash(contrasenaTemporal, 10);

    const rol = await this.prisma.rol.findUnique({
      where: { nombre: 'DOCENTE' },
    });

    const usuario = await this.prisma.usuario.create({
      data: {
        correo: data.correo,
        contrasena: hashedPassword,
        nombre_completo: data.nombre_completo,
        rol_id: rol!.id,
        debe_cambiar_contrasena: true,
      },
    });

    await this.prisma.docente.create({
      data: {
        usuario_id: usuario.id,
        especialidad: data.especialidad,
        facultad: data.facultad,  // 👈 Cambiar 'facultad_id' a 'facultad'
        activo: true,
      },
    });

    await this.emailService.sendWelcomeEmail(data.correo, data.nombre_completo, contrasenaTemporal);

    return {
      message: 'Docente creado exitosamente',
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre_completo: usuario.nombre_completo,
        contrasena_temporal: contrasenaTemporal,
      },
    };
  }

  async createCoordinador(data: any) {
    const existingUser = await this.prisma.usuario.findUnique({
      where: { correo: data.correo },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const contrasenaTemporal = this.generarContrasena();
    const hashedPassword = await bcrypt.hash(contrasenaTemporal, 10);

    const rol = await this.prisma.rol.findUnique({
      where: { nombre: 'COORDINADOR' },
    });

    const usuario = await this.prisma.usuario.create({
      data: {
        correo: data.correo,
        contrasena: hashedPassword,
        nombre_completo: data.nombre_completo,
        rol_id: rol!.id,
        debe_cambiar_contrasena: true,
      },
    });

    await this.prisma.coordinador.create({
      data: {
        usuario_id: usuario.id,
        facultad_id: data.facultad_id,
        activo: true,
      },
    });

    await this.emailService.sendWelcomeEmail(data.correo, data.nombre_completo, contrasenaTemporal);

    return {
      message: 'Coordinador creado exitosamente',
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre_completo: usuario.nombre_completo,
        contrasena_temporal: contrasenaTemporal,
      },
    };
  }

  async createRepresentante(data: any) {
    const existingUser = await this.prisma.usuario.findUnique({
      where: { correo: data.correo },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const contrasenaTemporal = this.generarContrasena();
    const hashedPassword = await bcrypt.hash(contrasenaTemporal, 10);

    const rol = await this.prisma.rol.findUnique({
      where: { nombre: 'REPRESENTANTE_EMPRESA' },
    });

    const usuario = await this.prisma.usuario.create({
      data: {
        correo: data.correo,
        contrasena: hashedPassword,
        nombre_completo: data.nombre_completo,
        rol_id: rol!.id,
        debe_cambiar_contrasena: true,
      },
    });

    await this.prisma.representanteEmpresa.create({
      data: {
        usuario_id: usuario.id,
        empresa_id: data.empresa_id,
        cargo: data.cargo,
        activo: true,
      },
    });

    await this.emailService.sendWelcomeEmail(data.correo, data.nombre_completo, contrasenaTemporal);

    return {
      message: 'Representante creado exitosamente',
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre_completo: usuario.nombre_completo,
        contrasena_temporal: contrasenaTemporal,
      },
    };
  }

  async getDataForForms() {
    const [carreras, facultades, empresas] = await Promise.all([
      this.prisma.carrera.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.facultad.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.empresa.findMany({
        where: { activo: true },
        orderBy: { razon_social: 'asc' },
      }),
    ]);

    return { carreras, facultades, empresas };
  }
}