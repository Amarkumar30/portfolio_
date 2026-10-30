import Link from "next/link";
import { AdminBar } from "@/components/admin/admin-bar";
import { EntryActions } from "@/components/admin/entry-actions";
import { requireAdminPage } from "@/lib/admin/auth";
import { listEntries, type AdminEntrySummary } from "@/lib/admin/content-service";
import { StorageNotConfiguredError, getStorage } from "@/lib/admin/storage";
import { sectionList, sectionSchemas } from "@/lib/content/sections";

export const metadata = { title: "Content" };

export default async function AdminDashboardPage() {
  await requireAdminPage();

  let entries: AdminEntrySummary[] = [];
  let storageKind: "github" | "local" | null = null;
  let error = "";

  try {
    storageKind = getStorage().kind;
    entries = await listEntries();
  } catch (caught) {
    console.error("[admin] listing failed", caught);
    error =
      caught instanceof StorageNotConfiguredError
        ? caught.message
        : "Couldn't load content from GitHub. Check GITHUB_TOKEN and the server logs.";
  }

  return (
    <>
      <AdminBar title="Content" storage={storageKind} />
      {error ? (
        <p role="alert" className="card mb-8 p-5 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <div className="space-y-12">
        {sectionList.map((section) => {
          const rows = entries.filter((entry) => entry.section === section.id);

          return (
            <section key={section.id} aria-labelledby={`section-${section.id}`} className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <h2 id={`section-${section.id}`} className="text-lg font-semibold">
                  {section.label}
                  <span className="ml-2 text-sm font-normal text-muted">{rows.length}</span>
                </h2>
                <Link
                  href={
                    section.kind === "single"
                      ? `/admin/edit/${section.id}/${section.id}`
                      : `/admin/new?section=${section.id}`
                  }
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  {section.kind === "single" ? "Edit" : `New ${section.singular.toLowerCase()}`}
                </Link>
              </div>
              {rows.length === 0 ? (
                <p className="text-sm text-muted">Nothing yet.</p>
              ) : (
                <ul className="divide-y rounded-xl border">
                  {rows.map((entry) => (
                    <li
                      key={entry.slug}
                      className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate font-medium">
                          {section.kind === "single" ? section.label : entry.title}
                          {entry.draft ? (
                            <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-xs font-semibold text-accent">
                              Draft
                            </span>
                          ) : null}
                          {!entry.valid ? (
                            <span className="ml-2 rounded bg-red-500/10 px-1.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
                              Invalid — hidden on site
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-muted">
                          {entry.date || "No date"} ·{" "}
                          <a href={entry.url} className="hover:text-accent hover:underline">
                            {entry.url}
                          </a>
                        </p>
                      </div>
                      <EntryActions
                        section={entry.section}
                        slug={entry.slug}
                        title={entry.title}
                        draft={entry.draft}
                        canDraft={"draft" in sectionSchemas[section.id].shape}
                        canDelete={section.kind === "collection"}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
