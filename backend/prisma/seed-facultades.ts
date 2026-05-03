import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const facultades = [
  { nombre: 'Facultad de Ciencias', decano: 'Dr. Juan Pérez' },
  { nombre: 'Facultad de Ingeniería', decano: 'Dr. Carlos Ruiz' },
  { nombre: 'Facultad de Medicina', decano: 'Dra. María Gonzáles' },
  { nombre: 'Facultad de Derecho', decano: 'Dr. José Martínez' },
  { nombre: 'Facultad de Educación', decano: 'Dra. Lucía Fernández' },
  { nombre: 'Facultad de Economía', decano: 'Dr. Roberto Sánchez' },
];

const carrerasPorFacultad = {
  'Facultad de Ciencias': ['Matemática', 'Física', 'Química', 'Biología', 'Estadística'],
  'Facultad de Ingeniería': ['Ingeniería de Software', 'Ingeniería Civil', 'Ingeniería Industrial', 'Ingeniería Electrónica', 'Ingeniería Mecánica', 'Ingeniería de Sistemas'],
  'Facultad de Medicina': ['Medicina Humana', 'Enfermería', 'Odontología', 'Psicología', 'Farmacia y Bioquímica'],
  'Facultad de Derecho': ['Derecho'],
  'Facultad de Educación': ['Educación Primaria', 'Educación Secundaria', 'Educación Inicial'],
  'Facultad de Economía': ['Contabilidad', 'Administración', 'Economía', 'Turismo'],
};

async function main() {
  console.log('🌱 Creando facultades y carreras...');

  for (const fac of facultades) {
    const facultad = await prisma.facultad.upsert({
      where: { nombre: fac.nombre },
      update: { decano: fac.decano },
      create: fac,
    });
    console.log(`✅ Facultad: ${facultad.nombre}`);

    const carrerasLista = carrerasPorFacultad[fac.nombre as keyof typeof carrerasPorFacultad] || [];
    for (const nombreCarrera of carrerasLista) {
      await prisma.carrera.upsert({
        where: { nombre: nombreCarrera },
        update: { facultad_id: facultad.id },
        create: {
          nombre: nombreCarrera,
          area: 'B',
          facultad_id: facultad.id,
          activo: true,
        },
      });
      console.log(`  - Carrera: ${nombreCarrera}`);
    }
  }

  console.log('🎉 Facultades y carreras creadas exitosamente');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());