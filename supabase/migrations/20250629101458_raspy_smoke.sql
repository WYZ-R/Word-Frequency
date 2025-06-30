/*
  # Add pronunciations column to words table

  1. Schema Changes
    - Add `pronunciations` column to `words` table
      - Type: `jsonb` to store array of pronunciation objects
      - Nullable: true (optional field)
      - Default: null

  2. Purpose
    - Support storing multiple pronunciation variants with audio URLs
    - Maintain backward compatibility with existing `pronunciation` text field
    - Enable rich pronunciation data including phonetic text and audio files

  3. Data Structure
    - Each pronunciation object contains:
      - `text`: phonetic pronunciation text (e.g., "/həˈloʊ/")
      - `audio`: optional URL to audio file
*/

-- Add pronunciations column to store array of pronunciation objects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'words' AND column_name = 'pronunciations'
  ) THEN
    ALTER TABLE words ADD COLUMN pronunciations jsonb;
  END IF;
END $$;