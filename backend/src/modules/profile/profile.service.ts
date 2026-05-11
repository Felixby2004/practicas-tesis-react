import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/profile.dto';
import * as bcrypt from 'bcryptjs';

interface HorasRegistro {
  horas_trabajadas: number;
}

interface Postulacion {
  estado: string;
  horas?: HorasRegistro[];
  informes?: any[];
}

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getPerfil(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        rol: true,
        estudiante: {
          include: { carrera: true },
        },
        docente: true,
        coordinador: {
          include: { facultad: true },
        },
        representante: {
          include: { empresa: true },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: usuario.id,
      correo: usuario.correo,
      nombre_completo: usuario.nombre_completo,
      rol: usuario.rol.nombre,
      debe_cambiar_contrasena: usuario.debe_cambiar_contrasena,
      estudiante: usuario.estudiante ? {
        id: usuario.estudiante.id,
        codigo_univ: usuario.estudiante.codigo_univ,
        carrera: usuario.estudiante.carrera?.nombre,
        carrera_id: usuario.estudiante.carrera_id,
        ciclo: usuario.estudiante.ciclo,
        expediente_url: usuario.estudiante.expediente_url,
        practicas_completadas: usuario.estudiante.practicas_completadas,
        horas_totales: usuario.estudiante.horas_totales,
      } : null,
      docente: usuario.docente ? {
        id: usuario.docente.id,
        especialidad: usuario.docente.especialidad,
        facultad: usuario.docente.facultad,
      } : null,
      coordinador: usuario.coordinador ? {
        id: usuario.coordinador.id,
        facultad: usuario.coordinador.facultad?.nombre,
        facultad_id: usuario.coordinador.facultad_id,
      } : null,
      representante: usuario.representante ? {
        id: usuario.representante.id,
        empresa: usuario.representante.empresa?.razon_social,
        empresa_id: usuario.representante.empresa_id,
        cargo: usuario.representante.cargo,
      } : null,
    };
  }

  async updatePerfil(usuarioId: string, data: UpdateProfileDto) {
    const usuario = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        nombre_completo: data.nombre_completo,
      },
    });

    return {
      id: usuario.id,
      correo: usuario.correo,
      nombre_completo: usuario.nombre_completo,
    };
  }

  async changePassword(usuarioId: string, data: ChangePasswordDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(data.contrasena_actual, usuario.contrasena);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const hashedNewPassword = await bcrypt.hash(data.contrasena_nueva, 10);

    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        contrasena: hashedNewPassword,
        debe_cambiar_contrasena: false,
        ultimo_cambio_contrasena: new Date(),
      },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async getEstadisticas(usuarioId: string, rol: string) {
    if (rol === 'ESTUDIANTE') {
      const estudiante = await this.prisma.estudiante.findFirst({
        where: { usuario_id: usuarioId },
        include: {
          postulaciones: {
            include: {
              oferta: { include: { empresa: true } },
              horas: true,
              informes: true,
            },
          },
          proyectos_tesis: true,
        },
      });

      const postulaciones = estudiante?.postulaciones || [];
      
      const horasTotales = postulaciones
        .flatMap((p: any) => p.horas || [])
        .reduce((acc: number, h: any) => acc + h.horas_trabajadas, 0);

      const practicaAprobada = postulaciones.find((p: any) => p.estado === 'aprobada');

      return {
        horas_totales: horasTotales,
        practica_activa: !!practicaAprobada,
        tesis_registrada: (estudiante?.proyectos_tesis?.length || 0) > 0,
        postulaciones_pendientes: postulaciones.filter((p: any) => p.estado === 'pendiente').length,
        postulaciones_aprobadas: postulaciones.filter((p: any) => p.estado === 'aprobada').length,
      };
    }

    if (rol === 'DOCENTE') {
      const docente = await this.prisma.docente.findFirst({
        where: { usuario_id: usuarioId },
        include: {
          asesorias_practicas: true,
          tesis_asesoradas: true,
          tesis_como_jurado: true,
        },
      });

      return {
        asesorias_practicas: docente?.asesorias_practicas?.length || 0,
        tesis_asesoradas: docente?.tesis_asesoradas?.length || 0,
        tesis_como_jurado: docente?.tesis_como_jurado?.length || 0,
      };
    }

    return {};
  }
}