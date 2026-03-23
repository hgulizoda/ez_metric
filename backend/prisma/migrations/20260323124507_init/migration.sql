-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'manager');

-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('hourly', 'percentage', 'flat');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('active', 'completed', 'missed');

-- CreateEnum
CREATE TYPE "WorkerShiftStatus" AS ENUM ('scheduled', 'completed', 'missed', 'late');

-- CreateEnum
CREATE TYPE "ChargeType" AS ENUM ('loan', 'prepayment', 'distribution', 'time_misuse');

-- CreateEnum
CREATE TYPE "BonusType" AS ENUM ('formula', 'manual');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers" (
    "id" SERIAL NOT NULL,
    "base_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "picture_url" TEXT,
    "resume_url" TEXT,
    "salary_type" "SalaryType" NOT NULL,
    "position" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" "ShiftStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_shifts" (
    "id" SERIAL NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "shift_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "status" "WorkerShiftStatus" NOT NULL DEFAULT 'scheduled',

    CONSTRAINT "worker_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clock_records" (
    "id" SERIAL NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "shift_id" INTEGER NOT NULL,
    "clock_in" TIMESTAMP(3) NOT NULL,
    "clock_out" TIMESTAMP(3),
    "is_manual_edit" BOOLEAN NOT NULL DEFAULT false,
    "edit_note" TEXT,
    "grace_period_applied" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clock_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grace_period_rules" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "minutes_allowed" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grace_period_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_rules" (
    "id" SERIAL NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "type" "SalaryType" NOT NULL,
    "rate" DECIMAL(10,2) NOT NULL,
    "overtime_multiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.5,
    "overtime_threshold_hours" INTEGER NOT NULL DEFAULT 40,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charges" (
    "id" SERIAL NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "type" "ChargeType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "remaining" DECIMAL(10,2) NOT NULL,
    "distributed_over_periods" INTEGER,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonus_rules" (
    "id" SERIAL NOT NULL,
    "position" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "min_efficiency_threshold" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bonus_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonuses" (
    "id" SERIAL NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "BonusType" NOT NULL,
    "period" DATE NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "workers_base_id_key" ON "workers"("base_id");

-- AddForeignKey
ALTER TABLE "worker_shifts" ADD CONSTRAINT "worker_shifts_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_shifts" ADD CONSTRAINT "worker_shifts_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clock_records" ADD CONSTRAINT "clock_records_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clock_records" ADD CONSTRAINT "clock_records_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_rules" ADD CONSTRAINT "salary_rules_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charges" ADD CONSTRAINT "charges_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonuses" ADD CONSTRAINT "bonuses_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
