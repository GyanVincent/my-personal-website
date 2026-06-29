import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AdminRole } from "./rbac";

export function useAdminRoles() {
  const [roles, setRoles] = useState<AdminRole[] | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) { setUserId(null); setRoles([]); return; }
      setUserId(user.id);
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (cancelled) return;
      const list = ((data ?? []) as { role: string }[])
        .map((r) => r.role as AdminRole)
        .filter((r) => r === "admin" || r === "editor" || r === "moderator");
      setRoles(list);
    })();
    return () => { cancelled = true; };
  }, []);

  return { roles, userId, loading: roles === null };
}
