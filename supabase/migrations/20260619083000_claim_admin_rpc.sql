-- Create a safe RPC for claiming the first admin role.
-- This avoids direct user_roles INSERT from the client and protects the claim flow.

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
