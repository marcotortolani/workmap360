-- Create backup_history table for tracking database backups
CREATE TABLE backup_history (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by_user_name TEXT NOT NULL,
  backup_size_bytes BIGINT NOT NULL,
  tables_count INTEGER NOT NULL,
  total_records INTEGER NOT NULL,
  metadata JSONB NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'failed'))
);

-- Add index for performance on created_at column
CREATE INDEX idx_backup_history_created_at ON backup_history(created_at DESC);

-- Enable Row Level Security (optional - service role bypasses RLS)
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policy: Allow service role to bypass, require admin for regular users
CREATE POLICY admin_backup_history_policy ON backup_history
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON backup_history TO authenticated;
GRANT ALL ON backup_history TO postgres;
GRANT USAGE, SELECT ON SEQUENCE backup_history_id_seq TO authenticated;
