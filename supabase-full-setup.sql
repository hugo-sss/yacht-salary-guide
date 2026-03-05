-- Complete Supabase Setup for Yacht Salary Guide
-- Run this entire file in your Supabase SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS salary_benchmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  position text NOT NULL,
  yacht_size text NOT NULL,
  min_salary integer NOT NULL,
  max_salary integer NOT NULL,
  currency text DEFAULT 'EUR',
  source text NOT NULL,
  department text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_salary_position ON salary_benchmarks(position);
CREATE INDEX IF NOT EXISTS idx_salary_yacht_size ON salary_benchmarks(yacht_size);
CREATE INDEX IF NOT EXISTS idx_salary_source ON salary_benchmarks(source);
CREATE INDEX IF NOT EXISTS idx_salary_combo ON salary_benchmarks(position, yacht_size);

-- Enable Row Level Security
ALTER TABLE salary_benchmarks ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Allow public read access" ON salary_benchmarks;
CREATE POLICY "Allow public read access" 
  ON salary_benchmarks 
  FOR SELECT 
  USING (true);

-- Insert all salary data
INSERT INTO salary_benchmarks (position, yacht_size, min_salary, max_salary, currency, source, department) VALUES
-- Flying Fish Online Data
('Captain', '30-40m', 4000, 7000, 'EUR', 'Flying Fish Online', 'Deck'),
('Captain', '50-60m', 7000, 14000, 'EUR', 'Flying Fish Online', 'Deck'),
('Captain', '60-80m', 14000, 16000, 'EUR', 'Flying Fish Online', 'Deck'),
('Captain', '80-100m', 16000, 25000, 'EUR', 'Flying Fish Online', 'Deck'),
('First Officer', '30-40m', 3000, 5000, 'EUR', 'Flying Fish Online', 'Deck'),
('First Officer', '50-60m', 4300, 5700, 'EUR', 'Flying Fish Online', 'Deck'),
('First Officer', '60-80m', 6000, 8000, 'EUR', 'Flying Fish Online', 'Deck'),
('First Officer', '80-100m', 7000, 10000, 'EUR', 'Flying Fish Online', 'Deck'),
('Bosun', '30-40m', 3200, 4500, 'EUR', 'Flying Fish Online', 'Deck'),
('Bosun', '50-60m', 4000, 5000, 'EUR', 'Flying Fish Online', 'Deck'),
('Bosun', '60-80m', 5000, 8000, 'EUR', 'Flying Fish Online', 'Deck'),
('Deckhand', '30-40m', 2800, 3500, 'EUR', 'Flying Fish Online', 'Deck'),
('Deckhand', '50-60m', 2800, 4000, 'EUR', 'Flying Fish Online', 'Deck'),
('Deckhand', '60-80m', 3500, 4500, 'EUR', 'Flying Fish Online', 'Deck'),
('Deckhand', '80-100m', 4500, 6000, 'EUR', 'Flying Fish Online', 'Deck'),
('Junior Deckhand', '30-40m', 2000, 3000, 'EUR', 'Flying Fish Online', 'Deck'),
('Junior Deckhand', '40-50m', 2000, 3000, 'EUR', 'Flying Fish Online', 'Deck'),
('Chief Stewardess', '30-40m', 3000, 4500, 'EUR', 'Flying Fish Online', 'Interior'),
('Chief Stewardess', '50-60m', 4000, 6000, 'EUR', 'Flying Fish Online', 'Interior'),
('Chief Stewardess', '60-80m', 6000, 7000, 'EUR', 'Flying Fish Online', 'Interior'),
('Chief Stewardess', '80-100m', 7000, 12000, 'EUR', 'Flying Fish Online', 'Interior'),
('Stewardess', '30-40m', 2800, 3000, 'EUR', 'Flying Fish Online', 'Interior'),
('Stewardess', '50-60m', 2800, 3500, 'EUR', 'Flying Fish Online', 'Interior'),
('Stewardess', '60-80m', 3500, 4500, 'EUR', 'Flying Fish Online', 'Interior'),
('Stewardess', '80-100m', 4500, 6000, 'EUR', 'Flying Fish Online', 'Interior'),
('Junior Stewardess', '30-40m', 2000, 3000, 'EUR', 'Flying Fish Online', 'Interior'),
('Junior Stewardess', '40-50m', 3000, 3500, 'EUR', 'Flying Fish Online', 'Interior'),
('Head Chef', '30-40m', 3000, 4500, 'EUR', 'Flying Fish Online', 'Culinary'),
('Head Chef', '50-60m', 4000, 7000, 'EUR', 'Flying Fish Online', 'Culinary'),
('Head Chef', '60-80m', 6000, 7500, 'EUR', 'Flying Fish Online', 'Culinary'),
('Head Chef', '80-100m', 7500, 14000, 'EUR', 'Flying Fish Online', 'Culinary'),

