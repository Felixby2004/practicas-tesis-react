import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEstudianteDto, UpdateEstudianteDto } from './dto/estudiante.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEstudianteDto) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: data.usuario_id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el código universitario no exista
    const existingEstudiante = await this.prisma.estudiante.findUnique({
      where: { codigo_univ: data.codigo_univ },
    });

    if (existingEstudiante) {
      throw new ConflictException('El código universitario ya está registrado');
    }

    return this.prisma.estudiante.create({
      data: {
        usuario_id: data.usuario_id,
        codigo_univ: data.codigo_univ,
        carrera_id: data.carrera_id,
        ciclo: data.ciclo,
        expediente: data.expediente,
        activo: true,
      },
      include: {
        usuario: {
          select: {
            id: true,
            correo: true,
            nombre_completo: true,
          },
        },
        carrera: true,
      },
    });
  }

  async findAll(soloActivos: boolean = true) {
    const where = soloActivos ? { activo: true } : {};
    
    return this.prisma.estudiante.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            correo: true,
            nombre_completo: true,
          },
        },
        carrera: true,
        postulaciones: {
          include: {
            oferta: {
              include: {
                empresa: true,
              },
            },
          },
        },
        proyectos_tesis: true,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });
  }

  async findById(id: string) {
    const estudiante = await this.prisma.estudiante.findFirst({
      where: { id, activo: true },
      include: {
        usuario: {
          select: {
            id: true,
            correo: true,
            nombre_completo: true,
          },
        },
        carrera: true,
        postulaciones: {
          include: {
            oferta: {
              include: {
                empresa: true,
              },
            },
            asesores: {
              include: {
                docente: {
                  include: {
                    usuario: true,
                  },
                },
              },
            },
            horas: true,
            informes: true,
          },
        },
        proyectos_tesis: {
          include: {
            asesor: {
              include: {
                usuario: true,
              },
            },
            entregables: true,
            sustentacion: true,
          },
        },
      },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return estudiante;
  }

  async findByUsuarioId(usuarioId: string) {
    const estudiante = await this.prisma.estudiante.findFirst({
      where: { usuario_id: usuarioId, activo: true },
      include: {
        usuario: {
          select: {
            id: true,
            correo: true,
            nombre_completo: true,
          },
        },
        carrera: true,
      },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return estudiante;
  }

  async findByCodigo(codigo_univ: string) {
    const estudiante = await this.prisma.estudiante.findFirst({
      where: { codigo_univ, activo: true },
      include: {
        usuario: {
          select: {
            id: true,
            correo: true,
            nombre_completo: true,
          },
        },
        carrera: true,
      },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return estudiante;
  }

  async update(id: string, data: UpdateEstudianteDto) {
    await this.findById(id);
    
    return this.prisma.estudiante.update({
      where: { id },
      data: {
        codigo_univ: data.codigo_univ,
        carrera_id: data.carrera_id,
        ciclo: data.ciclo,
        expediente: data.expediente,
      },
      include: {
        usuario: {
          select: {
            id: true,
            correo: true,
            nombre_completo: true,
          },
        },
        carrera: true,
      },
    });
  }

  // Soft delete
  async delete(id: string) {
    await this.findById(id);
    
    // Verificar si tiene postulaciones o tesis activas
    const postulacionesActivas = await this.prisma.postulacion.count({
      where: {
        estudiante_id: id,
        estado: { in: ['pendiente', 'aprobada'] },
      },
    });

    const tesisActivas = await this.prisma.proyectoTesis.count({
      where: {
        estudiante_id: id,
        estado: { in: ['propuesta', 'en_curso'] },
      },
    });

    if (postulacionesActivas > 0 || tesisActivas > 0) {
      throw new ConflictException('No se puede desactivar un estudiante con postulaciones o tesis en proceso');
    }

    return this.prisma.estudiante.update({
      where: { id },
      data: { activo: false },
    });
  }

  // Reactivar
  async reactivar(id: string) {
    const estudiante = await this.prisma.estudiante.findFirst({
      where: { id, activo: false },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return this.prisma.estudiante.update({
      where: { id },
      data: { activo: true },
    });
  }

  // Obtener estadísticas de estudiantes
  async getEstadisticas() {
    const [totalEstudiantes, estudiantesActivos, porCarrera, porCiclo] = await Promise.all([
      this.prisma.estudiante.count(),
      this.prisma.estudiante.count({ where: { activo: true } }),
      this.prisma.estudiante.groupBy({
        by: ['carrera_id'],
        _count: true,
      }),
      this.prisma.estudiante.groupBy({
        by: ['ciclo'],
        _count: true,
      }),
    ]);

    // Obtener nombres de carreras para los resultados
    const carreras = await this.prisma.carrera.findMany();
    const carrerasMap = new Map(carreras.map(c => [c.id, c.nombre]));

    return {
      totalEstudiantes,
      estudiantesActivos,
      porCarrera: porCarrera.map(c => ({ 
        carrera_id: c.carrera_id,
        carrera: carrerasMap.get(c.carrera_id) || 'Desconocida',  // 👈 Usar carrera_id
        cantidad: c._count 
      })),
      porCiclo: porCiclo.map(c => ({ ciclo: c.ciclo, cantidad: c._count })),
    };
  }
}