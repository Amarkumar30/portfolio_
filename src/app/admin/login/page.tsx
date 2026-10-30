import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { isAdminConfigured } from "@/lib/admin/auth";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session";

export const metadata = { title: "Log in" };

export default async function AdminLoginPage() {
  const cookieStore = await cookies();

  if (await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value)) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-10">
      <h1 className="font-heading text-2xl font-semibold">Admin</h1>
      {isAdminConfigured() ? (
        <LoginForm />
      ) : (
        <p className="text-sm leading-6 text-muted">
          Admin login isn&apos;t configured on this deployment. Set ADMIN_USERNAME,
          ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET — see SETUP_ADMIN.md.
        </p>
      )}
    </div>
  );
}
