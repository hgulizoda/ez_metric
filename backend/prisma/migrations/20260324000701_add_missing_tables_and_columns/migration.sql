-- CreateEnum
CREATE TYPE "ClockStatus" AS ENUM ('pending', 'approved', 'rejected', 'flagged');

-- CreateTable: departments
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateTable: shift_types
CREATE TABLE "shift_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shift_types_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "shift_types_name_key" ON "shift_types"("name");

-- CreateTable: devices
CREATE TABLE "devices" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "serial_number" TEXT,
    "location" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "devices_serial_number_key" ON "devices"("serial_number");

-- AlterTable: clock_records - add new columns
ALTER TABLE "clock_records" ADD COLUMN "device_id" INTEGER;
ALTER TABLE "clock_records" ADD COLUMN "shift_type_id" INTEGER;
ALTER TABLE "clock_records" ADD COLUMN "status" "ClockStatus" NOT NULL DEFAULT 'pending';
ALTER TABLE "clock_records" ADD COLUMN "status_changed_by" INTEGER;
ALTER TABLE "clock_records" ADD COLUMN "status_changed_at" TIMESTAMP(3);
ALTER TABLE "clock_records" ADD COLUMN "status_note" TEXT;

-- AddForeignKey
ALTER TABLE "clock_records" ADD CONSTRAINT "clock_records_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "clock_records" ADD CONSTRAINT "clock_records_shift_type_id_fkey" FOREIGN KEY ("shift_type_id") REFERENCES "shift_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "clock_records" ADD CONSTRAINT "clock_records_status_changed_by_fkey" FOREIGN KEY ("status_changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
