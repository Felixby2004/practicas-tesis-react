import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../services/email.service';

@Injectable()
export class CoordinatorService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async getDashboard(coordinadorId: string) {
    const coordinador = await this.prisma.coordinador.findUnique({
      where: { id: coordinadorId },
      include: { facultad: true },
    });

    if (!coordinador) {
      return {
        facultad: null,
        estadisticas: {
          estudiantes: 0,
          practicas: 0,
          tesis: 0,
          docentes: 0,
        },
      };
    }

    const facultadId = coordinador.facultad_id;

    const [estudiantes, practicas, tesis, docentes] = await Promise.all([
      this.prisma.estudiante.count({
        where: { carrera: { facultad_id: facultadId }, activo: true },
      }),
      this.prisma.ofertaPractica.count({
        where: { empresa: { activo: true }, activo: true },
      }),
      this.prisma.proyectoTesis.count({
        where: { estudiante: { carrera: { facultad_id: facultadId } } },
      }),
      this.prisma.docente.count({
        where: { facultad: coordinador.facultad?.nombre || '', activo: true },
      }),
    ]);

    return {
      facultad: coordinador.facultad?.nombre,
      estadisticas: {
        estudiantes,
        practicas,
        tesis,
        docentes,
      },
    };
  }

  async getPostulacionesByFacultad(coordinadorId: string) {
    const coordinador = await this.prisma.coordinador.findUnique({
      where: { id: coordinadorId },
      include: { facultad: true },
    });

    if (!coordinador) {
      return [];
    }

    const postulaciones = await this.prisma.postulacion.findMany({
      where: {
        estudiante: {
          carrera: { facultad_id: coordinador.facultad_id },
        },
      },
      include: {
        estudiante: { include: { usuario: true } },
        oferta: { include: { empresa: true } },
      },
      orderBy: { fecha_postulacion: 'desc' },
    });

    return postulaciones;
  }

  async getTesisByFacultad(coordinadorId: string) {
    const coordinador = await this.prisma.coordinador.findUnique({
      where: { id: coordinadorId },
      include: { facultad: true },
    });

    if (!coordinador) {
      return [];
    }

    const tesis = await this.prisma.proyectoTesis.findMany({
      where: {
        estudiante: {
          carrera: { facultad_id: coordinador.facultad_id },
        },
      },
      include: {
        estudiante: { include: { usuario: true, carrera: { include: { facultad: true } } } },
        asesor: { include: { usuario: true } },
      },
      orderBy: { fecha_registro: 'desc' },
    });

    return tesis;
  }

  async getEstadisticasByFacultad(coordinadorId: string) {
    const coordinador = await this.prisma.coordinador.findUnique({
      where: { id: coordinadorId },
      include: { facultad: true },
    });

    if (!coordinador) {
      throw new NotFoundException('Coordinador no encontrado');
    }

    const facultadId = coordinador.facultad_id;

    const [postulacionesPorEstado, tesisPorEstado, estudiantesPorCarrera] = await Promise.all([
      this.prisma.postulacion.groupBy({
        by: ['estado'],
        where: {
          estudiante: { carrera: { facultad_id: facultadId } },
        },
        _count: true,
      }),
      this.prisma.proyectoTesis.groupBy({
        by: ['estado'],
        where: {
          estudiante: { carrera: { facultad_id: facultadId } },
        },
        _count: true,
      }),
      this.prisma.estudiante.groupBy({
        by: ['carrera_id'],
        where: {
          carrera: { facultad_id: facultadId },
        },
        _count: true,
      }),
    ]);

    return {
      postulacionesPorEstado,
      tesisPorEstado,
      estudiantesPorCarrera,
    };
  }

  async getPostulanteDetalles(postulacionId: string) {
    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id: postulacionId },
      include: {
        estudiante: {
          include: {
            usuario: true,
            carrera: true,
            postulaciones: {
              where: { estado: 'aprobada' },
            },
          },
        },
        oferta: { include: { empresa: true } },
        asesores: { include: { docente: { include: { usuario: true } } } },
      },
    });

    if (!postulacion) {
      throw new NotFoundException('Postulación no encontrada');
    }

    return postulacion;
  }

  async aprobarPostulante(postulacionId: string, docenteId: string) {
    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id: postulacionId },
      include: {
        estudiante: { include: { usuario: true } },
        oferta: { include: { empresa: true } },
        asesores: { include: { docente: { include: { usuario: true } } } },
      },
    });

    if (!postulacion) {
      throw new NotFoundException('Postulación no encontrada');
    }

    // Actualizar estado de postulación a aprobada
    const postulacionActualizada = await this.prisma.postulacion.update({
      where: { id: postulacionId },
      data: {
        estado: 'aprobada',
        fecha_aprobacion: new Date(),
      },
    });

    // Crear asignación de asesor
    const asignacion = await this.prisma.asignacionAsesor.create({
      data: {
        postulacion_id: postulacionId,
        docente_id: docenteId,
      },
      include: {
        docente: { include: { usuario: true } },
      },
    });

    // Decrementar vacantes de la oferta
    if (postulacion.oferta) {
      const vacantesActuales = postulacion.oferta.vacantes || 0;
      const nuevasVacantes = Math.max(0, vacantesActuales - 1);

      await this.prisma.ofertaPractica.update({
        where: { id: postulacion.oferta_id },
        data: {
          vacantes: nuevasVacantes,
          estado: nuevasVacantes === 0 ? 'cerrada' : postulacion.oferta.estado,
        },
      });
    }

    // Enviar email al estudiante
    await this.emailService.sendPostulacionAprobadaEmail(
      postulacion.estudiante.usuario.correo,
      postulacion.estudiante.usuario.nombre_completo,
      postulacion.oferta.titulo,
      postulacion.oferta.empresa.razon_social,
      asignacion.docente.usuario.nombre_completo
    );

    return postulacionActualizada;
  }

  async rechazarPostulante(postulacionId: string, motivo?: string) {
    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id: postulacionId },
      include: {
        estudiante: { include: { usuario: true } },
        oferta: true,
      },
    });

    if (!postulacion) {
      throw new NotFoundException('Postulación no encontrada');
    }

    const resultado = await this.prisma.postulacion.update({
      where: { id: postulacionId },
      data: {
        estado: 'rechazada',
      },
    });

    // Enviar email al estudiante
    await this.emailService.sendPostulacionRechazadaEmail(
      postulacion.estudiante.usuario.correo,
      postulacion.estudiante.usuario.nombre_completo,
      postulacion.oferta.titulo
    );

    return resultado;
  }

  async getDocentesByFacultad(coordinadorId: string) {
    const coordinador = await this.prisma.coordinador.findUnique({
      where: { id: coordinadorId },
      include: { facultad: true },
    });

    if (!coordinador) {
      return {};
    }

    // Get docentes with facultad matching the coordinator's facultad
    const docentes = await this.prisma.docente.findMany({
      where: {
        facultad: coordinador.facultad?.nombre || '',
        activo: true,
      },
    });

    // Group by facultad  
    const byFacultad: { [key: string]: number } = {};
    docentes.forEach((docente: any) => {
      const facultad = docente.facultad || 'Desconocida';
      byFacultad[facultad] = (byFacultad[facultad] || 0) + 1;
    });

    return byFacultad;
  }
}