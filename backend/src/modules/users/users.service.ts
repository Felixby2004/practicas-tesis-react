import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByRol(rol: string) {
    switch (rol) {
      case 'ESTUDIANTE':
        return this.prisma.estudiante.findMany({
          where: { activo: true },
          include: { usuario: true, carrera: true },
        });
      case 'DOCENTE':
        const docentes = await this.prisma.docente.findMany({
          where: { activo: true },
          include: { usuario: true },
        });
        // Obtener nombres de facultades
        const facultades = await this.prisma.facultad.findMany();
        const facultadMap = new Map(facultades.map(f => [f.id, f.nombre]));
        
        return docentes.map(d => ({
          ...d,
          facultad_nombre: d.facultad ? (facultadMap.get(d.facultad) || d.facultad) : 'Sin facultad'
        }));
      case 'COORDINADOR':
        return this.prisma.coordinador.findMany({
          where: { activo: true },
          include: { usuario: true, facultad: true },
        });
      case 'REPRESENTANTE_EMPRESA':
        return this.prisma.representanteEmpresa.findMany({
          where: { activo: true },
          include: { usuario: true, empresa: true },
        });
      default:
        return [];
    }
  }

  async getEstadisticasByRol(rol: string) {
    switch (rol) {
      case 'ESTUDIANTE': {
        const [total, activos] = await Promise.all([
          this.prisma.estudiante.count(),
          this.prisma.estudiante.count({ where: { activo: true } }),
        ]);
        return { total, activos };
      }
      case 'DOCENTE': {
        const [total, activos] = await Promise.all([
          this.prisma.docente.count(),
          this.prisma.docente.count({ where: { activo: true } }),
        ]);
        return { total, activos };
      }
      case 'COORDINADOR': {
        const [total, activos] = await Promise.all([
          this.prisma.coordinador.count(),
          this.prisma.coordinador.count({ where: { activo: true } }),
        ]);
        return { total, activos };
      }
      case 'REPRESENTANTE_EMPRESA': {
        const [total, activos] = await Promise.all([
          this.prisma.representanteEmpresa.count(),
          this.prisma.representanteEmpresa.count({ where: { activo: true } }),
        ]);
        return { total, activos };
      }
      default:
        return { total: 0, activos: 0 };
    }
  }

  async getDetalleByRol(id: string, rol: string) {
    switch (rol) {
      case 'ESTUDIANTE':
        return this.prisma.estudiante.findUnique({
          where: { id },
          include: { usuario: true, carrera: true },
        });
      case 'DOCENTE':
        return this.prisma.docente.findUnique({
          where: { id },
          include: { usuario: true },
        });
      case 'COORDINADOR':
        return this.prisma.coordinador.findUnique({
          where: { id },
          include: { usuario: true, facultad: true },
        });
      case 'REPRESENTANTE_EMPRESA':
        return this.prisma.representanteEmpresa.findUnique({
          where: { id },
          include: { usuario: true, empresa: true },
        });
      default:
        throw new NotFoundException('Rol no válido');
    }
  }

  async updateByRol(id: string, rol: string, data: any) {
    switch (rol) {
      case 'ESTUDIANTE':
        return this.prisma.estudiante.update({
          where: { id },
          data: {
            carrera_id: data.carrera_id,
            ciclo: data.ciclo,
            expediente: data.expediente,
          },
        });
      case 'DOCENTE':
        return this.prisma.docente.update({
          where: { id },
          data: {
            especialidad: data.especialidad,
            facultad: data.facultad_id || data.facultad,
          },
        });
      case 'COORDINADOR':
        return this.prisma.coordinador.update({
          where: { id },
          data: {
            facultad_id: data.facultad_id,
          },
        });
      case 'REPRESENTANTE_EMPRESA':
        return this.prisma.representanteEmpresa.update({
          where: { id },
          data: {
            empresa_id: data.empresa_id,
            cargo: data.cargo,
          },
        });
      default:
        throw new NotFoundException('Rol no válido');
    }
  }

  async deleteByRol(id: string, rol: string) {
    switch (rol) {
      case 'ESTUDIANTE':
        return this.prisma.estudiante.update({
          where: { id },
          data: { activo: false },
        });
      case 'DOCENTE':
        return this.prisma.docente.update({
          where: { id },
          data: { activo: false },
        });
      case 'COORDINADOR':
        return this.prisma.coordinador.update({
          where: { id },
          data: { activo: false },
        });
      case 'REPRESENTANTE_EMPRESA':
        return this.prisma.representanteEmpresa.update({
          where: { id },
          data: { activo: false },
        });
      default:
        throw new NotFoundException('Rol no válido');
    }
  }

  async reactivarByRol(id: string, rol: string) {
    switch (rol) {
      case 'ESTUDIANTE':
        return this.prisma.estudiante.update({
          where: { id },
          data: { activo: true },
        });
      case 'DOCENTE':
        return this.prisma.docente.update({
          where: { id },
          data: { activo: true },
        });
      case 'COORDINADOR':
        return this.prisma.coordinador.update({
          where: { id },
          data: { activo: true },
        });
      case 'REPRESENTANTE_EMPRESA':
        return this.prisma.representanteEmpresa.update({
          where: { id },
          data: { activo: true },
        });
      default:
        throw new NotFoundException('Rol no válido');
    }
  }
}