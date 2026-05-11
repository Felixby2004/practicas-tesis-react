import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CompanyRepService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(representanteId: string) {
    const representante = await this.prisma.representanteEmpresa.findUnique({
      where: { id: representanteId },
      include: { empresa: true },
    });

    if (!representante) {
      throw new Error('Representante no encontrado');
    }

    const empresaId = representante.empresa_id;

    const [ofertas, postulaciones, convenios] = await Promise.all([
      this.prisma.ofertaPractica.count({
        where: { empresa_id: empresaId, activo: true },
      }),
      this.prisma.postulacion.count({
        where: { oferta: { empresa_id: empresaId } },
      }),
      this.prisma.convenio.count({
        where: { empresa_id: empresaId, estado: 'activo' },
      }),
    ]);

    return {
      empresa: representante.empresa?.razon_social,
      estadisticas: {
        ofertas,
        postulaciones,
        convenios,
      },
    };
  }

  async getOfertasByEmpresa(representanteId: string) {
    const representante = await this.prisma.representanteEmpresa.findUnique({
      where: { id: representanteId },
    });

    if (!representante) {
      throw new Error('Representante no encontrado');
    }

    return this.prisma.ofertaPractica.findMany({
      where: { empresa_id: representante.empresa_id, activo: true },
      include: {
        postulaciones: {
          include: {
            estudiante: { include: { usuario: true } },
          },
        },
      },
      orderBy: { fecha_publicacion: 'desc' },
    });
  }

  async getPostulantesByOferta(ofertaId: string) {
    return this.prisma.postulacion.findMany({
      where: { oferta_id: ofertaId },
      include: {
        estudiante: { include: { usuario: true, carrera: true } },
      },
      orderBy: { fecha_postulacion: 'desc' },
    });
  }

  async actualizarEstadoPostulacion(postulacionId: string, estado: string) {
    return this.prisma.postulacion.update({
      where: { id: postulacionId },
      data: { estado, fecha_aprobacion: estado === 'aprobada' ? new Date() : undefined },
    });
  }
}