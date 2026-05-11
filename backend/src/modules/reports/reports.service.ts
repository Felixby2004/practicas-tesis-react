import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import QRCode from 'qrcode';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generarCodigoQR(data: string): Promise<string> {
    return QRCode.toDataURL(data);
  }

  async generarCertificadoPractica(postulacionId: string) {
    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id: postulacionId },
      include: {
        estudiante: { include: { usuario: true, carrera: true } },
        oferta: { include: { empresa: true } },
        horas: true,
        informes: true,
      },
    });

    if (!postulacion) {
      throw new Error('Postulación no encontrada');
    }

    const horasTotales = (postulacion.horas || []).reduce((acc: number, h: any) => acc + h.horas_trabajadas, 0);
    
    const certificadoExiste = await this.prisma.certificadoPractica.findUnique({
      where: { postulacion_id: postulacionId },
    });

    const codigoCertificado = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const qrData = await this.generarCodigoQR(JSON.stringify({
      codigo: codigoCertificado,
      estudiante: postulacion.estudiante?.usuario?.nombre_completo,
      empresa: postulacion.oferta?.empresa?.razon_social,
      horas: horasTotales,
      fecha: new Date().toISOString(),
    }));

    if (certificadoExiste) {
      return this.prisma.certificadoPractica.update({
        where: { postulacion_id: postulacionId },
        data: {
          codigo: codigoCertificado,
          qr_code: qrData,
          fecha_emision: new Date(),
        },
      });
    }

    return this.prisma.certificadoPractica.create({
      data: {
        postulacion_id: postulacionId,
        codigo: codigoCertificado,
        qr_code: qrData,
      },
    });
  }
}