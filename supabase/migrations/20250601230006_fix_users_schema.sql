-- Asegurar que las columnas coincidan con el esquema actual
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT 'unknown@example.com',
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'guest'
  CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'technician', 'client', 'guest')),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CONSTRAINT users_status_check CHECK (status IN ('active', 'inactive')),
ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Actualizar datos existentes
UPDATE users
SET 
  first_name = COALESCE(first_name, 'Unknown'),
  email = COALESCE(email, 'unknown@example.com'),
  status = COALESCE(status, 'active'),
  role = COALESCE(role, 'guest');