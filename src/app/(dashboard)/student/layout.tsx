import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function StudentSegmentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STUDENT") {
    redirect("/login/student");
  }
  return children;
}
