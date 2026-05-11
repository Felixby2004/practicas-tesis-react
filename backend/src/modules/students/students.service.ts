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
        expediente_url: data.expediente_url,
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
        expediente_url: data.expediente_url,
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

  // Agregar tipos en los métodos que tienen map
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

    const carreras = await this.prisma.carrera.findMany();
    const carrerasMap = new Map(carreras.map((c: { id: string; nombre: string }) => [c.id, c.nombre]));

    return {
      totalEstudiantes,
      estudiantesActivos,
      porCarrera: porCarrera.map((c: { carrera_id: string; _count: number }) => ({
        carrera_id: c.carrera_id,
        carrera: carrerasMap.get(c.carrera_id) || 'Desconocida',
        cantidad: c._count,
      })),
      porCiclo: porCiclo.map((c: { ciclo: number; _count: number }) => ({ ciclo: c.ciclo, cantidad: c._count })),
    };
  }

  async getDatosEstudianteForAutorizedUser(estudianteId: string, usuarioId: string, rolUsuario?: string) {
    // Si no se proporciona el rol, obtenerlo de la base de datos
    let rol = rolUsuario;
    if (!rol) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioId },
        include: { rol: true },
      });
      rol = usuario?.rol?.nombre || '';
    }

    // Obtener datos del estudiante
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      include: {
        usuario: {
          include: {
            rol: true,
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
            evaluacion: true,
          },
          where: { estado: 'aprobada' },
        },
        proyectos_tesis: {
          include: {
            asesor: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Validar permisos según el rol
    if (rol === 'DOCENTE') {
      // Docente puede ver solo si es asesor del estudiante
      const postulacionAprobada = estudiante.postulaciones[0];
      if (postulacionAprobada) {
        const esAsesor = postulacionAprobada.asesores.some(a => a.docente_id === usuarioId);
        if (!esAsesor) {
          throw new Error('No tienes permiso para ver estos datos');
        }
      }
    } else if (rol === 'REPRESENTANTE_EMPRESA') {
      // Representante de empresa puede ver si es de la empresa de la postulación
      const postulacionAprobada = estudiante.postulaciones[0];
      if (!postulacionAprobada) {
        throw new Error('No tienes permiso para ver estos datos');
      }

      const representante = await this.prisma.representanteEmpresa.findFirst({
        where: { usuario_id: usuarioId },
      });

      if (!representante || representante.empresa_id !== postulacionAprobada.oferta.empresa_id) {
        throw new Error('No tienes permiso para ver estos datos');
      }
    }
    // ADMINISTRADOR y COORDINADOR pueden ver todos los datos

    return estudiante;
  }
}