-- Add missing tables for admin dashboard

-- education table
CREATE TABLE public.education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution text NOT NULL,
  qualification text NOT NULL,
  start_date date,
  end_date date,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.education TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.education TO authenticated;
GRANT ALL ON public.education TO service_role;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Admin writes education" ON public.education FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER education_updated_at BEFORE UPDATE ON public.education FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- services table
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Sparkles',
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admin writes services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- cv_downloads table (for tracking CV downloads)
CREATE TABLE public.cv_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  downloaded_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text
);
GRANT INSERT ON public.cv_downloads TO anon, authenticated;
GRANT SELECT ON public.cv_downloads TO authenticated;
GRANT ALL ON public.cv_downloads TO service_role;
ALTER TABLE public.cv_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record download" ON public.cv_downloads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin reads downloads" ON public.cv_downloads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed sample services
INSERT INTO public.services (name, description, icon, slug, sort_order) VALUES
  ('AI Agent Development', 'Build intelligent AI agents with tool-calling, memory, and multi-step reasoning for your business.', 'Brain', 'ai-agent-development', 1),
  ('Full-Stack Web Apps', 'End-to-end web application development with modern frameworks and scalable architecture.', 'Code', 'full-stack-web-apps', 2),
  ('Mobile Development', 'Cross-platform mobile apps using Flutter for iOS and Android with native performance.', 'Smartphone', 'mobile-development', 3),
  ('Prompt Engineering', 'Optimize LLM prompts and build evaluation pipelines to improve AI output quality and reduce costs.', 'Sparkles', 'prompt-engineering', 4),
  ('API Development', 'Design and build robust REST and GraphQL APIs with proper authentication and documentation.', 'Zap', 'api-development', 5);

-- Seed sample education
INSERT INTO public.education (institution, qualification, start_date, end_date, description, sort_order) VALUES
  ('Kwame Nkrumah University of Science and Technology', 'BSc Computer Science', '2018-09-01', '2022-06-30', 'Focused on software engineering, machine learning, and distributed systems.', 1);
