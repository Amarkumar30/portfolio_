import { AdminBar } from "@/components/admin/admin-bar";
import { ContentTable, type SectionMeta } from "@/components/admin/content-table";
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

  const sectionsMeta: SectionMeta[] = sectionList.map((section) => ({
    id: section.id,
    label: section.label,
    singular: section.singular,
    kind: section.kind,
    canDraft: "draft" in sectionSchemas[section.id].shape,
  }));

  return (
    <>
      <AdminBar title="Content" storage={storageKind} />
      {error ? (
        <p role="alert" className="card mb-8 border-danger/40 p-5 text-small text-danger">
          {error}
        </p>
      ) : null}
      <ContentTable entries={entries} sections={sectionsMeta} />
    </>
  );
}
