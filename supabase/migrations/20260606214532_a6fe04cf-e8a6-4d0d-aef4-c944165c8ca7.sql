
-- enums
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- user_roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins see all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- profiles (single-owner site profile)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL DEFAULT 'Vincent Gyan',
  headline text NOT NULL DEFAULT 'AI Engineer & Full-Stack Developer',
  bio text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT 'Sunyani, Ghana',
  avatar_url text,
  cv_url text,
  email text NOT NULL DEFAULT 'gyanvincent111222@gmail.com',
  whatsapp text NOT NULL DEFAULT '+233530335103',
  github_url text NOT NULL DEFAULT '#',
  linkedin_url text NOT NULL DEFAULT '#',
  twitter_url text NOT NULL DEFAULT '#',
  is_primary boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Admin writes profiles" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- skills
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  level int NOT NULL DEFAULT 80 CHECK (level BETWEEN 0 AND 100),
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admin writes skills" ON public.skills FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  tech text[] NOT NULL DEFAULT '{}',
  image_url text,
  repo_url text,
  live_url text,
  featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admin writes projects" ON public.projects FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- certificates
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issuer text NOT NULL,
  issued_at date,
  file_url text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.certificates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Admin writes certificates" ON public.certificates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- testimonials
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  position text NOT NULL DEFAULT '',
  review text NOT NULL,
  avatar_url text,
  approved boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads approved testimonials" ON public.testimonials FOR SELECT USING (approved = true);
CREATE POLICY "Admin reads all testimonials" ON public.testimonials FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin writes testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- blog_posts
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_url text,
  category text NOT NULL DEFAULT 'Artificial Intelligence',
  tags text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads published posts" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admin reads all posts" ON public.blog_posts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin writes posts" ON public.blog_posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- contact_messages
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  service text,
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact" ON public.contact_messages FOR INSERT WITH CHECK (
  char_length(name) BETWEEN 1 AND 120 AND
  char_length(email) BETWEEN 3 AND 255 AND
  char_length(subject) BETWEEN 1 AND 200 AND
  char_length(message) BETWEEN 1 AND 4000
);
CREATE POLICY "Admin reads contact" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin updates contact" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin deletes contact" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- seed primary profile
INSERT INTO public.profiles (full_name, headline, bio, location)
VALUES (
  'Vincent Gyan',
  'AI Engineer • Full-Stack & Mobile Developer • Prompt Engineer',
  'I build intelligent software — AI agents, web platforms, and mobile apps that solve real problems. Based in Sunyani, Ghana, I help startups and teams ship AI-powered products end-to-end.',
  'Sunyani, Ghana'
);

-- seed sample skills
INSERT INTO public.skills (name, category, level, sort_order) VALUES
  ('Python', 'AI & ML', 92, 1),
  ('TypeScript / React', 'Frontend', 90, 2),
  ('Flutter / Dart', 'Mobile', 88, 3),
  ('Supabase / Postgres', 'Backend', 86, 4),
  ('Node.js / Edge Functions', 'Backend', 85, 5),
  ('LangChain / AI Agents', 'AI & ML', 88, 6),
  ('Prompt Engineering', 'AI & ML', 94, 7),
  ('REST & GraphQL APIs', 'Backend', 84, 8),
  ('Tailwind CSS', 'Frontend', 92, 9),
  ('Git & CI/CD', 'DevOps', 80, 10);

-- seed sample testimonials
INSERT INTO public.testimonials (client_name, position, review, sort_order) VALUES
  ('Ama Boateng', 'CTO, Kente Labs', 'Vincent shipped our AI customer agent in two weeks. Response quality jumped immediately and our support load dropped by 40%.', 1),
  ('Daniel Okeke', 'Founder, Sahel Logistics', 'Top-tier Flutter engineer. Clean architecture, thoughtful UX, and he documents everything. Hire him before someone else does.', 2),
  ('Sarah Mensah', 'Product Lead, FinNova', 'Vincent built our prompt-engineering pipeline from scratch. Our LLM costs dropped 60% and outputs are sharper than ever.', 3),
  ('James Carter', 'CEO, BrightPath AI', 'A rare engineer who is equally strong on AI strategy and shipping production code. Deep, calm, and reliable.', 4);

-- seed sample projects
INSERT INTO public.projects (title, slug, description, tech, featured, sort_order, live_url, repo_url) VALUES
  ('Ask Vincent AI', 'ask-vincent-ai', 'An AI assistant that answers questions about my skills, projects and services in real time. Built with Groq + streaming UI.', ARRAY['React','Groq','TanStack Start','Tailwind'], true, 1, '#', '#'),
  ('Kente Labs Support Agent', 'kente-support-agent', 'Production support agent handling 80% of tier-1 tickets autonomously with tool-calling and ticket escalation.', ARRAY['Python','LangChain','Supabase','OpenAI'], true, 2, '#', '#'),
  ('Sahel Logistics Mobile', 'sahel-logistics-mobile', 'Cross-platform Flutter app for last-mile delivery dispatch, live tracking, and proof of delivery.', ARRAY['Flutter','Firebase','Maps'], true, 3, '#', '#'),
  ('FinNova Prompt Pipeline', 'finnova-prompt-pipeline', 'Prompt-engineering and eval harness reducing LLM spend by 60% while improving answer fidelity.', ARRAY['TypeScript','OpenAI','Evals'], false, 4, '#', '#');

-- seed sample blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, category, tags, published, published_at) VALUES
  ('Building production AI agents that actually ship', 'building-production-ai-agents',
   'Five lessons from shipping AI agents to real customers in 2026.',
   E'# Building production AI agents\n\nMost AI agents look magical in a demo and crumble in production. Here is what I have learned shipping agents to paying customers.\n\n## 1. Start with the workflow, not the model\n\nThe model is a commodity. The workflow is the moat.\n\n## 2. Treat tools as the API of your agent\n\nClean tool boundaries beat clever prompts every time.\n\n## 3. Evaluate, then evaluate again\n\nIf you cannot measure it, you cannot improve it.',
   'Artificial Intelligence', ARRAY['agents','LLM','production'], true, now()),
  ('Flutter in 2026: what changed and what still matters', 'flutter-in-2026',
   'A pragmatic snapshot of Flutter for teams shipping mobile apps this year.',
   E'# Flutter in 2026\n\nFlutter quietly became the safest cross-platform bet for product teams. Here is the state of play.',
   'Flutter Development', ARRAY['flutter','mobile'], true, now() - interval '3 days'),
  ('A practical guide to prompt engineering', 'practical-prompt-engineering',
   'Concrete patterns for writing prompts that survive contact with real users.',
   E'# Practical prompt engineering\n\nForget magic words. Use structure, examples, and evaluations.',
   'Prompt Engineering', ARRAY['prompts','LLM'], true, now() - interval '8 days'),
  ('Automating busywork with AI without losing trust', 'automating-busywork-with-ai',
   'Where AI automation actually delivers — and where it quietly burns money.',
   E'# AI automation that pays off\n\nThe wins are not where everyone is looking.',
   'AI Automation', ARRAY['automation','ops'], true, now() - interval '14 days');
