
-- Add additional columns to the tracks table
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS duration FLOAT,
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT;
