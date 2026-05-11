import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../services/email.service';
import { CreateSolicitudDto, UpdateSolicitudDto } from './dto/solicitud.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(data: CreateSolicitudDto) {
    const existingUser = await this.prisma.usuario.findUnique({ where: { correo: data.correo } });
    if (existingUser) throw new ConflictException('El correo ya está registrado');

    const existingSolicitud = await this.prisma.solicitudRegistro.findFirst({
      where: { correo: data.correo, estado: 'pendiente' },
    });
    if (existingSolicitud) throw new ConflictException('Ya tienes una solicitud pendiente');

    const hashedPassword = await bcrypt.hash(data.contrasena, 10);
    
    return this.prisma.solicitudRegistro.create({
      data: {
        correo: data.correo,
        contrasena: hashedPassword,
        nombre_completo: data.nombre_completo,
        rol_solicitado: data.rol_solicitado,
        estado: 'pendiente',
        carrera_id: data.carrera_id,
        ciclo: data.ciclo,
        especialidad: data.especialidad,
        facultad_id: data.facultad_id,
        empresa_id: data.empresa_id,
        cargo: data.cargo,
      },
    });
  }

  async findAll(filtro?: string) {
    const where: any = {};
    if (filtro && filtro !== 'todos') where.estado = filtro;
    return this.prisma.solicitudRegistro.findMany({ where, orderBy: { fecha_solicitud: 'desc' } });
  }

  async findById(id: string) {
    const solicitud = await this.prisma.solicitudRegistro.findUnique({ where: { id } });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
    return solicitud;
  }

  private generarContrasenaTemportal(): string {
    const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const minusculas = 'abcdefghijklmnopqrstuvwxyz';
    const numeros = '0123456789';
    const especiales = '!@#$%';
    
    let contrasena = '';
    contrasena += mayusculas.charAt(Math.floor(Math.random() * mayusculas.length));
    contrasena += minusculas.charAt(Math.floor(Math.random() * minusculas.length));
    contrasena += numeros.charAt(Math.floor(Math.random() * numeros.length));
    contrasena += especiales.charAt(Math.floor(Math.random() * especiales.length));
    
    const todosLosCaracteres = mayusculas + minusculas + numeros + especiales;
    for (let i = contrasena.length; i < 12; i++) {
      contrasena += todosLosCaracteres.charAt(Math.floor(Math.random() * todosLosCaracteres.length));
    }
    
    return contrasena.split('').sort(() => Math.random() - 0.5).join('');
  }

  private generarCodigoEstudiante(nombreCompleto: string): string {
    const partes = nombreCompleto.trim().split(' ');
    let iniciales = '';
    for (let i = 0; i < Math.min(partes.length, 3); i++) iniciales += partes[i].charAt(0).toUpperCase();
    const ahora = new Date();
    const fecha = `${ahora.getFullYear()}${(ahora.getMonth() + 1).toString().padStart(2, '0')}${ahora.getDate().toString().padStart(2, '0')}`;
    const hora = `${ahora.getHours().toString().padStart(2, '0')}${ahora.getMinutes().toString().padStart(2, '0')}${ahora.getSeconds().toString().padStart(2, '0')}`;
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letraRandom = letras.charAt(Math.floor(Math.random() * letras.length));
    return `${iniciales}-${fecha}-${hora}-${letraRandom}`;
  }

  async update(id: string, data: UpdateSolicitudDto, adminId: string) {
    const solicitud = await this.findById(id);
    const updateData: any = { estado: data.estado, observaciones: data.observaciones, fecha_respuesta: new Date(), respondido_por: adminId };

    if (data.estado === 'aprobado') {
      // Generar contraseña temporal nueva
      const contrasenaTemportal = this.generarContrasenaTemportal();
      const contrasenaHasheada = await bcrypt.hash(contrasenaTemportal, 10);

      const rol = await this.prisma.rol.findUnique({ where: { nombre: solicitud.rol_solicitado } });
      if (!rol) throw new NotFoundException(`Rol ${solicitud.rol_solicitado} no encontrado`);

      // 1. Crear usuario con la contraseña temporal
      const usuario = await this.prisma.usuario.create({
        data: {
          correo: solicitud.correo,
          contrasena: contrasenaHasheada,
          nombre_completo: solicitud.nombre_completo,
          rol_id: rol.id,
        },
      });
      console.log(`✅ Usuario creado: ${usuario.correo}`);

      // 2. Crear registro específico según el rol
      if (solicitud.rol_solicitado === 'ESTUDIANTE') {
        const codigoUniv = this.generarCodigoEstudiante(solicitud.nombre_completo);
        await this.prisma.estudiante.create({
          data: {
            usuario_id: usuario.id,
            codigo_univ: codigoUniv,
            carrera_id: solicitud.carrera_id || '',
            ciclo: solicitud.ciclo || 1,
            expediente_url: null,
            activo: true,
          },
        });
      } 
      else if (solicitud.rol_solicitado === 'DOCENTE') {
        let facultadNombre = solicitud.facultad || '';

        if (solicitud.facultad_id && !facultadNombre) {
          const facultad = await this.prisma.facultad.findUnique({
            where: { id: solicitud.facultad_id },
          });
          if (facultad) {
            facultadNombre = facultad.nombre;
          }
        }

        if (solicitud.facultad) {
          const facultad = await this.prisma.facultad.findFirst({
            where: { nombre: solicitud.facultad },
          });
          if (facultad) {
            facultadNombre = facultad.nombre;
          }
        }

        await this.prisma.docente.create({
          data: {
            usuario_id: usuario.id,
            especialidad: solicitud.especialidad || '',
            facultad: facultadNombre,
            activo: true,
          },
        });
      }
      else if (solicitud.rol_solicitado === 'COORDINADOR') {
        await this.prisma.coordinador.create({
          data: {
            usuario_id: usuario.id,
            facultad_id: solicitud.facultad_id || '',
            activo: true,
          },
        });
      } 
      else if (solicitud.rol_solicitado === 'REPRESENTANTE_EMPRESA') {
        await this.prisma.representanteEmpresa.create({
          data: {
            usuario_id: usuario.id,
            empresa_id: solicitud.empresa_id || '',
            cargo: solicitud.cargo || '',
            activo: true,
          },
        });
      }

      // 3. Enviar correo de aprobación con contraseña temporal
      await this.emailService.sendRegistrationApprovalEmail(
        solicitud.correo,
        solicitud.nombre_completo,
        solicitud.rol_solicitado,
        contrasenaTemportal
      );
    }
    
    if (data.estado === 'rechazado') {
      // Enviar correo de rechazo
      await this.emailService.sendRegistrationRejectionEmail(
        solicitud.correo,
        solicitud.nombre_completo,
        data.observaciones
      );
    }

    return this.prisma.solicitudRegistro.update({ where: { id }, data: updateData });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.solicitudRegistro.delete({ where: { id } });
  }

  async getEstadisticas() {
    const [pendientes, aprobados, rechazados] = await Promise.all([
      this.prisma.solicitudRegistro.count({ where: { estado: 'pendiente' } }),
      this.prisma.solicitudRegistro.count({ where: { estado: 'aprobado' } }),
      this.prisma.solicitudRegistro.count({ where: { estado: 'rechazado' } }),
    ]);
    return { pendientes, aprobados, rechazados, total: pendientes + aprobados + rechazados };
  }
}