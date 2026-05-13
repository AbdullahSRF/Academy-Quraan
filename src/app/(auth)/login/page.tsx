import { redirect } from "next/navigation";

/** بوابة واحدة: المشرف فقط. */
export default function LoginHubPage() {
  redirect("/login/admin");
}
