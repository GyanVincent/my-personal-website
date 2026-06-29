
-- Hide email and whatsapp on profiles from public/anonymous access.
DROP POLICY IF EXISTS "Anyone reads profiles" ON public.profiles;

-- Authenticated users only see profiles if they are admins.
CREATE POLICY "Admins read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Public/anonymous may still read profile rows, but only the safe columns
-- (enforced via column-level GRANTs below).
CREATE POLICY "Public reads safe profile columns"
ON public.profiles
FOR SELECT
TO anon
USING (true);

-- Lock down column access. Sensitive columns (email, whatsapp) are NOT granted to anon.
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (
  id, user_id, full_name, headline, bio, location,
  avatar_url, cv_url, github_url, linkedin_url, twitter_url,
  is_primary, created_at, updated_at
) ON public.profiles TO anon;
