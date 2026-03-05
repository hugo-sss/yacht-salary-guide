-- Supabase Schema for Yacht Salary Guide
-- Run this in your Supabase SQL Editor

-- Create salary_benchmarks table
CREATE TABLE IF NOT EXISTS salary_benchmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  position text NOT NULL,
  yacht_size text NOT NULL,
  min_salary integer NOT NULL,
  max_salary integer NOT NULL,
  currency text DEFAULT 'EUR',
  source text NOT NULL,
  department text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_salary_position ON salary_benchmarks(position);
CREATE INDEX IF NOT EXISTS idx_salary_yacht_size ON salary_benchmarks(yacht_size);
CREATE INDEX IF NOT EXISTS idx_salary_source ON salary_benchmarks(source);
CREATE INDEX IF NOT EXISTS idx_salary_combo ON salary_benchmarks(position, yacht_size);

-- Enable Row Level Security
ALTER TABLE salary_benchmarks ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" 
  ON salary_benchmarks 
  FOR SELECT 
  USING (true);

-- Create policy for authenticated insert/update
CREATE POLICY "Allow authenticated insert" 
  ON salary_benchmarks 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Insert sample data (Flying Fish)
INSERT INTO salary_benchmarks (position, yacht_size, min_salary, max_salary, currency, source, department) VALUES
('Captain', '30-40m', 4000, 7000, 'EUR', 'Flying Fish Online', 'Deck'),
('Captain', '50-60m', 7000, 14000, 'EUR', 'Flying Fish Online', 'Deck'),
('Captain', '60-80m', 14000, 16000, 'EUR', 'Flying Fish Online', 'Deck'),
('Captain', '80-100m', 16000, 25000, 'EUR', 'Flying Fish Online', 'Deck'),
('Bosun', '30-40m', 3200, 4500, 'EUR', 'Flying Fish Online', 'Deck'),
('Bosun', '50-60m', 4000, 5000, 'EUR', 'Flying Fish Online', 'Deck'),
('Bosun', '60-80m', 5000, 8000, 'EUR', 'Flying Fish Online', 'Deck'),
('Deckhand', '30-40m', 2800, 3500, 'EUR', 'Flying Fish Online', 'Deck'),
('Deckhand', '50-60m', 2800, 4000, 'EUR', 'Flying Fish Online', 'Deck'),
('Deckhand', '60-80m', 3500, 4500, 'EUR', 'Flying Fish Online', 'Deck'),
('Deckhand', '80-100m', 4500, 6000, 'EUR', 'Flying Fish Online', 'Deck');

-- Insert sample data (Lighthouse Careers)
INSERT INTO salary_benchmarks (position, yacht_size, min_salary, max_salary, currency, source, department) VALUES
('Captain', '30-40m', 7500, 12000, 'EUR', 'Lighthouse Careers', 'Deck'),
('Captain', '40-50m', 9000, 14000, 'EUR', 'Lighthouse Careers', 'Deck'),
('Captain', '50-60m', 12000, 18000, 'EUR', 'Lighthouse Careers', 'Deck'),
('Captain', '60-80m', 14000, 20000, 'EUR', 'Lighthouse Careers', 'Deck'),
('Captain', '80-100m', 16000, 24000, 'EUR', 'Lighthouse Careers', 'Deck'),
('Captain', '100m+', 20000, 30000, 'EUR', 'Lighthouse Careers', 'Deck');

-- Add more sources as needed
