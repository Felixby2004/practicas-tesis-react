import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ThesisService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.proyectoTesis.findMany({
      include: {
        estudiante: { include: { usuario: true } },
        asesor: { include: { usuario: true } },
        entregables: true,
        jurados: { include: { docente: { include: { usuario: true } } } },
        sustentacion: true,
      },
      orderBy: { fecha_registro: 'desc' },
    });
  }

  async findById(id: string) {
    const tesis = await this.prisma.proyectoTesis.findUnique({
      where: { id },
      include: {
        estudiante: { include: { usuario: true } },
        asesor: { include: { usuario: true } },
        entregables: true,
        jurados: { include: { docente: { include: { usuario: true } } } },
        sustentacion: true,
      },
    });
    if (!tesis) throw new NotFoundException('Proyecto no encontrado');
    return tesis;
  }

  async create(data: any) {
    return this.prisma.proyectoTesis.create({
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        estudiante_id: data.estudiante_id,
        asesor_id: data.asesor_id,
        estado: 'propuesta',
      },
      include: {
        estudiante: { include: { usuario: true } },
        asesor: { include: { usuario: true } },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.proyectoTesis.update({
      where: { id },
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        estado: data.estado,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.proyectoTesis.delete({ where: { id } });
  }

  async addEntregable(data: any) {
    return this.prisma.entregableTesis.create({
      data: {
        tesis_id: data.tesis_id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        fecha_limite: new Date(data.fecha_limite),
        estado: 'pendiente',
      },
    });
  }

  async addJurado(data: any) {
    return this.prisma.juradoTesis.create({
      data: {
        tesis_id: data.tesis_id,
        docente_id: data.docente_id,
        cargo: data.cargo,
      },
    });
  }

  async registrarSustentacion(data: any) {
    // Verificar si ya existe sustentación
    const existing = await this.prisma.sustentacion.findUnique({
      where: { tesis_id: data.tesis_id },
    });
    
    if (existing) {
      return this.prisma.sustentacion.update({
        where: { tesis_id: data.tesis_id },
        data: {
          fecha_hora: new Date(data.fecha_hora),
          lugar: data.lugar,
          resultado: data.resultado,
          acta_url: data.acta_url,
        },
      });
    }
    
    return this.prisma.sustentacion.create({
      data: {
        tesis_id: data.tesis_id,
        fecha_hora: new Date(data.fecha_hora),
        lugar: data.lugar,
        resultado: data.resultado,
        acta_url: data.acta_url,
      },
    });
  }

  async updateEntregable(id: string, estado: string) {
    return this.prisma.entregableTesis.update({
      where: { id },
      data: { estado, fecha_entrega: estado === 'entregado' ? new Date() : undefined },
    });
  }

  async deleteJurado(id: string) {
    return this.prisma.juradoTesis.delete({ where: { id } });
  }
}