-- Add missing category column to certificates table
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS category text;
