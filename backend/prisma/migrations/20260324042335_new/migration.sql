/*
  Warnings:

  - You are about to drop the column `device_id` on the `clock_records` table. All the data in the column will be lost.
  - You are about to drop the column `shift_type_id` on the `clock_records` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `clock_records` table. All the data in the column will be lost.
  - You are about to drop the column `status_changed_at` on the `clock_records` table. All the data in the column will be lost.
  - You are about to drop the column `status_changed_by` on the `clock_records` table. All the data in the column will be lost.
  - You are about to drop the column `status_note` on the `clock_records` table. All the data in the column will be lost.
  - You are about to drop the `departments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `devices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shift_types` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "clock_records" DROP CONSTRAINT "clock_records_device_id_fkey";

-- DropForeignKey
ALTER TABLE "clock_records" DROP CONSTRAINT "clock_records_shift_type_id_fkey";

-- DropForeignKey
ALTER TABLE "clock_records" DROP CONSTRAINT "clock_records_status_changed_by_fkey";

-- AlterTable
ALTER TABLE "clock_records" DROP COLUMN "device_id",
DROP COLUMN "shift_type_id",
DROP COLUMN "status",
DROP COLUMN "status_changed_at",
DROP COLUMN "status_changed_by",
DROP COLUMN "status_note";

-- DropTable
DROP TABLE "departments";

-- DropTable
DROP TABLE "devices";

-- DropTable
DROP TABLE "shift_types";

-- DropEnum
DROP TYPE "ClockStatus";
