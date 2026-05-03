-- AlterTable
ALTER TABLE "carreras" ADD COLUMN     "facultad_id" TEXT;

-- CreateTable
CREATE TABLE "facultades" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "decano" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facultades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "facultades_nombre_key" ON "facultades"("nombre");

-- CreateIndex
CREATE INDEX "coordinadores_facultad_id_idx" ON "coordinadores"("facultad_id");

-- AddForeignKey
ALTER TABLE "carreras" ADD CONSTRAINT "carreras_facultad_id_fkey" FOREIGN KEY ("facultad_id") REFERENCES "facultades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coordinadores" ADD CONSTRAINT "coordinadores_facultad_id_fkey" FOREIGN KEY ("facultad_id") REFERENCES "facultades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
