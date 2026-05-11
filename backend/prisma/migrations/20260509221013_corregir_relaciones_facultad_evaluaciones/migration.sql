/*
  Warnings:

  - You are about to drop the column `facultad` on the `docentes` table. All the data in the column will be lost.
  - You are about to drop the column `expediente` on the `estudiantes` table. All the data in the column will be lost.
  - You are about to drop the column `facultad` on the `solicitudes_registro` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "docentes" DROP COLUMN "facultad",
ADD COLUMN     "facultad_id" TEXT;

-- AlterTable
ALTER TABLE "estudiantes" DROP COLUMN "expediente",
ADD COLUMN     "expediente_url" TEXT,
ADD COLUMN     "horas_totales" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "practicas_completadas" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "informes_practicas" ADD COLUMN     "fecha_revision" TIMESTAMP(3),
ADD COLUMN     "observaciones" TEXT;

-- AlterTable
ALTER TABLE "jurados_tesis" ADD COLUMN     "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ofertas_practicas" ADD COLUMN     "convocatoria_id" TEXT,
ADD COLUMN     "fecha_fin_practica" TIMESTAMP(3),
ADD COLUMN     "fecha_inicio_practica" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "postulaciones" ADD COLUMN     "carta_presentacion_url" TEXT,
ADD COLUMN     "fecha_aprobacion" TIMESTAMP(3),
ADD COLUMN     "fecha_culminacion" TIMESTAMP(3),
ADD COLUMN     "fecha_fin" TIMESTAMP(3),
ADD COLUMN     "fecha_inicio" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "proyectos_tesis" ADD COLUMN     "fecha_aprobacion" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "registros_horas" ADD COLUMN     "validado_asesor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "validado_empresa" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "solicitudes_registro" DROP COLUMN "facultad";

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "debe_cambiar_contrasena" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ultimo_cambio_contrasena" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "convocatorias" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "bases_url" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "convocatorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluaciones_practicas" (
    "id" TEXT NOT NULL,
    "postulacion_id" TEXT NOT NULL,
    "rubrica" JSONB NOT NULL,
    "nota_final" DOUBLE PRECISION,
    "comentarios" TEXT,
    "evaluador_id" TEXT NOT NULL,
    "fecha_evaluacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluaciones_practicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_practicas" (
    "id" TEXT NOT NULL,
    "postulacion_id" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "comprobante_url" TEXT,
    "fecha_pago" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_practicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificados_practicas" (
    "id" TEXT NOT NULL,
    "postulacion_id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url_pdf" TEXT,
    "qr_code" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificados_practicas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "evaluaciones_practicas_postulacion_id_key" ON "evaluaciones_practicas"("postulacion_id");

-- CreateIndex
CREATE INDEX "evaluaciones_practicas_postulacion_id_idx" ON "evaluaciones_practicas"("postulacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_practicas_postulacion_id_key" ON "pagos_practicas"("postulacion_id");

-- CreateIndex
CREATE INDEX "pagos_practicas_postulacion_id_idx" ON "pagos_practicas"("postulacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificados_practicas_postulacion_id_key" ON "certificados_practicas"("postulacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificados_practicas_codigo_key" ON "certificados_practicas"("codigo");

-- CreateIndex
CREATE INDEX "certificados_practicas_postulacion_id_idx" ON "certificados_practicas"("postulacion_id");

-- AddForeignKey
ALTER TABLE "docentes" ADD CONSTRAINT "docentes_facultad_id_fkey" FOREIGN KEY ("facultad_id") REFERENCES "facultades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ofertas_practicas" ADD CONSTRAINT "ofertas_practicas_convocatoria_id_fkey" FOREIGN KEY ("convocatoria_id") REFERENCES "convocatorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_practicas" ADD CONSTRAINT "evaluaciones_practicas_postulacion_id_fkey" FOREIGN KEY ("postulacion_id") REFERENCES "postulaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_practicas" ADD CONSTRAINT "evaluaciones_practicas_evaluador_id_fkey" FOREIGN KEY ("evaluador_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_practicas" ADD CONSTRAINT "pagos_practicas_postulacion_id_fkey" FOREIGN KEY ("postulacion_id") REFERENCES "postulaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados_practicas" ADD CONSTRAINT "certificados_practicas_postulacion_id_fkey" FOREIGN KEY ("postulacion_id") REFERENCES "postulaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
