import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendWelcomeEmail(to: string, nombre: string, contrasena: string) {
    try {
      await this.resend.emails.send({
        from: 'Sistema UNT <sistema@unt.edu.pe>',
        to,
        subject: 'Bienvenido al Sistema de Prácticas y Tesis UNT',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e3a5f; padding: 20px; text-align: center; color: white;">
              <h1>Universidad Nacional de Trujillo</h1>
              <p>Sistema de Gestión de Prácticas y Tesis</p>
            </div>
            <div style="padding: 20px;">
              <h2>Bienvenido, ${nombre}</h2>
              <p>Has sido registrado en el sistema. Tus credenciales de acceso son:</p>
              <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; background-color: #f0f0f0; width: 30%;"><strong>Correo:</strong></td>
                  <td style="padding: 10px; background-color: #f0f0f0;">${to}</td>
                </tr>
                <tr>
                  <td style="padding: 10px;"><strong>Contraseña temporal:</strong></td>
                  <td style="padding: 10px;"><code style="background-color: #e0e0e0; padding: 5px;">${contrasena}</code></td>
                </tr>
              </table>
              <p style="color: #d32f2f;"><strong>⚠️ Importante:</strong> Debes cambiar tu contraseña en el primer inicio de sesión.</p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/login" style="background-color: #1e3a5f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Iniciar Sesión</a>
              </div>
            </div>
            <div style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666;">
              <p>Este es un correo automático, por favor no responder.</p>
              <p>© ${new Date().getFullYear()} Universidad Nacional de Trujillo</p>
            </div>
          </div>
        `,
      });
      console.log(`✅ Email enviado a ${to}`);
    } catch (error) {
      console.error('❌ Error enviando email:', error);
    }
  }

  async sendPasswordResetEmail(to: string, nombre: string, nuevaContrasena: string) {
    try {
      await this.resend.emails.send({
        from: 'Sistema UNT <sistema@unt.edu.pe>',
        to,
        subject: 'Recuperación de Contraseña - Sistema UNT',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e3a5f; padding: 20px; text-align: center; color: white;">
              <h1>Universidad Nacional de Trujillo</h1>
              <p>Recuperación de Contraseña</p>
            </div>
            <div style="padding: 20px;">
              <h2>Hola, ${nombre}</h2>
              <p>Hemos generado una nueva contraseña para tu cuenta:</p>
              <div style="background-color: #f0f0f0; padding: 15px; text-align: center; margin: 20px 0;">
                <code style="font-size: 18px;">${nuevaContrasena}</code>
              </div>
              <p>Te recomendamos cambiar esta contraseña después de iniciar sesión.</p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/login" style="background-color: #1e3a5f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Iniciar Sesión</a>
              </div>
            </div>
            <div style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666;">
              <p>Este es un correo automático, por favor no responder.</p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error('❌ Error enviando email:', error);
    }
  }

  async sendRegistrationApprovalEmail(to: string, nombre: string, rol: string, contrasena: string) {
    try {
      const rolNombre = this.getRolSpanish(rol);
      await this.resend.emails.send({
        from: 'Sistema UNT <sistema@unt.edu.pe>',
        to,
        subject: '✅ Solicitud Aprobada - Sistema de Prácticas y Tesis UNT',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e3a5f; padding: 20px; text-align: center; color: white;">
              <h1>Universidad Nacional de Trujillo</h1>
              <p>Sistema de Gestión de Prácticas y Tesis</p>
            </div>
            <div style="padding: 20px;">
              <div style="background-color: #d4edda; border: 2px solid #28a745; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                <h2 style="color: #155724; margin-top: 0;">✅ ¡Solicitud Aprobada!</h2>
                <p style="color: #155724; margin: 0;">Tu solicitud de registro como <strong>${rolNombre}</strong> ha sido aprobada exitosamente.</p>
              </div>
              
              <p>Hola, <strong>${nombre}</strong></p>
              <p>Nos complace informarte que tu solicitud de registro en el Sistema de Prácticas y Tesis ha sido aprobada por el administrador del sistema.</p>
              
              <h3 style="color: #1e3a5f; margin-top: 25px;">📋 Tus Credenciales de Acceso:</h3>
              <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px; background-color: #f0f0f0; width: 35%; border-bottom: 1px solid #ddd;"><strong>Correo:</strong></td>
                  <td style="padding: 12px; background-color: #f9f9f9; border-bottom: 1px solid #ddd;">${to}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f0f0f0; width: 35%;"><strong>Contraseña temporal:</strong></td>
                  <td style="padding: 12px; background-color: #f9f9f9;">
                    <code style="background-color: #e0e0e0; padding: 6px 8px; border-radius: 3px; font-family: monospace;">${contrasena}</code>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f0f0f0;"><strong>Rol Asignado:</strong></td>
                  <td style="padding: 12px; background-color: #f9f9f9;"><strong>${rolNombre}</strong></td>
                </tr>
              </table>

              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>⚠️ Importante:</strong> Por seguridad, debes cambiar tu contraseña en tu primer acceso al sistema. No compartas tu contraseña con nadie.
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/login" style="background-color: #1e3a5f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Ir al Sistema
                </a>
              </div>

              <p style="margin-top: 30px; color: #666;">
                Si tienes problemas para acceder, contáctate con el administrador del sistema.
              </p>
            </div>
            <div style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd;">
              <p style="margin: 5px 0;">Este es un correo automático, por favor no responder a esta dirección.</p>
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Universidad Nacional de Trujillo</p>
            </div>
          </div>
        `,
      });
      console.log(`✅ Email de aprobación enviado a ${to}`);
    } catch (error) {
      console.error('❌ Error enviando email de aprobación:', error);
    }
  }

  async sendRegistrationRejectionEmail(to: string, nombre: string, observaciones?: string) {
    try {
      await this.resend.emails.send({
        from: 'Sistema UNT <sistema@unt.edu.pe>',
        to,
        subject: '❌ Solicitud Rechazada - Sistema de Prácticas y Tesis UNT',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e3a5f; padding: 20px; text-align: center; color: white;">
              <h1>Universidad Nacional de Trujillo</h1>
              <p>Sistema de Gestión de Prácticas y Tesis</p>
            </div>
            <div style="padding: 20px;">
              <div style="background-color: #f8d7da; border: 2px solid #f5c6cb; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                <h2 style="color: #721c24; margin-top: 0;">❌ Solicitud Rechazada</h2>
                <p style="color: #721c24; margin: 0;">Tu solicitud de registro ha sido revisada y rechazada.</p>
              </div>
              
              <p>Hola, <strong>${nombre}</strong></p>
              <p>Lamentamos informarte que tu solicitud de registro en el Sistema de Prácticas y Tesis ha sido rechazada después de ser revisada por el administrador.</p>
              
              ${observaciones ? `
                <h3 style="color: #1e3a5f;">📝 Observaciones del Administrador:</h3>
                <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #dc3545; margin: 15px 0;">
                  <p style="margin: 0; white-space: pre-wrap;">${observaciones}</p>
                </div>
              ` : ''}

              <p style="margin-top: 20px;">Si consideras que esto es un error o deseas obtener más información, por favor contacta al administrador del sistema.</p>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/" style="background-color: #1e3a5f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Volver al Inicio
                </a>
              </div>
            </div>
            <div style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd;">
              <p style="margin: 5px 0;">Este es un correo automático, por favor no responder a esta dirección.</p>
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Universidad Nacional de Trujillo</p>
            </div>
          </div>
        `,
      });
      console.log(`✅ Email de rechazo enviado a ${to}`);
    } catch (error) {
      console.error('❌ Error enviando email de rechazo:', error);
    }
  }

  private getRolSpanish(rol: string): string {
    const rolMap: Record<string, string> = {
      ADMINISTRADOR: 'Administrador',
      COORDINADOR: 'Coordinador Académico',
      DOCENTE: 'Docente',
      ESTUDIANTE: 'Estudiante',
      REPRESENTANTE_EMPRESA: 'Representante de Empresa',
    };
    return rolMap[rol] || rol;
  }

  async sendPostulacionAprobadaEmail(
    estudianteEmail: string,
    estudianteNombre: string | null,
    ofertaTitulo: string,
    empresaNombre: string,
    asesorNombre: string | null
  ) {
    const nombreEstudiante = estudianteNombre || 'Estudiante';
    const nombreAsesor = asesorNombre || 'Asesor Académico';
    try {
      await this.resend.emails.send({
        from: 'Sistema UNT <sistema@unt.edu.pe>',
        to: estudianteEmail,
        subject: '✅ Tu Postulación ha sido Aprobada',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e3a5f; padding: 20px; text-align: center; color: white;">
              <h1>Universidad Nacional de Trujillo</h1>
              <p>Sistema de Gestión de Prácticas y Tesis</p>
            </div>
            <div style="padding: 20px;">
              <div style="background-color: #d4edda; border: 2px solid #28a745; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                <h2 style="color: #155724; margin-top: 0;">✅ ¡Postulación Aprobada!</h2>
                <p style="color: #155724; margin: 0;">Has sido seleccionado para la práctica preprofesional.</p>
              </div>
              
              <p>Hola, <strong>${nombreEstudiante}</strong></p>
              <p>¡Excelentes noticias! Tu postulación a la oferta de práctica ha sido aprobada por el coordinador académico.</p>
              
              <h3 style="color: #1e3a5f; margin-top: 25px;">📋 Detalles de tu Práctica:</h3>
              <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px; background-color: #f0f0f0; width: 35%; border-bottom: 1px solid #ddd;"><strong>Práctica:</strong></td>
                  <td style="padding: 12px; background-color: #f9f9f9; border-bottom: 1px solid #ddd;">${ofertaTitulo}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f0f0f0; border-bottom: 1px solid #ddd;"><strong>Empresa:</strong></td>
                  <td style="padding: 12px; background-color: #f9f9f9; border-bottom: 1px solid #ddd;">${empresaNombre}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f0f0f0;"><strong>Asesor Académico:</strong></td>
                  <td style="padding: 12px; background-color: #f9f9f9;">${nombreAsesor}</td>
                </tr>
              </table>

              <p><strong>Próximos pasos:</strong></p>
              <ol style="color: #333;">
                <li>Accede al sistema para ver los detalles completos de tu práctica</li>
                <li>Ponte en contacto con el asesor académico asignado</li>
                <li>Coordina con la empresa la fecha de inicio</li>
                <li>Registra tus horas y envía los informes periódicamente</li>
              </ol>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/dashboard/student/internships" style="background-color: #1e3a5f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Ver Mis Prácticas
                </a>
              </div>
            </div>
            <div style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd;">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Universidad Nacional de Trujillo</p>
            </div>
          </div>
        `,
      });
      console.log(`✅ Email de aprobación de postulación enviado a ${estudianteEmail}`);
    } catch (error) {
      console.error('❌ Error enviando email de aprobación:', error);
    }
  }

  async sendPostulacionRechazadaEmail(estudianteEmail: string, estudianteNombre: string | null, ofertaTitulo: string) {
    const nombreEstudiante = estudianteNombre || 'Estudiante';
    try {
      await this.resend.emails.send({
        from: 'Sistema UNT <sistema@unt.edu.pe>',
        to: estudianteEmail,
        subject: 'Estado de tu Postulación',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e3a5f; padding: 20px; text-align: center; color: white;">
              <h1>Universidad Nacional de Trujillo</h1>
              <p>Sistema de Gestión de Prácticas y Tesis</p>
            </div>
            <div style="padding: 20px;">
              <p>Hola, <strong>${nombreEstudiante}</strong></p>
              <p>Tu postulación para la práctica "<strong>${ofertaTitulo}</strong>" ha sido rechazada.</p>
              <p>Te recomendamos revisar otras ofertas disponibles en el sistema.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/dashboard/student/internships" style="background-color: #1e3a5f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Ver Otras Ofertas
                </a>
              </div>
            </div>
            <div style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd;">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Universidad Nacional de Trujillo</p>
            </div>
          </div>
        `,
      });
      console.log(`✅ Email de rechazo de postulación enviado a ${estudianteEmail}`);
    } catch (error) {
      console.error('❌ Error enviando email de rechazo:', error);
    }
  }

  async sendInformeEntregadoEmail(
    asesorEmail: string,
    asesorNombre: string | null,
    estudianteNombre: string | null,
    tipoInforme: string
  ) {
    const nombreAsesor = asesorNombre || 'Asesor';
    const nombreEstudiante = estudianteNombre || 'El estudiante';
    try {
      await this.resend.emails.send({
        from: 'Sistema UNT <sistema@unt.edu.pe>',
        to: asesorEmail,
        subject: `📄 Nuevo Informe: ${tipoInforme} de ${nombreEstudiante}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e3a5f; padding: 20px; text-align: center; color: white;">
              <h1>Universidad Nacional de Trujillo</h1>
              <p>Sistema de Gestión de Prácticas y Tesis</p>
            </div>
            <div style="padding: 20px;">
              <p>Hola, <strong>${nombreAsesor}</strong></p>
              <p>El estudiante <strong>${nombreEstudiante}</strong> ha enviado un informe de práctica para tu revisión.</p>
              
              <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #1e3a5f; margin: 20px 0;">
                <p style="margin: 0;"><strong>Tipo de Informe:</strong> ${tipoInforme}</p>
                <p style="margin: 5px 0 0 0;"><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
              </div>

              <p>Accede al sistema para revisar y evaluar el informe.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/dashboard/teacher" style="background-color: #1e3a5f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Revisar Informe
                </a>
              </div>
            </div>
            <div style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd;">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Universidad Nacional de Trujillo</p>
            </div>
          </div>
        `,
      });
      console.log(`✅ Email de entrega de informe enviado a ${asesorEmail}`);
    } catch (error) {
      console.error('❌ Error enviando email de informe:', error);
    }
  }
}