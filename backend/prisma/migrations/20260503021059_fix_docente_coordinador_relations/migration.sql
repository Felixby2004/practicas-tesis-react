-- DropForeignKey
ALTER TABLE "representantes_empresa" DROP CONSTRAINT "representantes_empresa_empresa_id_fkey";

-- DropIndex
DROP INDEX "estudiantes_activo_idx";

-- AlterTable
ALTER TABLE "docentes" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "representantes_empresa" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "solicitudes_registro" ADD COLUMN     "cargo" TEXT,
ADD COLUMN     "empresa_id" TEXT,
ADD COLUMN     "especialidad" TEXT,
ADD COLUMN     "facultad" TEXT;

-- CreateTable
CREATE TABLE "coordinadores" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "facultad_id" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coordinadores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coordinadores_usuario_id_key" ON "coordinadores"("usuario_id");

-- CreateIndex
CREATE INDEX "coordinadores_usuario_id_idx" ON "coordinadores"("usuario_id");

-- AddForeignKey
ALTER TABLE "coordinadores" ADD CONSTRAINT "coordinadores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "representantes_empresa" ADD CONSTRAINT "representantes_empresa_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
