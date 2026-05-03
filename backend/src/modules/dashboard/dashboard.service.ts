import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetricasGenerales() {
    const [
      totalEstudiantes,
      estudiantesActivos,
      totalPracticas,
      practicasActivas,
      totalTesis,
      tesisEnCurso,
      conveniosActivos,
      totalEmpresas,
      postulacionesAprobadas,
      totalHoras,
    ] = await Promise.all([
      this.prisma.estudiante.count(),
      this.prisma.estudiante.count({ where: { activo: true } }),
      this.prisma.ofertaPractica.count(),
      this.prisma.ofertaPractica.count({ where: { estado: 'abierta', activo: true } }),
      this.prisma.proyectoTesis.count(),
      this.prisma.proyectoTesis.count({ where: { estado: { in: ['propuesta', 'en_curso'] } } }),
      this.prisma.convenio.count({ where: { estado: 'activo' } }),
      this.prisma.empresa.count({ where: { activo: true } }),
      this.prisma.postulacion.count({ where: { estado: 'aprobada' } }),
      this.prisma.registroHoras.aggregate({ _sum: { horas_trabajadas: true } }),
    ]);

    return {
      estudiantes: { total: totalEstudiantes, activos: estudiantesActivos },
      practicas: { total: totalPracticas, activas: practicasActivas },
      tesis: { total: totalTesis, enCurso: tesisEnCurso },
      convenios: { activos: conveniosActivos },
      empresas: { total: totalEmpresas },
      postulaciones: { aprobadas: postulacionesAprobadas },
      horas: { total: totalHoras._sum.horas_trabajadas || 0 },
    };
    }

  async getEstadisticasTesis() {
    const tesisPorEstado = await this.prisma.proyectoTesis.groupBy({
      by: ['estado'],
      _count: true,
    });

    const entregablesPorEstado = await this.prisma.entregableTesis.groupBy({
      by: ['estado'],
      _count: true,
    });

    return {
      tesisPorEstado,
      entregablesPorEstado,
    };
  }

  async getEstadisticasEmpresas() {
    const empresasPorConvenio = await this.prisma.empresa.findMany({
      where: { activo: true },
      select: {
        id: true,
        ruc: true,
        razon_social: true,
        direccion: true,
        telefono: true,
        correo_contacto: true,
        _count: {
          select: { convenios: { where: { estado: 'activo' } } },
        },
      },
      orderBy: { razon_social: 'asc' },
    });

    const conveniosPorTipo = await this.prisma.convenio.groupBy({
      by: ['tipo'],
      _count: true,
    });

    return {
      empresasPorConvenio,
      conveniosPorTipo,
    };
  }

  async getActividadReciente(limite: number = 10) {
    const [postulacionesRecientes, informesRecientes, registrosHoras] = await Promise.all([
      this.prisma.postulacion.findMany({
        take: limite,
        orderBy: { fecha_postulacion: 'desc' },
        include: {
          estudiante: { include: { usuario: true } },
          oferta: { include: { empresa: true } },
        },
      }),
      this.prisma.informePractica.findMany({
        take: limite,
        orderBy: { fecha_entrega: 'desc' },
        include: {
          postulacion: {
            include: {
              estudiante: { include: { usuario: true } },
              oferta: { include: { empresa: true } },
            },
          },
        },
      }),
      this.prisma.registroHoras.findMany({
        take: limite,
        orderBy: { fecha: 'desc' },
        include: {
          postulacion: {
            include: {
              estudiante: { include: { usuario: true } },
              oferta: { include: { empresa: true } },
            },
          },
        },
      }),
    ]);

    return {
      postulacionesRecientes,
      informesRecientes,
      registrosHoras,
    };
  }
}