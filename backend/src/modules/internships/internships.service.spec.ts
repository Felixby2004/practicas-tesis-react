import { Test, TestingModule } from '@nestjs/testing';
import { InternshipsService } from './internships.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('InternshipsService', () => {
  let service: InternshipsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    ofertaPractica: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    postulacion: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InternshipsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InternshipsService>(InternshipsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('createOferta', () => {
    it('debe crear una oferta exitosamente', async () => {
      const dto = {
        empresa_id: 'empresa-1',
        titulo: 'Practicante Web',
        descripcion: 'Desarrollo Frontend',
        requisitos: 'React, TypeScript',
        fecha_limite_postulacion: '2026-12-31',
        vacantes: 2,
      };

      mockPrismaService.ofertaPractica.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.createOferta(dto);

      expect(result).toHaveProperty('id');
      expect(mockPrismaService.ofertaPractica.create).toHaveBeenCalled();
    });
  });

  describe('getOfertas', () => {
    it('debe retornar una lista de ofertas', async () => {
      mockPrismaService.ofertaPractica.findMany.mockResolvedValue([{ id: '1', titulo: 'Oferta 1' }]);

      const result = await service.getOfertas();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getOfertaById', () => {
    it('debe lanzar NotFoundException si la oferta no existe', async () => {
      mockPrismaService.ofertaPractica.findUnique.mockResolvedValue(null);

      await expect(service.getOfertaById('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('debe retornar la oferta si existe', async () => {
      const mockOferta = { id: '1', titulo: 'Oferta 1' };
      mockPrismaService.ofertaPractica.findUnique.mockResolvedValue(mockOferta);

      const result = await service.getOfertaById('1');

      expect(result).toEqual(mockOferta);
    });
  });

  describe('postular', () => {
    it('debe lanzar BadRequestException si ya postuló', async () => {
      mockPrismaService.postulacion.findFirst.mockResolvedValue({ id: 'p1' });

      await expect(service.postular({ oferta_id: 'o1', estudiante_id: 'e1' }))
        .rejects.toThrow(BadRequestException);
    });

    it('debe crear una postulación si es válida', async () => {
      mockPrismaService.postulacion.findFirst.mockResolvedValue(null);
      mockPrismaService.postulacion.create.mockResolvedValue({ id: 'p1', estado: 'pendiente' });

      const result = await service.postular({ oferta_id: 'o1', estudiante_id: 'e1', curriculum_url: 'url' });

      expect(result).toHaveProperty('id');
      expect(result.estado).toBe('pendiente');
    });
  });
});