-- Lighthouse Careers Data
('Captain', '30-40m', 7500, 12000, 'EUR', 'Lighthouse Careers', 'Deck'),
('Captain', '40-50m', 9000, 14000, 'EUR', 'Lighthouse Careers', 'Deck'),
('Captain', '50-60m', 12000, 18000, 'EUR', 'Lighthouse Careers', 'Deck'),
('Captain', '60-80m', 14000, 20000, 'EUR', 'Lighthouse Careers', 'Deck'),
('Captain', '80-100m', 16000, 24000, 'EUR', 'Lighthouse Careers', 'Deck'),
('Captain', '100m+', 20000, 30000, 'EUR', 'Lighthouse Careers', 'Deck'),
('Chief Officer / First Mate', '30-40m', 4200, 6500, 'EUR', 'Lighthouse Careers', 'Deck'),
('Chief Officer / First Mate', '40-50m', 5000, 7500, 'EUR', 'Lighthouse Careers', 'Deck'),
('Chief Officer / First Mate', '50-60m', 6000, 9000, 'EUR', 'Lighthouse Careers', 'Deck'),
('Chief Officer / First Mate', '60-80m', 7000, 10000, 'EUR', 'Lighthouse Careers', 'Deck'),
('Chief Officer / First Mate', '80-100m', 8000, 12000, 'EUR', 'Lighthouse Careers', 'Deck'),
('Chief Officer / First Mate', '100m+', 10000, 14000, 'EUR', 'Lighthouse Careers', 'Deck'),
('Chief Engineer', '30-40m', 5500, 8000, 'EUR', 'Lighthouse Careers', 'Engineering'),
('Chief Engineer', '40-50m', 6000, 9500, 'EUR', 'Lighthouse Careers', 'Engineering'),
('Chief Engineer', '50-70m', 7000, 11000, 'EUR', 'Lighthouse Careers', 'Engineering'),
('Chief Engineer', '70-80m', 8000, 12000, 'EUR', 'Lighthouse Careers', 'Engineering'),
('Chief Engineer', '80-100m', 9000, 14000, 'EUR', 'Lighthouse Careers', 'Engineering'),
('Chief Engineer', '100m+', 10000, 16000, 'EUR', 'Lighthouse Careers', 'Engineering'),
('Chief Stewardess', '30-40m', 3800, 5500, 'EUR', 'Lighthouse Careers', 'Interior'),
('Chief Stewardess', '40-50m', 4500, 6500, 'EUR', 'Lighthouse Careers', 'Interior'),
('Chief Stewardess', '50-70m', 5500, 8000, 'EUR', 'Lighthouse Careers', 'Interior'),
('Chief Stewardess', '70-80m', 6500, 9500, 'EUR', 'Lighthouse Careers', 'Interior'),
('Chief Stewardess', '80-100m', 7000, 10500, 'EUR', 'Lighthouse Careers', 'Interior'),
('Chief Stewardess', '100m+', 8000, 12000, 'EUR', 'Lighthouse Careers', 'Interior'),
('Head Chef', '30-40m', 4500, 6500, 'EUR', 'Lighthouse Careers', 'Culinary'),
('Head Chef', '40-50m', 6000, 7500, 'EUR', 'Lighthouse Careers', 'Culinary'),
('Head Chef', '50-70m', 7500, 10000, 'EUR', 'Lighthouse Careers', 'Culinary'),
('Head Chef', '70-80m', 8500, 11500, 'EUR', 'Lighthouse Careers', 'Culinary'),
('Head Chef', '80-100m', 9000, 12000, 'EUR', 'Lighthouse Careers', 'Culinary'),
('Head Chef', '100m+', 10000, 14000, 'EUR', 'Lighthouse Careers', 'Culinary');

-- Verify data was inserted
SELECT COUNT(*) as total_records FROM salary_benchmarks;
SELECT DISTINCT source FROM salary_benchmarks;
SELECT DISTINCT position FROM salary_benchmarks ORDER BY position;
