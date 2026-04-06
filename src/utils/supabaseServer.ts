import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Build a Supabase server client from an incoming request's cookies.
 * Shared across all API routes that need authenticated access.
 */
export function buildSupabaseClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );
}

/**
 * Extract the Google OAuth provider_token from the Supabase session.
 * Returns the access token string, or null if unavailable.
 */
export async function getProviderToken(
  request: NextRequest
): Promise<string | null> {
  const supabase = buildSupabaseClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.provider_token ?? null;
}

/**
 * Refresh an expired Google access token using the refresh token.
 * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars.
 */
export async function refreshGoogleToken(
  refreshToken: string
): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token ?? null;
  } catch {
    return null;
  }
}
