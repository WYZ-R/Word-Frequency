/*
  # Create words table for word frequency tracking

  1. New Tables
    - `words`
      - `id` (uuid, primary key) - Unique identifier for each word record
      - `word` (text, unique, not null) - The actual word content, stored in lowercase
      - `frequency` (integer, default 1) - Number of times the word has been encountered
      - `created_at` (timestamptz, default now()) - When the word was first added

  2. Security
    - Enable RLS on `words` table
    - Add policy for anonymous users to read all words
    - Add policy for anonymous users to insert and update words

  3. Indexes
    - Unique index on word column for fast lookups
    - Index on frequency for sorting operations
*/

-- Create the words table
CREATE TABLE IF NOT EXISTS public.words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text UNIQUE NOT NULL,
  frequency integer DEFAULT 1 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (since the app doesn't use authentication)
CREATE POLICY "Allow anonymous users to read words"
  ON public.words
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous users to insert words"
  ON public.words
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to update words"
  ON public.words
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_words_frequency ON public.words (frequency DESC);
CREATE INDEX IF NOT EXISTS idx_words_created_at ON public.words (created_at DESC);