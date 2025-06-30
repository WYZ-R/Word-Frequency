/*
  # Add pronunciation and examples to words table

  1. New Columns
    - `pronunciation` (text, nullable) - Phonetic pronunciation of the word
    - `examples` (jsonb, nullable) - Array of example sentences
    - `definitions` (jsonb, nullable) - Array of definitions with parts of speech
    - `last_fetched_at` (timestamptz, nullable) - When the word details were last fetched from API

  2. Changes
    - Add new columns to existing words table
    - These fields will be populated when user clicks on a word for details
    - Using JSONB for flexible storage of arrays and objects

  3. Notes
    - All new fields are nullable since existing words won't have this data initially
    - We'll populate these fields on-demand when users request word details
*/

-- Add pronunciation field for phonetic transcription
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'words' AND column_name = 'pronunciation'
  ) THEN
    ALTER TABLE public.words ADD COLUMN pronunciation text;
  END IF;
END $$;

-- Add examples field for storing example sentences as JSON array
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'words' AND column_name = 'examples'
  ) THEN
    ALTER TABLE public.words ADD COLUMN examples jsonb;
  END IF;
END $$;

-- Add definitions field for storing word definitions with parts of speech
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'words' AND column_name = 'definitions'
  ) THEN
    ALTER TABLE public.words ADD COLUMN definitions jsonb;
  END IF;
END $$;

-- Add timestamp for tracking when word details were last fetched
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'words' AND column_name = 'last_fetched_at'
  ) THEN
    ALTER TABLE public.words ADD COLUMN last_fetched_at timestamptz;
  END IF;
END $$;

-- Create index on last_fetched_at for efficient queries
CREATE INDEX IF NOT EXISTS idx_words_last_fetched_at ON public.words (last_fetched_at);