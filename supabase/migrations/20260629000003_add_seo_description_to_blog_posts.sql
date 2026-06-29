-- Add missing seo_description column to blog_posts table
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_description text;
