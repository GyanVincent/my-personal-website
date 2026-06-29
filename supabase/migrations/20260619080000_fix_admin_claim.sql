-- Fix admin claim flow by allowing authenticated users to evaluate has_role in RLS policies
-- and by permitting the first admin to be created when no admin exists.

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

CREATE POLICY "Allow first admin creation" ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT COUNT(*) FROM public.user_roles) = 0
  AND NEW.role = 'admin'::public.app_role
);
