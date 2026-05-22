"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { setupApiAuth } from "@/lib/api";

/**
 * Wires Clerk's useAuth().getToken into the axios client.
 * getToken() returns a valid session JWT and refreshes it when expired.
 */
export function useApiAuth() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    setupApiAuth((options) =>
      getToken(options?.skipCache ? { skipCache: true } : undefined),
    );
  }, [getToken, isLoaded, isSignedIn]);
}
