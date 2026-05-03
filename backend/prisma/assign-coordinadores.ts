import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Asignando facultades a coordinadores...');

  // Obtener la primera facultad disponible
  const facultad = await prisma.facultad.findFirst();
  
  if (!facultad) {
    console.error('❌ No hay facultades creadas. Ejecuta seed-facultades.ts primero');
    console.log('Ejecuta: npx ts-node prisma/seed-facultades.ts');
    return;
  }

  console.log(`📚 Facultad encontrada: ${facultad.nombre} (ID: ${facultad.id})`);

  // Buscar coordinadores con facultad_id vacío
  const coordinadoresSinFacultad = await prisma.coordinador.findMany({
    where: {
      facultad_id: ''
    }
  });

  console.log(`👥 Coordinadores sin facultad: ${coordinadoresSinFacultad.length}`);

  if (coordinadoresSinFacultad.length > 0) {
    const result = await prisma.coordinador.updateMany({
      where: {
        facultad_id: ''
      },
      data: { facultad_id: facultad.id },
    });

    console.log(`✅ ${result.count} coordinadores actualizados con facultad: ${facultad.nombre}`);
  } else {
    console.log('✅ Todos los coordinadores ya tienen facultad asignada');
  }

  // Mostrar coordinadores actualizados
  const coordinadores = await prisma.coordinador.findMany({
    include: { usuario: true, facultad: true }
  });

  console.log('\n📋 Lista de coordinadores:');
  if (coordinadores.length === 0) {
    console.log('  No hay coordinadores registrados');
  } else {
    coordinadores.forEach(coord => {
      console.log(`  - ${coord.usuario?.nombre_completo || 'Sin nombre'} | Facultad: ${coord.facultad?.nombre || 'Sin asignar'}`);
    });
  }
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });