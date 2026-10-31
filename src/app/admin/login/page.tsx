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
    <div className="flex min-h-[calc(100svh-var(--header-height)-14rem)] items-center justify-center py-8">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 text-h2 font-semibold">Log in</h1>
        </div>
        {isAdminConfigured() ? (
          <LoginForm />
        ) : (
          <div className="card p-6 text-small text-muted">
            <p className="font-medium text-foreground">Admin login isn&apos;t configured here.</p>
            <p className="mt-2">
              Set <code className="font-mono text-caption">ADMIN_USERNAME</code>,{" "}
              <code className="font-mono text-caption">ADMIN_PASSWORD_HASH</code> and{" "}
              <code className="font-mono text-caption">ADMIN_SESSION_SECRET</code> — see
              SETUP_ADMIN.md.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
