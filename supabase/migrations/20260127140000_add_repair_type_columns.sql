-- Migration: Add indexed columns for repair_type and primary_technician to repairs table
-- Purpose: Optimize filtering performance by denormalizing JSONB data into indexed columns
-- Author: System
-- Date: 2026-01-27

-- Step 1: Add new columns (idempotent - checks if columns exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'repairs' AND column_name = 'repair_type_id'
  ) THEN
    ALTER TABLE repairs ADD COLUMN repair_type_id INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'repairs' AND column_name = 'repair_type_code'
  ) THEN
    ALTER TABLE repairs ADD COLUMN repair_type_code TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'repairs' AND column_name = 'primary_technician_id'
  ) THEN
    ALTER TABLE repairs ADD COLUMN primary_technician_id INTEGER;
  END IF;
END $$;

-- Step 2: Migrate existing data from JSONB phases to new columns
-- Only update rows where the new columns are NULL (idempotent)
UPDATE repairs
SET
  repair_type_code = COALESCE(
    phases->'survey'->>'repair_type',
    phases->'progress'->0->>'repair_type'
  ),
  primary_technician_id = COALESCE(
    CAST(phases->'survey'->>'created_by_user_id' AS INTEGER),
    CAST(phases->'progress'->0->>'created_by_user_id' AS INTEGER)
  )
WHERE phases IS NOT NULL
AND (repair_type_code IS NULL OR primary_technician_id IS NULL);

-- Step 3: Populate repair_type_id based on repair_type_code
-- Match with repair_types table using the type column
UPDATE repairs
SET repair_type_id = repair_types.id
FROM repair_types
WHERE repairs.repair_type_code = repair_types.type
AND repairs.repair_type_code IS NOT NULL
AND repairs.repair_type_id IS NULL;

-- Step 3.5: Clean up orphaned references before adding Foreign Keys
-- Set repair_type_id to NULL if it references a non-existent repair_type
UPDATE repairs
SET repair_type_id = NULL
WHERE repair_type_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM repair_types WHERE repair_types.id = repairs.repair_type_id
);

-- Set primary_technician_id to NULL if it references a non-existent user
UPDATE repairs
SET primary_technician_id = NULL
WHERE primary_technician_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM users WHERE users.id = repairs.primary_technician_id
);

-- Step 4: Add Foreign Key constraints (idempotent - checks if constraints exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_repairs_repair_type' AND table_name = 'repairs'
  ) THEN
    ALTER TABLE repairs
    ADD CONSTRAINT fk_repairs_repair_type
      FOREIGN KEY (repair_type_id) REFERENCES repair_types(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_repairs_primary_technician' AND table_name = 'repairs'
  ) THEN
    ALTER TABLE repairs
    ADD CONSTRAINT fk_repairs_primary_technician
      FOREIGN KEY (primary_technician_id) REFERENCES users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Step 5: Create indexes for optimized query performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_repairs_repair_type_id ON repairs(repair_type_id);
CREATE INDEX IF NOT EXISTS idx_repairs_repair_type_code ON repairs(repair_type_code);
CREATE INDEX IF NOT EXISTS idx_repairs_primary_technician_id ON repairs(primary_technician_id);
CREATE INDEX IF NOT EXISTS idx_repairs_composite ON repairs(repair_type_code, primary_technician_id, status);

-- Step 6: Add column comments for documentation
COMMENT ON COLUMN repairs.repair_type_id IS 'Foreign Key to repair_types.id for referential integrity and JOINs';
COMMENT ON COLUMN repairs.repair_type_code IS 'Denormalized repair type code (CR, RR, JR, etc.) for fast filtering without JOINs';
COMMENT ON COLUMN repairs.primary_technician_id IS 'Foreign Key to users.id - technician who created the survey phase';
