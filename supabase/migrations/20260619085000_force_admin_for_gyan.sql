-- Fix user_roles access and grant admin to gyanvincent111222@gmail.com if that auth user exists.
-- Run this migration in Supabase to repair RLS policies and create the claim RPC.

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  admin_count int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COUNT(*) INTO admin_count FROM public.user_roles;
  IF admin_count > 0 THEN
    RAISE EXCEPTION 'Admin already exists';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid()::uuid, 'admin'::public.app_role);
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins see all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;

CREATE POLICY "Users see own roles" ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid()::uuid = user_id);

CREATE POLICY "Admins see all roles" ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid()::uuid, 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid()::uuid, 'admin'))
WITH CHECK (public.has_role(auth.uid()::uuid, 'admin'));

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'gyanvincent111222@gmail.com'
ON CONFLICT DO NOTHING;
