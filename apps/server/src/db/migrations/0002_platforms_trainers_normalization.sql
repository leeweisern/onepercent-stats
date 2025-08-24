-- Create platforms table
CREATE TABLE IF NOT EXISTS platforms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL COLLATE NOCASE,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on platform name (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_platforms_name_unique ON platforms(name COLLATE NOCASE);

-- Create trainers table
CREATE TABLE IF NOT EXISTS trainers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handle TEXT NOT NULL COLLATE NOCASE,
  name TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on trainer handle (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_trainers_handle_unique ON trainers(handle COLLATE NOCASE);

-- Add foreign key columns to leads table
ALTER TABLE leads ADD COLUMN platform_id INTEGER REFERENCES platforms(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN trainer_id INTEGER REFERENCES trainers(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Create indexes on foreign key columns
CREATE INDEX IF NOT EXISTS idx_leads_platform_id ON leads(platform_id);
CREATE INDEX IF NOT EXISTS idx_leads_trainer_id ON leads(trainer_id);

-- Backfill platforms table from existing leads data
INSERT INTO platforms (name)
SELECT DISTINCT TRIM(platform) 
FROM leads 
WHERE platform IS NOT NULL 
  AND TRIM(platform) != ''
  AND NOT EXISTS (
    SELECT 1 FROM platforms p 
    WHERE LOWER(p.name) = LOWER(TRIM(leads.platform))
  );

-- Backfill trainers table from existing leads data
INSERT INTO trainers (handle)
SELECT DISTINCT TRIM(trainer_handle)
FROM leads
WHERE trainer_handle IS NOT NULL
  AND TRIM(trainer_handle) != ''
  AND NOT EXISTS (
    SELECT 1 FROM trainers t
    WHERE LOWER(t.handle) = LOWER(TRIM(leads.trainer_handle))
  );

-- Backfill platform_id in leads table
UPDATE leads
SET platform_id = (
  SELECT id FROM platforms p
  WHERE LOWER(p.name) = LOWER(TRIM(leads.platform))
)
WHERE platform IS NOT NULL
  AND TRIM(platform) != ''
  AND platform_id IS NULL;

-- Backfill trainer_id in leads table
UPDATE leads
SET trainer_id = (
  SELECT id FROM trainers t
  WHERE LOWER(t.handle) = LOWER(TRIM(leads.trainer_handle))
)
WHERE trainer_handle IS NOT NULL
  AND TRIM(trainer_handle) != ''
  AND trainer_id IS NULL;

-- Create trigger to sync platform name when platform is renamed
CREATE TRIGGER IF NOT EXISTS sync_platform_name_on_update
AFTER UPDATE OF name ON platforms
FOR EACH ROW
BEGIN
  UPDATE leads
  SET platform = NEW.name
  WHERE platform_id = NEW.id;
END;

-- Create trigger to sync trainer handle when trainer handle is renamed
CREATE TRIGGER IF NOT EXISTS sync_trainer_handle_on_update
AFTER UPDATE OF handle ON trainers
FOR EACH ROW
BEGIN
  UPDATE leads
  SET trainer_handle = NEW.handle
  WHERE trainer_id = NEW.id;
END;

-- Create trigger to sync platform text when platform_id is updated
CREATE TRIGGER IF NOT EXISTS sync_platform_text_on_id_update
AFTER UPDATE OF platform_id ON leads
FOR EACH ROW
WHEN NEW.platform_id IS NOT NULL
BEGIN
  UPDATE leads
  SET platform = (SELECT name FROM platforms WHERE id = NEW.platform_id)
  WHERE id = NEW.id;
END;

-- Create trigger to sync trainer handle text when trainer_id is updated
CREATE TRIGGER IF NOT EXISTS sync_trainer_text_on_id_update
AFTER UPDATE OF trainer_id ON leads
FOR EACH ROW
WHEN NEW.trainer_id IS NOT NULL
BEGIN
  UPDATE leads
  SET trainer_handle = (SELECT handle FROM trainers WHERE id = NEW.trainer_id)
  WHERE id = NEW.id;
END;

-- Create trigger to clear platform text when platform_id is set to NULL
CREATE TRIGGER IF NOT EXISTS clear_platform_text_on_null
AFTER UPDATE OF platform_id ON leads
FOR EACH ROW
WHEN NEW.platform_id IS NULL AND OLD.platform_id IS NOT NULL
BEGIN
  UPDATE leads
  SET platform = NULL
  WHERE id = NEW.id;
END;

-- Create trigger to clear trainer handle text when trainer_id is set to NULL
CREATE TRIGGER IF NOT EXISTS clear_trainer_text_on_null
AFTER UPDATE OF trainer_id ON leads
FOR EACH ROW
WHEN NEW.trainer_id IS NULL AND OLD.trainer_id IS NOT NULL
BEGIN
  UPDATE leads
  SET trainer_handle = NULL
  WHERE id = NEW.id;
END;