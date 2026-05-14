import { auth } from "@/auth-session";
import { redirect } from "next/navigation";

export default async function AdminSegmentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/login/admin");
  }
  return children;
}
