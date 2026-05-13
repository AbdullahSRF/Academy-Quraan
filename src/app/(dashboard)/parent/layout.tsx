import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ParentSegmentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "PARENT") {
    redirect("/login/parent");
  }
  return children;
}
