-- Migration: Add index on updated_at for faster sorting
-- Purpose: Optimize ORDER BY updated_at queries
-- Date: 2026-01-28

-- Add index on updated_at (most common sort column)
CREATE INDEX IF NOT EXISTS idx_repairs_updated_at ON repairs(updated_at DESC);

-- Add index on created_at (also used for sorting)
CREATE INDEX IF NOT EXISTS idx_repairs_created_at ON repairs(created_at DESC);

-- Add comment
COMMENT ON INDEX idx_repairs_updated_at IS 'Optimizes ORDER BY updated_at DESC queries';
COMMENT ON INDEX idx_repairs_created_at IS 'Optimizes ORDER BY created_at DESC queries';
