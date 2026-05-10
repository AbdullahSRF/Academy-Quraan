"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function SonnerToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster richColors position="top-center" theme={resolvedTheme === "dark" ? "dark" : "light"} dir="rtl" />;
}
