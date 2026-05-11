import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../services/email.service';

interface CreateOfertaDto {
  empresa_id: string;
  titulo: string;
  descripcion: string;
  requisitos: string;
  fecha_limite_postulacion: string;
  vacantes: number;
}

interface UpdateOfertaDto {
  titulo?: string;
  descripcion?: string;
  requisitos?: string;
  fecha_limite_postulacion?: string;
  vacantes?: number;
  estado?: string;
}

interface CreatePostulacionDto {
  oferta_id: string;
  estudiante_id: string;
  curriculum_url?: string;
}

interface CreateRegistroHorasDto {
  postulacion_id: string;
  horas_trabajadas: number;
  descripcion_actividad: string;
  fecha?: string;
}

interface CreateInformeDto {
  postulacion_id: string;
  tipo: string;
  titulo: string;
  contenido?: string;
  archivo_url?: string;
}

@Injectable()
export class InternshipsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // ========== OFERTAS CRUD ==========
  
  async createOferta(data: CreateOfertaDto) {

    const empresa = await this.prisma.empresa.findUnique({
      where: { id: data.empresa_id, activo: true },
    });
    
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada o inactiva');
    }
    
    return this.prisma.ofertaPractica.create({
      data: {
        empresa_id: data.empresa_id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        requisitos: data.requisitos,
        fecha_limite_postulacion: new Date(data.fecha_limite_postulacion),
        vacantes: data.vacantes,
        estado: 'abierta',
        activo: true,
      },
      include: {
        empresa: true,
      },
    });
  }

  async updateOferta(id: string, data: UpdateOfertaDto) {
    const oferta = await this.prisma.ofertaPractica.findUnique({
      where: { id, activo: true },
    });
    
    if (!oferta) {
      throw new NotFoundException('Oferta no encontrada');
    }
    
    return this.prisma.ofertaPractica.update({
      where: { id },
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        requisitos: data.requisitos,
        fecha_limite_postulacion: data.fecha_limite_postulacion ? new Date(data.fecha_limite_postulacion) : undefined,
        vacantes: data.vacantes,
        estado: data.estado,
      },
      include: {
        empresa: true,
      },
    });
  }

  // Soft delete - solo desactivar
  async deleteOferta(id: string) {
    const oferta = await this.prisma.ofertaPractica.findUnique({
      where: { id, activo: true },
    });
    
    if (!oferta) {
      throw new NotFoundException('Oferta no encontrada');
    }
    
    // Verificar si tiene postulaciones en proceso
    const postulacionesActivas = await this.prisma.postulacion.count({
      where: {
        oferta_id: id,
        estado: { in: ['pendiente', 'aprobada'] },
      },
    });

    if (postulacionesActivas > 0) {
      throw new BadRequestException('No se puede desactivar una oferta que tiene postulaciones en proceso');
    }
    
    // Solo desactivar, mantener el estado original
    return this.prisma.ofertaPractica.update({
      where: { id },
      data: { activo: false },  // 👈 Solo cambia activo, NO el estado
    });
  }

  // Reactivar oferta - vuelve a activar pero mantiene su estado original
  async reactivarOferta(id: string) {
    const oferta = await this.prisma.ofertaPractica.findUnique({
      where: { id, activo: false },
    });
    
    if (!oferta) {
      throw new NotFoundException('Oferta no encontrada');
    }
    
    return this.prisma.ofertaPractica.update({
      where: { id },
      data: { activo: true },  // 👈 Solo reactivar, mantiene su estado
    });
  }

  async getOfertas(estado?: string, soloActivas: boolean = true) {
    const where: any = {};
    if (estado) where.estado = estado;
    if (soloActivas) where.activo = true;
    
    where.empresa = { activo: true };

    return this.prisma.ofertaPractica.findMany({
      where,
      include: {
        empresa: true,
        postulaciones: {
          include: {
            estudiante: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha_publicacion: 'desc',
      },
    });
  }

  // Obtener todas las ofertas incluyendo inactivas (solo para admin)
  async getAllOfertas(estado?: string) {
    const where: any = {};
    if (estado) where.estado = estado;
    
    return this.prisma.ofertaPractica.findMany({
      where,
      include: {
        empresa: true,
        postulaciones: {
          include: {
            estudiante: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha_publicacion: 'desc',
      },
    });
  }

  async getOfertaById(id: string) {
    const oferta = await this.prisma.ofertaPractica.findFirst({
      where: { id, activo: true },
      include: {
        empresa: true,
        postulaciones: {
          include: {
            estudiante: {
              include: {
                usuario: true,
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
      },
    });

    if (!oferta) {
      throw new NotFoundException('Oferta no encontrada');
    }

    return oferta;
  }

  // ========== POSTULACIONES ==========
  
  async postular(data: CreatePostulacionDto) {
    const oferta = await this.prisma.ofertaPractica.findFirst({
      where: { id: data.oferta_id, activo: true },
    });

    if (!oferta) {
      throw new NotFoundException('Oferta no encontrada');
    }

    if (oferta.estado !== 'abierta') {
      throw new BadRequestException('Esta oferta ya no está disponible');
    }
    
    if (new Date(oferta.fecha_limite_postulacion) < new Date()) {
      throw new BadRequestException('La fecha límite de postulación ya venció');
    }

    const existingPostulacion = await this.prisma.postulacion.findFirst({
      where: {
        oferta_id: data.oferta_id,
        estudiante_id: data.estudiante_id,
      },
    });

    if (existingPostulacion) {
      throw new BadRequestException('Ya has postulado a esta oferta');
    }

    return this.prisma.postulacion.create({
      data: {
        oferta_id: data.oferta_id,
        estudiante_id: data.estudiante_id,
        curriculum_url: data.curriculum_url,
        estado: 'pendiente',
      },
      include: {
        oferta: {
          include: {
            empresa: true,
          },
        },
        estudiante: {
          include: {
            usuario: true,
          },
        },
      },
    });
  }

  async getPostulacionesByEstudiante(estudianteId: string) {
    return this.prisma.postulacion.findMany({
      where: { estudiante_id: estudianteId },
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
      orderBy: {
        fecha_postulacion: 'desc',
      },
    });
  }

  async getPostulacionesByOferta(ofertaId: string) {
    return this.prisma.postulacion.findMany({
      where: { oferta_id: ofertaId },
      include: {
        estudiante: {
          include: { usuario: true },
        },
        asesores: {
          include: {
            docente: {
              include: { usuario: true },
            },
          },
        },
        horas: true,
        informes: true,
      },
    });
  }

  async updatePostulacionEstado(id: string, estado: string) {
    return this.prisma.postulacion.update({
      where: { id },
      data: { estado },
      include: {
        oferta: {
          include: {
            empresa: true,
          },
        },
        estudiante: {
          include: {
            usuario: true,
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
      },
    });
  }

  // ========== ASIGNACIÓN DE ASESOR ==========
  
  async asignarAsesor(postulacionId: string, docenteId: string) {
    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id: postulacionId },
    });

    if (!postulacion) {
      throw new NotFoundException('Postulación no encontrada');
    }

    if (postulacion.estado !== 'aprobada') {
      throw new BadRequestException('Solo se puede asignar asesor a postulaciones aprobadas');
    }

    const existingAsesor = await this.prisma.asignacionAsesor.findFirst({
      where: { postulacion_id: postulacionId },
    });

    if (existingAsesor) {
      throw new BadRequestException('Esta postulación ya tiene un asesor asignado');
    }

    // Verificar que el docente existe
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    return this.prisma.asignacionAsesor.create({
      data: {
        postulacion_id: postulacionId,
        docente_id: docenteId,
      },
      include: {
        docente: {
          include: {
            usuario: true,
          },
        },
        postulacion: true,
      },
    });
  }

  async getAsesoresByPostulacion(postulacionId: string) {
    return this.prisma.asignacionAsesor.findMany({
      where: { postulacion_id: postulacionId },
      include: {
        docente: {
          include: {
            usuario: true,
          },
        },
      },
    });
  }

  // ========== REGISTRO DE HORAS ==========
  
  async registrarHoras(data: CreateRegistroHorasDto) {
    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id: data.postulacion_id },
    });

    if (!postulacion) {
      throw new NotFoundException('Postulación no encontrada');
    }

    if (postulacion.estado !== 'aprobada') {
      throw new BadRequestException('Solo se pueden registrar horas en prácticas aprobadas');
    }

    return this.prisma.registroHoras.create({
      data: {
        postulacion_id: data.postulacion_id,
        horas_trabajadas: data.horas_trabajadas,
        descripcion_actividad: data.descripcion_actividad,
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
      },
    });
  }

  async getHorasByPostulacion(postulacionId: string) {
    return this.prisma.registroHoras.findMany({
      where: { postulacion_id: postulacionId },
      orderBy: { fecha: 'desc' },
    });
  }

  async getTotalHorasByPostulacion(postulacionId: string) {
    const result = await this.prisma.registroHoras.aggregate({
      where: { postulacion_id: postulacionId },
      _sum: { horas_trabajadas: true },
    });
    return result._sum.horas_trabajadas || 0;
  }

  // ========== INFORMES ==========
  
  async crearInforme(data: CreateInformeDto) {
    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id: data.postulacion_id },
      include: {
        estudiante: { include: { usuario: true } },
        asesores: { include: { docente: { include: { usuario: true } } } },
      },
    });

    if (!postulacion) {
      throw new NotFoundException('Postulación no encontrada');
    }

    const informe = await this.prisma.informePractica.create({
      data: {
        postulacion_id: data.postulacion_id,
        tipo: data.tipo,
        titulo: data.titulo,
        contenido: data.contenido,
        archivo_url: data.archivo_url,
        estado: 'pendiente',
      },
    });

    // Enviar email al asesor asignado
    if (postulacion.asesores.length > 0) {
      const primerAsesor = postulacion.asesores[0];
      await this.emailService.sendInformeEntregadoEmail(
        primerAsesor.docente.usuario.correo,
        primerAsesor.docente.usuario.nombre_completo,
        postulacion.estudiante.usuario.nombre_completo,
        data.tipo
      );
    }

    return informe;
  }

  async getInformesByPostulacion(postulacionId: string) {
    return this.prisma.informePractica.findMany({
      where: { postulacion_id: postulacionId },
      orderBy: { fecha_entrega: 'desc' },
    });
  }

  async revisarInforme(id: string, estado: string, observaciones?: string) {
    return this.prisma.informePractica.update({
      where: { id },
      data: {
        estado,
        contenido: observaciones,
      },
    });
  }

  // ========== ESTADÍSTICAS ==========
  
  async getEstadisticas() {
    const [
      totalOfertas,
      ofertasAbiertas,
      totalPostulaciones,
      postulacionesAprobadas,
      totalHoras,
      totalInformes,
    ] = await Promise.all([
      this.prisma.ofertaPractica.count({ where: { activo: true } }),
      this.prisma.ofertaPractica.count({ where: { estado: 'abierta', activo: true } }),
      this.prisma.postulacion.count(),
      this.prisma.postulacion.count({ where: { estado: 'aprobada' } }),
      this.prisma.registroHoras.aggregate({ _sum: { horas_trabajadas: true } }),
      this.prisma.informePractica.count(),
    ]);

    return {
      totalOfertas,
      ofertasAbiertas,
      totalPostulaciones,
      postulacionesAprobadas,
      totalHoras: totalHoras._sum.horas_trabajadas || 0,
      totalInformes,
      porcentajeAprobacion: totalPostulaciones > 0 
        ? (postulacionesAprobadas / totalPostulaciones) * 100 
        : 0,
    };
  }
}