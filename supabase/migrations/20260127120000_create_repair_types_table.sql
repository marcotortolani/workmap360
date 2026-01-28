-- Create repair_types table to store repair type configurations
CREATE TABLE repair_types (
  id SERIAL PRIMARY KEY,
  variation TEXT NOT NULL,
  type TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  unit_measure JSONB NOT NULL,
  unit_to_charge TEXT NOT NULL,
  conversion JSONB,
  color TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by_user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX idx_repair_types_status ON repair_types(status);
CREATE INDEX idx_repair_types_type ON repair_types(type);

-- Insert hardcoded repair types data
INSERT INTO repair_types (id, variation, type, description, unit_measure, unit_to_charge, conversion, color, status, created_by_user_id, created_by_user_name, created_at) VALUES
(1, 'Concrete Repair', 'CR', '', '{"type":"volume","value":"mm x mm x mm","dimensions":["width","height","depth"]}', 'Lt', '{"from":{"type":"volume","value":"mm x mm x mm","dimensions":["width","height","depth"]},"to":"Lt"}', 'blue', 'active', 1, 'admin', '2025-08-11'),
(2, 'Render Repair', 'RR', '', '{"type":"area_thickness","value":"mm x mm x mm","dimensions":["width","height","thickness"]}', 'm2', '{"from":{"type":"area_thickness","value":"mm x mm x mm","dimensions":["width","height","thickness"]},"to":"m2"}', 'red', 'active', 1, 'admin', '2025-08-11'),
(3, 'Joint Replacement', 'JR', '', '{"type":"length","value":"mm","dimensions":["length"]}', 'm', '{"from":{"type":"length","value":"mm","dimensions":["length"]},"to":"m"}', 'green', 'active', 1, 'admin', '2025-08-11'),
(4, 'Rusty Spots', 'RS', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'green', 'active', 1, 'admin', '2025-08-11'),
(5, 'Narrow Render Repair', 'NR', '', '{"type":"length_thickness","value":"mm","dimensions":["length"]}', 'm', '{"from":{"type":"length_thickness","value":"mm","dimensions":["length"]},"to":"m"}', 'green', 'active', 1, 'admin', '2025-08-11'),
(6, 'Replacing Bricks', 'B', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'orange', 'active', 1, 'admin', '2025-08-11'),
(7, 'New Joint Selant', 'NJ', '', '{"type":"length","value":"mm","dimensions":["length"]}', 'm', '{"from":{"type":"length","value":"mm","dimensions":["length"]},"to":"m"}', 'green', 'active', 1, 'admin', '2025-08-11'),
(8, 'Joint Application', 'JA', '', '{"type":"length","value":"mm","dimensions":["length"]}', 'm', '{"from":{"type":"length","value":"mm","dimensions":["length"]},"to":"m"}', 'orange', 'active', 1, 'admin', '2025-08-11'),
(9, 'Tie Wires', 'TW', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'red', 'active', 1, 'admin', '2025-08-11'),
(10, 'Missing Pointing', 'MP', '', '{"type":"length","value":"mm","dimensions":["length"]}', 'm', '{"from":{"type":"length","value":"mm","dimensions":["length"]},"to":"m"}', 'orange', 'active', 1, 'admin', '2025-08-11'),
(11, 'Crack Repair Small', 'KRS', '< 1m', '{"type":"length","value":"mm","dimensions":["length"]}', 'm', '{"from":{"type":"length","value":"mm","dimensions":["length"]},"to":"m"}', 'orange', 'active', 1, 'admin', '2025-08-11'),
(12, 'Crack Repair Large', 'KRL', '> 1m', '{"type":"length","value":"mm","dimensions":["length"]}', 'm', '{"from":{"type":"length","value":"mm","dimensions":["length"]},"to":"m"}', 'orange', 'active', 1, 'admin', '2025-08-11'),
(13, 'Crack Repair Ground', 'KRG', '', '{"type":"length","value":"mm","dimensions":["length"]}', 'm', '{"from":{"type":"length","value":"mm","dimensions":["length"]},"to":"m"}', 'orange', 'active', 1, 'admin', '2025-08-11'),
(14, 'HeliBar', 'HB', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'orange', 'active', 1, 'admin', '2025-08-11'),
(15, 'Corner HeliBar', 'CHB', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'orange', 'active', 1, 'admin', '2025-08-11'),
(16, 'Rotted or Decayed Timber on Sashes', 'RT', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'orange', 'active', 1, 'admin', '2025-08-11'),
(17, 'Screws fixing double-hung Sashes', 'SS', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'orange', 'active', 1, 'admin', '2025-08-11'),
(18, 'Spalls Corroding Cramps', 'SC', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'orange', 'active', 1, 'admin', '2025-08-11'),
(19, 'Painting Touchup', 'PT', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'orange', 'active', 1, 'admin', '2025-08-11'),
(20, 'FormWork', 'FW', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'orange', 'active', 1, 'admin', '2025-08-11'),
(21, 'Pity Pocket', 'PP', '', '{"type":"volume","value":"mm x mm x mm","dimensions":["width","height","depth"]}', 'Lt', '{"from":{"type":"volume","value":"mm x mm x mm","dimensions":["width","height","depth"]},"to":"Lt"}', 'blue', 'active', 1, 'admin', '2025-08-11'),
(22, 'Flashing', 'FL', '', '{"type":"length","value":"mm","dimensions":["length"]}', 'm', '{"from":{"type":"length","value":"mm","dimensions":["length"]},"to":"m"}', 'orange', 'active', 1, 'admin', '2025-08-11'),
(23, 'Extent of Loose or missing glazing Putty', 'LP', '', '{"type":"length","value":"mm","dimensions":["length"]}', 'm', '{"from":{"type":"length","value":"mm","dimensions":["length"]},"to":"m"}', 'orange', 'active', 1, 'admin', '2025-08-11'),
(24, 'Mortar Repair', 'MR', '', '{"type":"area","value":"mm x mm","dimensions":["width","height"]}', 'm2', '{"from":{"type":"area","value":"mm x mm","dimensions":["width","height"]},"to":"m2"}', NULL, 'active', 1, 'admin', '2025-08-11'),
(25, 'Sills', 'S', '', '{"type":"area","value":"mm x mm","dimensions":["width","height"]}', 'm2', '{"from":{"type":"area","value":"mm x mm","dimensions":["width","height"]},"to":"m2"}', NULL, 'active', 1, 'admin', '2025-08-11'),
(26, 'Extent of Cracked Glass panels', 'CG', '', '{"type":"area","value":"mm x mm","dimensions":["width","height"]}', 'm2', '{"from":{"type":"area","value":"mm x mm","dimensions":["width","height"]},"to":"m2"}', NULL, 'active', 1, 'admin', '2025-08-11'),
(27, 'Delaminated, cracked Sandstone', 'DS', '', '{"type":"area","value":"mm x mm","dimensions":["width","height"]}', 'm2', '{"from":{"type":"area","value":"mm x mm","dimensions":["width","height"]},"to":"m2"}', NULL, 'active', 1, 'admin', '2025-08-11'),
(28, 'Exfolation Sandstone', 'ES', '', '{"type":"area","value":"mm x mm","dimensions":["width","height"]}', 'm2', '{"from":{"type":"area","value":"mm x mm","dimensions":["width","height"]},"to":"m2"}', NULL, 'active', 1, 'admin', '2025-08-11'),
(29, 'Plug Removal', 'PR', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'orange', 'active', 1, 'admin', '2025-08-11'),
(30, 'Holes', 'H', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'orange', 'active', 1, 'admin', '2025-08-11'),
(31, 'Steel Holes', 'SH', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'orange', 'active', 1, 'admin', '2025-08-11'),
(32, 'Frame Separation', 'FS', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'orange', 'active', 1, 'admin', '2025-08-11'),
(33, 'Concrete Repair 1', 'CR1', '', '{"type":"volume","value":"mm x mm x mm","default_values":{"depth":1},"dimensions":["width","height","depth"]}', 'Lt', '{"from":{"type":"volume","value":"mm x mm x mm","dimensions":["width","height","depth"]},"to":"Lt"}', NULL, 'inactive', 1, 'admin', '2025-01-01'),
(34, 'Concrete Repair 2', 'CR2', '', '{"type":"volume","value":"mm x mm x mm","default_values":{"depth":2},"dimensions":["width","height","depth"]}', 'Lt', '{"from":{"type":"volume","value":"mm x mm x mm","dimensions":["width","height","depth"]},"to":"Lt"}', NULL, 'inactive', 1, 'admin', '2025-01-01'),
(35, 'Windows Painting', 'WP', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'green', 'active', 1, 'admin', '2026-01-12'),
(36, 'Sandstone Repointing', 'SR', '', '{"type":"length","value":"mm","dimensions":["length"]}', 'm', '{"from":{"type":"length","value":"mm","dimensions":["length"]},"to":"m"}', 'green', 'active', 1, 'admin', '2026-01-12'),
(37, 'Broken Glass', 'BG', '', '{"type":"each","value":"each","dimensions":["each"]}', 'each', NULL, 'green', 'active', 1, 'admin', '2026-01-12');

-- Set the sequence to continue from 38
SELECT setval('repair_types_id_seq', 37, true);

-- RLS: All authenticated users can view repair types, only admins can modify
ALTER TABLE repair_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_repair_types ON repair_types
  FOR SELECT
  USING (true);

CREATE POLICY admin_modify_repair_types ON repair_types
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = repair_types.created_by_user_id
      AND users.role = 'admin'
    )
  );
