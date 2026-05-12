"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { SonnerToaster } from "@/components/ui/sonner-toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider basePath="/api/auth">
        {children}
        <SonnerToaster />
      </SessionProvider>
    </ThemeProvider>
  );
}
