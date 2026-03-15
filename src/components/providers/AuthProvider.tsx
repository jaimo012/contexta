"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import type { User } from "@supabase/supabase-js";

async function ensurePublicUserRow(user: User) {
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (data) return;

  await supabase.from("users").upsert(
    {
      id: user.id,
      email: user.email ?? "",
      display_name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        "",
    },
    { onConflict: "id" }
  );
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((s) => s.setUser);
  const setIsLoading = useAuthStore((s) => s.setIsLoading);
  const ensuredRef = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setUser(user);
      setIsLoading(false);

      if (user && !ensuredRef.current) {
        ensuredRef.current = true;
        ensurePublicUserRow(user).catch(() => {});
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setUser(user);

      if (user && !ensuredRef.current) {
        ensuredRef.current = true;
        ensurePublicUserRow(user).catch(() => {});
      }
      if (!user) {
        ensuredRef.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setIsLoading]);

  return <>{children}</>;
}
