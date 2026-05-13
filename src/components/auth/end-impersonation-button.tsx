"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function EndImpersonationButton() {
  const { update } = useSession();

  async function end() {
    await update({ endImpersonation: true });
    window.location.assign("/admin");
  }

  return (
    <Button type="button" size="sm" variant="secondary" className="gap-1.5 font-bold" onClick={() => void end()}>
      <LogOut className="size-4" aria-hidden />
      العودة للمشرف
    </Button>
  );
}
