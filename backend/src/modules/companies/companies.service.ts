import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmpresaDto, UpdateEmpresaDto } from './dto/empresa.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEmpresaDto) {
    return this.prisma.empresa.create({
      data: {
        razon_social: data.razon_social,
        ruc: data.ruc,
        direccion: data.direccion,
        telefono: data.telefono,
        correo_contacto: data.correo_contacto,
        activo: true, // Por defecto activa
      },
    });
  }

  async findAll(mostrarInactivas: boolean = false) {
    await this.actualizarEstadosConvenios();
    
    const where = mostrarInactivas ? {} : { activo: true };
    
    return this.prisma.empresa.findMany({
      where,
      include: {
        ofertas: {
          where: { estado: 'abierta' },
          take: 5,
        },
        convenios: {
          orderBy: { fecha_inicio: 'desc' },
        },
        representantes: {
          include: {
            usuario: true,
          },
        },
      },
      orderBy: {
        razon_social: 'asc',
      },
    });
  }

  async findById(id: string) {
    await this.actualizarEstadosConvenios();
    
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      include: {
        ofertas: true,
        convenios: {
          orderBy: { fecha_inicio: 'desc' },
        },
        representantes: {
          include: {
            usuario: true,
          },
        },
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return empresa;
  }

  async actualizarEstadosConvenios() {
    const hoy = new Date();
    
    await this.prisma.convenio.updateMany({
      where: { fecha_fin: { lt: hoy }, estado: 'activo' },
      data: { estado: 'vencido' },
    });

    await this.prisma.convenio.updateMany({
      where: { fecha_inicio: { gt: hoy }, estado: 'activo' },
      data: { estado: 'pendiente' },
    });

    await this.prisma.convenio.updateMany({
      where: {
        fecha_inicio: { lte: hoy },
        fecha_fin: { gte: hoy },
        estado: { in: ['pendiente', 'vencido'] },
      },
      data: { estado: 'activo' },
    });
  }

  async update(id: string, data: UpdateEmpresaDto) {
    await this.findById(id);
    return this.prisma.empresa.update({
      where: { id },
      data: {
        razon_social: data.razon_social,
        direccion: data.direccion,
        telefono: data.telefono,
        correo_contacto: data.correo_contacto,
      },
    });
  }

  // Soft delete - solo desactivar
  async delete(id: string) {
    await this.findById(id);
    return this.prisma.empresa.update({
      where: { id },
      data: { activo: false },
    });
  }

  // Reactivar empresa
  async reactivar(id: string) {
    await this.findById(id);
    return this.prisma.empresa.update({
      where: { id },
      data: { activo: true },
    });
  }

  async addConvenio(data: { empresa_id: string; tipo: string; fecha_inicio: Date; fecha_fin: Date; archivo_url?: string | null }) {
    await this.findById(data.empresa_id);
    
    const hoy = new Date();
    let estado = 'pendiente';
    
    if (data.fecha_inicio <= hoy && data.fecha_fin >= hoy) {
      estado = 'activo';
    } else if (data.fecha_fin < hoy) {
      estado = 'vencido';
    }
    
    return this.prisma.convenio.create({
      data: {
        empresa_id: data.empresa_id,
        tipo: data.tipo,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        estado: estado,
        archivo_url: data.archivo_url || null,
      },
    });
  }

  async getConvenios(empresaId: string) {
    await this.actualizarEstadosConvenios();
    
    return this.prisma.convenio.findMany({
      where: { empresa_id: empresaId },
      orderBy: { fecha_inicio: 'desc' },
    });
  }

  async verificarConvenioActivo(empresaId: string): Promise<boolean> {
    await this.actualizarEstadosConvenios();
    
    const convenioActivo = await this.prisma.convenio.findFirst({
      where: {
        empresa_id: empresaId,
        estado: 'activo',
      },
    });
    
    return !!convenioActivo;
  }
}