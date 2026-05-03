import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  
  // 1. Crear Roles
  const roles = [
    { nombre: 'ADMINISTRADOR', descripcion: 'Administrador total del sistema' },
    { nombre: 'COORDINADOR', descripcion: 'Coordinador de facultad' },
    { nombre: 'DOCENTE', descripcion: 'Asesor o docente de la facultad' },
    { nombre: 'ESTUDIANTE', descripcion: 'Estudiante de la facultad' },
    { nombre: 'REPRESENTANTE_EMPRESA', descripcion: 'Representante de una empresa externa' },
  ];

  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: { descripcion: rol.descripcion },
      create: rol,
    });
  }

  const rolAdmin = await prisma.rol.findUnique({ where: { nombre: 'ADMINISTRADOR' } });
  const rolDocente = await prisma.rol.findUnique({ where: { nombre: 'DOCENTE' } });
  const rolEstudiante = await prisma.rol.findUnique({ where: { nombre: 'ESTUDIANTE' } });
  const rolCoordinador = await prisma.rol.findUnique({ where: { nombre: 'COORDINADOR' } });
  const rolRepresentante = await prisma.rol.findUnique({ where: { nombre: 'REPRESENTANTE_EMPRESA' } });

  if (!rolAdmin || !rolDocente || !rolEstudiante || !rolCoordinador || !rolRepresentante) {
    throw new Error('No se pudieron crear los roles');
  }

  // 2. Crear Usuario Administrador
  const admin = await prisma.usuario.upsert({
    where: { correo: 'admin@unt.edu.pe' },
    update: {},
    create: {
      correo: 'admin@unt.edu.pe',
      contrasena: password,
      nombre_completo: 'Administrador Sistema',
      rol_id: rolAdmin.id,
    }
  });

  // 3. Crear un Coordinador
  const coordUser = await prisma.usuario.upsert({
    where: { correo: 'coordinador@unt.edu.pe' },
    update: {},
    create: {
      correo: 'coordinador@unt.edu.pe',
      contrasena: password,
      nombre_completo: 'Ing. Carlos Coordinador',
      rol_id: rolCoordinador.id,
    }
  });

  // 4. Crear un Docente (Asesor)
  const docenteUser = await prisma.usuario.upsert({
    where: { correo: 'asesor@unt.edu.pe' },
    update: {},
    create: {
      correo: 'asesor@unt.edu.pe',
      contrasena: password,
      nombre_completo: 'Dr. Roberto Asesor',
      rol_id: rolDocente.id,
    }
  });

  const docente = await prisma.docente.upsert({
    where: { usuario_id: docenteUser.id },
    update: {},
    create: {
      usuario_id: docenteUser.id,
      especialidad: 'Ingeniería de Software',
      facultad: 'Facultad de Ingeniería',
    }
  });

  // 6. Crear una Empresa
  const empresa = await prisma.empresa.upsert({
    where: { ruc: '20123456789' },
    update: {},
    create: {
      razon_social: 'Tech Solutions S.A.C.',
      ruc: '20123456789',
      direccion: 'Av. Industrial 456, Trujillo',
      telefono: '044-234567',
      correo_contacto: 'rrhh@techsolutions.com',
    }
  });

  // 7. Crear un Representante de Empresa
  const repUser = await prisma.usuario.upsert({
    where: { correo: 'rep@techsolutions.com' },
    update: {},
    create: {
      correo: 'rep@techsolutions.com',
      contrasena: password,
      nombre_completo: 'Ing. Ana Representante',
      rol_id: rolRepresentante.id,
    }
  });

  await prisma.representanteEmpresa.create({
    data: {
      usuario_id: repUser.id,
      empresa_id: empresa.id,
      cargo: 'Gerente de TI',
    }
  });

  console.log('✅ Datos iniciales y de prueba creados exitosamente');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
