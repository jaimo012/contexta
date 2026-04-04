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
    const syncSession = (session: { user: User | null } | null) => {
      const user = session?.user ?? null;
      setUser(user);
      setIsLoading(false);
      if (user && !ensuredRef.current) {
        ensuredRef.current = true;
        ensurePublicUserRow(user).catch(() => {});
      }
      if (!user) ensuredRef.current = false;
    };

    // Timeout to prevent indefinite loading if Supabase is unreachable
    const authTimeout = setTimeout(() => {
      setUser(null);
      setIsLoading(false);
    }, 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(authTimeout);
      syncSession(session);
    }).catch(() => {
      clearTimeout(authTimeout);
      setUser(null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session);
    });

    const handleStorage = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        syncSession(session);
      });
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, [setUser, setIsLoading]);

  return <>{children}</>;
}
