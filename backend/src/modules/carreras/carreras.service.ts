import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CarrerasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.carrera.findMany({
      where: { activo: true },
      orderBy: [{ area: 'asc' }, { nombre: 'asc' }],
    });
  }

  async findById(id: string) {
    return this.prisma.carrera.findUnique({
      where: { id },
    });
  }
}