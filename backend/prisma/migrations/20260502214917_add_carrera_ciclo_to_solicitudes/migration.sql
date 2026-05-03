-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "nombre_completo" TEXT,
    "rol_id" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carreras" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carreras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estudiantes" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "codigo_univ" TEXT NOT NULL,
    "carrera_id" TEXT NOT NULL,
    "ciclo" INTEGER NOT NULL,
    "expediente" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estudiantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docentes" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "especialidad" TEXT NOT NULL,
    "facultad" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "docentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "razon_social" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "correo_contacto" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "representantes_empresa" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "cargo" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "representantes_empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "convenios" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "archivo_url" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "convenios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ofertas_practicas" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "requisitos" TEXT NOT NULL,
    "fecha_publicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_limite_postulacion" TIMESTAMP(3) NOT NULL,
    "vacantes" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'abierta',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ofertas_practicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postulaciones" (
    "id" TEXT NOT NULL,
    "oferta_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "fecha_postulacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "curriculum_url" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postulaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones_asesores" (
    "id" TEXT NOT NULL,
    "postulacion_id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asignaciones_asesores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_horas" (
    "id" TEXT NOT NULL,
    "postulacion_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horas_trabajadas" INTEGER NOT NULL,
    "descripcion_actividad" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registros_horas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "informes_practicas" (
    "id" TEXT NOT NULL,
    "postulacion_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT,
    "archivo_url" TEXT,
    "fecha_entrega" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "informes_practicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proyectos_tesis" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "asesor_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'propuesta',
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proyectos_tesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregables_tesis" (
    "id" TEXT NOT NULL,
    "tesis_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_limite" TIMESTAMP(3) NOT NULL,
    "fecha_entrega" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "archivo_url" TEXT,
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entregables_tesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jurados_tesis" (
    "id" TEXT NOT NULL,
    "tesis_id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "cargo" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jurados_tesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sustentaciones_tesis" (
    "id" TEXT NOT NULL,
    "tesis_id" TEXT NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "lugar" TEXT,
    "resultado" TEXT,
    "acta_url" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sustentaciones_tesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_registro" (
    "id" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "rol_solicitado" TEXT NOT NULL,
    "carrera_id" TEXT,
    "ciclo" INTEGER,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "observaciones" TEXT,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_respuesta" TIMESTAMP(3),
    "respondido_por" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitudes_registro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE INDEX "usuarios_correo_idx" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "carreras_nombre_key" ON "carreras"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "estudiantes_usuario_id_key" ON "estudiantes"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "estudiantes_codigo_univ_key" ON "estudiantes"("codigo_univ");

-- CreateIndex
CREATE INDEX "estudiantes_usuario_id_idx" ON "estudiantes"("usuario_id");

-- CreateIndex
CREATE INDEX "estudiantes_codigo_univ_idx" ON "estudiantes"("codigo_univ");

-- CreateIndex
CREATE INDEX "estudiantes_activo_idx" ON "estudiantes"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "docentes_usuario_id_key" ON "docentes"("usuario_id");

-- CreateIndex
CREATE INDEX "docentes_usuario_id_idx" ON "docentes"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_ruc_key" ON "empresas"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_correo_contacto_key" ON "empresas"("correo_contacto");

-- CreateIndex
CREATE UNIQUE INDEX "representantes_empresa_usuario_id_key" ON "representantes_empresa"("usuario_id");

-- CreateIndex
CREATE INDEX "representantes_empresa_usuario_id_idx" ON "representantes_empresa"("usuario_id");

-- CreateIndex
CREATE INDEX "representantes_empresa_empresa_id_idx" ON "representantes_empresa"("empresa_id");

-- CreateIndex
CREATE INDEX "convenios_empresa_id_idx" ON "convenios"("empresa_id");

-- CreateIndex
CREATE INDEX "ofertas_practicas_empresa_id_idx" ON "ofertas_practicas"("empresa_id");

-- CreateIndex
CREATE INDEX "postulaciones_oferta_id_idx" ON "postulaciones"("oferta_id");

-- CreateIndex
CREATE INDEX "postulaciones_estudiante_id_idx" ON "postulaciones"("estudiante_id");

-- CreateIndex
CREATE INDEX "asignaciones_asesores_postulacion_id_idx" ON "asignaciones_asesores"("postulacion_id");

-- CreateIndex
CREATE INDEX "asignaciones_asesores_docente_id_idx" ON "asignaciones_asesores"("docente_id");

-- CreateIndex
CREATE INDEX "registros_horas_postulacion_id_idx" ON "registros_horas"("postulacion_id");

-- CreateIndex
CREATE INDEX "informes_practicas_postulacion_id_idx" ON "informes_practicas"("postulacion_id");

-- CreateIndex
CREATE INDEX "proyectos_tesis_estudiante_id_idx" ON "proyectos_tesis"("estudiante_id");

-- CreateIndex
CREATE INDEX "proyectos_tesis_asesor_id_idx" ON "proyectos_tesis"("asesor_id");

-- CreateIndex
CREATE INDEX "entregables_tesis_tesis_id_idx" ON "entregables_tesis"("tesis_id");

-- CreateIndex
CREATE INDEX "jurados_tesis_tesis_id_idx" ON "jurados_tesis"("tesis_id");

-- CreateIndex
CREATE INDEX "jurados_tesis_docente_id_idx" ON "jurados_tesis"("docente_id");

-- CreateIndex
CREATE UNIQUE INDEX "sustentaciones_tesis_tesis_id_key" ON "sustentaciones_tesis"("tesis_id");

-- CreateIndex
CREATE INDEX "sustentaciones_tesis_tesis_id_idx" ON "sustentaciones_tesis"("tesis_id");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_registro_correo_key" ON "solicitudes_registro"("correo");

-- CreateIndex
CREATE INDEX "solicitudes_registro_estado_idx" ON "solicitudes_registro"("estado");

-- CreateIndex
CREATE INDEX "solicitudes_registro_rol_solicitado_idx" ON "solicitudes_registro"("rol_solicitado");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_carrera_id_fkey" FOREIGN KEY ("carrera_id") REFERENCES "carreras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docentes" ADD CONSTRAINT "docentes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "representantes_empresa" ADD CONSTRAINT "representantes_empresa_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "representantes_empresa" ADD CONSTRAINT "representantes_empresa_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convenios" ADD CONSTRAINT "convenios_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ofertas_practicas" ADD CONSTRAINT "ofertas_practicas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulaciones" ADD CONSTRAINT "postulaciones_oferta_id_fkey" FOREIGN KEY ("oferta_id") REFERENCES "ofertas_practicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulaciones" ADD CONSTRAINT "postulaciones_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_asesores" ADD CONSTRAINT "asignaciones_asesores_postulacion_id_fkey" FOREIGN KEY ("postulacion_id") REFERENCES "postulaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_asesores" ADD CONSTRAINT "asignaciones_asesores_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_horas" ADD CONSTRAINT "registros_horas_postulacion_id_fkey" FOREIGN KEY ("postulacion_id") REFERENCES "postulaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "informes_practicas" ADD CONSTRAINT "informes_practicas_postulacion_id_fkey" FOREIGN KEY ("postulacion_id") REFERENCES "postulaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos_tesis" ADD CONSTRAINT "proyectos_tesis_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos_tesis" ADD CONSTRAINT "proyectos_tesis_asesor_id_fkey" FOREIGN KEY ("asesor_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregables_tesis" ADD CONSTRAINT "entregables_tesis_tesis_id_fkey" FOREIGN KEY ("tesis_id") REFERENCES "proyectos_tesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jurados_tesis" ADD CONSTRAINT "jurados_tesis_tesis_id_fkey" FOREIGN KEY ("tesis_id") REFERENCES "proyectos_tesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jurados_tesis" ADD CONSTRAINT "jurados_tesis_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sustentaciones_tesis" ADD CONSTRAINT "sustentaciones_tesis_tesis_id_fkey" FOREIGN KEY ("tesis_id") REFERENCES "proyectos_tesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
