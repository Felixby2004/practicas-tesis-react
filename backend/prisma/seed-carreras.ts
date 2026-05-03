import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const carrerasPorArea = {
  'A - Ciencias': [
    'Matemática',
    'Física',
    'Química',
    'Biología',
    'Estadística',
    'Computación Científica'
  ],
  'B - Ingeniería': [
    'Ingeniería de Software',
    'Ingeniería Civil',
    'Ingeniería Industrial',
    'Ingeniería Electrónica',
    'Ingeniería Mecánica',
    'Ingeniería de Sistemas',
    'Ingeniería Ambiental',
    'Ingeniería de Minas'
  ],
  'C - Salud': [
    'Medicina Humana',
    'Enfermería',
    'Odontología',
    'Psicología',
    'Farmacia y Bioquímica',
    'Nutrición',
    'Obstetricia'
  ],
  'D - Humanidades': [
    'Derecho',
    'Educación',
    'Contabilidad',
    'Administración',
    'Economía',
    'Comunicación Social',
    'Arquitectura',
    'Turismo'
  ]
};

async function main() {
  for (const [area, carreras] of Object.entries(carrerasPorArea)) {
    for (const nombre of carreras) {
      await prisma.carrera.upsert({
        where: { nombre },
        update: {},
        create: {
          nombre,
          area: area.charAt(0),
          descripcion: `${area}`,
          activo: true,
        },
      });
      console.log(`✅ Carrera ${nombre} (${area}) creada`);
    }
  }
  console.log('🎉 Carreras creadas exitosamente');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());