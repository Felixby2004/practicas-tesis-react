/*
  Warnings:

  - You are about to drop the column `facultad_id` on the `docentes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "docentes" DROP CONSTRAINT "docentes_facultad_id_fkey";

-- AlterTable
ALTER TABLE "docentes" DROP COLUMN "facultad_id",
ADD COLUMN     "facultad" TEXT;
