"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { useApiAuth } from "@/hooks/useApiAuth";

function ApiAuthSetup({ children }: { children: React.ReactNode }) {
  useApiAuth();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ApiAuthSetup>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#182135",
              color: "#F4F6F9",
              border: "1px solid rgba(255,255,255,0.08)",
            },
            success: {
              iconTheme: {
                primary: "#D4AF37",
                secondary: "#182135",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "#182135",
              },
            },
          }}
        />
      </ApiAuthSetup>
    </QueryClientProvider>
  );
}
