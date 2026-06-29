-- Add missing read column to contact_messages table
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS read boolean NOT NULL DEFAULT false;
