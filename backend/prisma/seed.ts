import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // ==================== 1. CREAR ROLES ====================
  console.log('📌 Creando roles...');
  
  const roles = [
    { nombre: 'ADMINISTRADOR', descripcion: 'Control total del sistema' },
    { nombre: 'COORDINADOR', descripcion: 'Coordinador de facultad' },
    { nombre: 'DOCENTE', descripcion: 'Docente/Asesor' },
    { nombre: 'ESTUDIANTE', descripcion: 'Estudiante' },
    { nombre: 'REPRESENTANTE_EMPRESA', descripcion: 'Representante de empresa' },
  ];

  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: {},
      create: rol,
    });
    console.log(`  ✅ Rol ${rol.nombre} creado`);
  }

  // ==================== 2. CREAR FACULTADES ====================
  console.log('📌 Creando facultades...');

  const facultades = [
    { nombre: 'Facultad de Ciencias', decano: 'Dr. Juan Pérez' },
    { nombre: 'Facultad de Ingeniería', decano: 'Dr. Carlos Ruiz' },
    { nombre: 'Facultad de Medicina', decano: 'Dra. María Gonzáles' },
    { nombre: 'Facultad de Derecho', decano: 'Dr. José Martínez' },
    { nombre: 'Facultad de Educación', decano: 'Dra. Lucía Fernández' },
    { nombre: 'Facultad de Economía', decano: 'Dr. Roberto Sánchez' },
  ];

  const facultadMap = new Map();

  for (const fac of facultades) {
    const facultad = await prisma.facultad.upsert({
      where: { nombre: fac.nombre },
      update: {},
      create: fac,
    });
    facultadMap.set(fac.nombre, facultad.id);
    console.log(`  ✅ Facultad ${fac.nombre} creada`);
  }

  // ==================== 3. CREAR CARRERAS ====================
  console.log('📌 Creando carreras...');

  const carrerasPorFacultad = [
    { facultad: 'Facultad de Ciencias', carreras: ['Matemática', 'Física', 'Química', 'Biología', 'Estadística', 'Computación Científica'] },
    { facultad: 'Facultad de Ingeniería', carreras: ['Ingeniería de Software', 'Ingeniería Civil', 'Ingeniería Industrial', 'Ingeniería Electrónica', 'Ingeniería Mecánica', 'Ingeniería de Sistemas', 'Ingeniería Ambiental', 'Ingeniería de Minas'] },
    { facultad: 'Facultad de Medicina', carreras: ['Medicina Humana', 'Enfermería', 'Odontología', 'Psicología', 'Farmacia y Bioquímica', 'Nutrición', 'Obstetricia'] },
    { facultad: 'Facultad de Derecho', carreras: ['Derecho'] },
    { facultad: 'Facultad de Educación', carreras: ['Educación Primaria', 'Educación Secundaria', 'Educación Inicial'] },
    { facultad: 'Facultad de Economía', carreras: ['Contabilidad', 'Administración', 'Economía', 'Turismo', 'Comunicación Social', 'Arquitectura'] },
  ];

  const areaMap: Record<string, string> = {
    'Facultad de Ciencias': 'A',
    'Facultad de Ingeniería': 'B',
    'Facultad de Medicina': 'C',
    'Facultad de Derecho': 'D',
    'Facultad de Educación': 'D',
    'Facultad de Economía': 'D',
  };

  for (const item of carrerasPorFacultad) {
    const facultadId = facultadMap.get(item.facultad);
    const area = areaMap[item.facultad] || 'B';
    
    for (const nombre of item.carreras) {
      await prisma.carrera.upsert({
        where: { nombre },
        update: {},
        create: {
          nombre,
          area,
          facultad_id: facultadId,
          activo: true,
        },
      });
      console.log(`    ✅ Carrera ${nombre}`);
    }
  }

  // ==================== 4. CREAR CARRERAS ADICIONALES ====================
  console.log('📌 Creando carreras adicionales...');
  
  const carrerasExtras = [
    { nombre: 'Ingeniería de Sistemas', area: 'B', facultad: 'Facultad de Ingeniería' },
    { nombre: 'Comunicación Social', area: 'D', facultad: 'Facultad de Economía' },
    { nombre: 'Arquitectura', area: 'D', facultad: 'Facultad de Economía' },
  ];

  for (const carrera of carrerasExtras) {
    const facultadId = facultadMap.get(carrera.facultad);
    await prisma.carrera.upsert({
      where: { nombre: carrera.nombre },
      update: {},
      create: {
        nombre: carrera.nombre,
        area: carrera.area,
        facultad_id: facultadId,
        activo: true,
      },
    });
    console.log(`    ✅ Carrera ${carrera.nombre}`);
  }

  // ==================== 5. CREAR USUARIO ADMINISTRADOR ====================
  console.log('📌 Creando usuario administrador...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const rolAdmin = await prisma.rol.findFirst({ where: { nombre: 'ADMINISTRADOR' } });
  const rolDocente = await prisma.rol.findFirst({ where: { nombre: 'DOCENTE' } });
  const rolEstudiante = await prisma.rol.findFirst({ where: { nombre: 'ESTUDIANTE' } });

  const admin = await prisma.usuario.upsert({
    where: { correo: 'admin@unt.edu.pe' },
    update: {},
    create: {
      correo: 'admin@unt.edu.pe',
      contrasena: adminPassword,
      nombre_completo: 'Administrador del Sistema',
      rol_id: rolAdmin!.id,
      debe_cambiar_contrasena: false,
    },
  });
  console.log('  ✅ Usuario admin creado: admin@unt.edu.pe / admin123');

  // ==================== 6. CREAR USUARIO DOCENTE ====================
  console.log('📌 Creando usuario docente...');

  const docentePassword = await bcrypt.hash('docente123', 10);
  const facultadIngenieria = await prisma.facultad.findFirst({ where: { nombre: 'Facultad de Ingeniería' } });

  const docenteUser = await prisma.usuario.upsert({
    where: { correo: 'docente@unt.edu.pe' },
    update: {},
    create: {
      correo: 'docente@unt.edu.pe',
      contrasena: docentePassword,
      nombre_completo: 'Dr. Roberto Asesor',
      rol_id: rolDocente!.id,
      debe_cambiar_contrasena: false,
    },
  });

  await prisma.docente.upsert({
    where: { usuario_id: docenteUser.id },
    update: {},
    create: {
      usuario_id: docenteUser.id,
      especialidad: 'Ingeniería de Software',
      facultad: facultadIngenieria?.id,
      activo: true,
    },
  });
  console.log('  ✅ Usuario docente creado: docente@unt.edu.pe / docente123');

  // ==================== 7. CREAR USUARIO COORDINADOR ====================
  console.log('📌 Creando usuario coordinador...');

  const rolCoordinador = await prisma.rol.findFirst({ where: { nombre: 'COORDINADOR' } });
  const coordinadorPassword = await bcrypt.hash('coordinador123', 10);

  const coordinadorUser = await prisma.usuario.upsert({
    where: { correo: 'coordinador@unt.edu.pe' },
    update: {},
    create: {
      correo: 'coordinador@unt.edu.pe',
      contrasena: coordinadorPassword,
      nombre_completo: 'Ing. Carlos Coordinador',
      rol_id: rolCoordinador!.id,
      debe_cambiar_contrasena: false,
    },
  });

  await prisma.coordinador.upsert({
    where: { usuario_id: coordinadorUser.id },
    update: {},
    create: {
      usuario_id: coordinadorUser.id,
      facultad_id: facultadIngenieria!.id,
      activo: true,
    },
  });
  console.log('  ✅ Usuario coordinador creado: coordinador@unt.edu.pe / coordinador123');

  // ==================== 8. CREAR USUARIO ESTUDIANTE ====================
  console.log('📌 Creando usuario estudiante...');

  const estudiantePassword = await bcrypt.hash('estudiante123', 10);
  const carreraIngSoftware = await prisma.carrera.findFirst({ where: { nombre: 'Ingeniería de Software' } });

  const estudianteUser = await prisma.usuario.upsert({
    where: { correo: 'estudiante@unt.edu.pe' },
    update: {},
    create: {
      correo: 'estudiante@unt.edu.pe',
      contrasena: estudiantePassword,
      nombre_completo: 'Ana María Estudiante',
      rol_id: rolEstudiante!.id,
      debe_cambiar_contrasena: false,
    },
  });

  await prisma.estudiante.upsert({
    where: { usuario_id: estudianteUser.id },
    update: {},
    create: {
      usuario_id: estudianteUser.id,
      codigo_univ: '2024-001234',
      carrera_id: carreraIngSoftware!.id,
      ciclo: 5,
      activo: true,
    },
  });
  console.log('  ✅ Usuario estudiante creado: estudiante@unt.edu.pe / estudiante123');

  // ==================== 9. CREAR USUARIO REPRESENTANTE DE EMPRESA ====================
  console.log('📌 Creando usuario representante de empresa...');

  const rolRepEmpresa = await prisma.rol.findFirst({ where: { nombre: 'REPRESENTANTE_EMPRESA' } });
  const repPassword = await bcrypt.hash('rep123', 10);

  // Crear empresa
  const empresa = await prisma.empresa.upsert({
    where: { ruc: '20459876123' },
    update: {},
    create: {
      razon_social: 'Tech Solutions S.A.C.',
      ruc: '20459876123',
      direccion: 'Av. Industrial 456, Trujillo',
      telefono: '044-234567',
      correo_contacto: 'rrhh@techsolutions.com',
      activo: true,
    },
  });
  console.log('  ✅ Empresa Tech Solutions S.A.C. creada');

  const repUser = await prisma.usuario.upsert({
    where: { correo: 'representante@techsolutions.com' },
    update: {},
    create: {
      correo: 'representante@techsolutions.com',
      contrasena: repPassword,
      nombre_completo: 'Ing. Ana Representante',
      rol_id: rolRepEmpresa!.id,
      debe_cambiar_contrasena: false,
    },
  });

  await prisma.representanteEmpresa.upsert({
    where: { usuario_id: repUser.id },
    update: {},
    create: {
      usuario_id: repUser.id,
      empresa_id: empresa.id,
      cargo: 'Gerente de RRHH',
      activo: true,
    },
  });
  console.log('  ✅ Usuario representante creado: representante@techsolutions.com / rep123');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📋 Credenciales de acceso:');
  console.log('   Administrador:     admin@unt.edu.pe / admin123');
  console.log('   Docente:           docente@unt.edu.pe / docente123');
  console.log('   Coordinador:       coordinador@unt.edu.pe / coordinador123');
  console.log('   Estudiante:        estudiante@unt.edu.pe / estudiante123');
  console.log('   Representante:     representante@techsolutions.com / rep123');
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });