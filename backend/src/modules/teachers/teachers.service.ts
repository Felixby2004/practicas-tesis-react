import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeacherService {
  private readonly logger = new Logger(TeacherService.name);

  constructor(private prisma: PrismaService) {}

  async getDashboard(usuarioId: string) {
    this.logger.log(`Buscando dashboard para usuario ID: ${usuarioId}`);

    // Primero, obtener el docente a partir del usuario_id
    const docente = await this.prisma.docente.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (!docente) {
      this.logger.warn(`Docente no encontrado para usuario_id: ${usuarioId}`);
      return {
        asesorias: { total: 0, list: [] },
        tesisAsesoradas: { total: 0, list: [] },
        tesisJurado: { total: 0, list: [] },
        evaluacionesPendientes: 0,
      };
    }

    this.logger.log(`Docente encontrado - ID: ${docente.id}, Especialidad: ${docente.especialidad}`);

    // Get all assignments where this teacher is advisor
    const asesorias = await this.prisma.asignacionAsesor.findMany({
      where: { docente_id: docente.id },
      include: {
        postulacion: {
          include: {
            estudiante: { include: { usuario: true } },
            oferta: { include: { empresa: true } },
            horas: true,
            informes: true,
          },
        },
      },
    });

    this.logger.log(`Asesorías encontradas: ${asesorias.length}`);

    const tesisAsesoradas = await this.prisma.proyectoTesis.findMany({
      where: { asesor_id: docente.id },
      include: {
        estudiante: { include: { usuario: true } },
        entregables: true,
      },
    });

    const tesisJurado = await this.prisma.juradoTesis.findMany({
      where: { docente_id: docente.id },
      include: {
        tesis: {
          include: {
            estudiante: { include: { usuario: true } },
            sustentacion: true,
          },
        },
      },
    });

    // Count pending reports from postulations where this teacher is advisor
    const postulacionIds = asesorias.map(a => a.postulacion_id);
    const evaluacionesPendientes = await this.prisma.informePractica.count({
      where: {
        postulacion_id: { in: postulacionIds },
        estado: 'pendiente',
      },
    });

    return {
      asesorias: {
        total: asesorias.length,
        list: asesorias,
      },
      tesisAsesoradas: {
        total: tesisAsesoradas.length,
        list: tesisAsesoradas,
      },
      tesisJurado: {
        total: tesisJurado.length,
        list: tesisJurado,
      },
      evaluacionesPendientes,
    };
  }

  async getInformesPendientes(usuarioId: string) {
    const docente = await this.prisma.docente.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (!docente) {
      return [];
    }

    const asesorias = await this.prisma.asignacionAsesor.findMany({
      where: { docente_id: docente.id },
      select: { postulacion_id: true },
    });

    const postulacionIds = asesorias.map(a => a.postulacion_id);

    const informes = await this.prisma.informePractica.findMany({
      where: {
        postulacion_id: { in: postulacionIds },
        estado: 'pendiente',
      },
      include: {
        postulacion: {
          include: {
            estudiante: { include: { usuario: true } },
            oferta: { include: { empresa: true } },
          },
        },
      },
      orderBy: { fecha_entrega: 'asc' },
    });

    return informes;
  }

  async revisarInforme(informeId: string, estado: string, observaciones?: string) {
    return this.prisma.informePractica.update({
      where: { id: informeId },
      data: {
        estado,
        observaciones,
        fecha_revision: new Date(),
      },
      include: {
        postulacion: {
          include: {
            estudiante: { include: { usuario: true } },
            oferta: { include: { empresa: true } },
          },
        },
      },
    });
  }

  async evaluarPractica(data: {
    postulacion_id: string;
    rubrica: any;
    nota_final: number;
    comentarios?: string;
    evaluador_id: string;
  }) {
    // Verificar si ya existe evaluación
    const existe = await this.prisma.evaluacionPractica.findFirst({
      where: { postulacion_id: data.postulacion_id },
    });

    if (existe) {
      return this.prisma.evaluacionPractica.update({
        where: { id: existe.id },
        data: {
          rubrica: data.rubrica,
          nota_final: data.nota_final,
          comentarios: data.comentarios,
        },
      });
    }

    return this.prisma.evaluacionPractica.create({
      data: {
        postulacion_id: data.postulacion_id,
        rubrica: data.rubrica,
        nota_final: data.nota_final,
        comentarios: data.comentarios,
        evaluador_id: data.evaluador_id,
      },
    });
  }

  async getPerfil(usuarioId: string) {
    const docente = await this.prisma.docente.findUnique({
      where: { usuario_id: usuarioId },
      include: {
        usuario: true,
      },
    });
    return docente;
  }
}