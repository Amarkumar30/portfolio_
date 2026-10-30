import { AdminBar } from "@/components/admin/admin-bar";
import { Editor } from "@/components/admin/editor";
import { requireAdminPage } from "@/lib/admin/auth";
import { listEntries } from "@/lib/admin/content-service";
import { StorageNotConfiguredError, getStorage } from "@/lib/admin/storage";
import { isSectionId, type SectionId } from "@/lib/content/sections";

export const metadata = { title: "New" };

interface NewPageProps {
  searchParams: Promise<{ section?: string }>;
}

export default async function AdminNewPage({ searchParams }: NewPageProps) {
  await requireAdminPage();

  const { section } = await searchParams;
  const initialSection: SectionId = section && isSectionId(section) ? section : "notes";

  let storage: "github" | "local" | null = null;
  const existingSlugs: Partial<Record<SectionId, string[]>> = {};
  let error = "";

  try {
    storage = getStorage().kind;
    for (const entry of await listEntries()) {
      (existingSlugs[entry.section] ??= []).push(entry.slug);
    }
  } catch (caught) {
    console.error("[admin] listing failed", caught);
    error =
      caught instanceof StorageNotConfiguredError
        ? caught.message
        : "Couldn't load existing content, so slug collisions can't be checked here (the server still checks).";
  }

  return (
    <>
      <AdminBar title="New" storage={storage} />
      {error ? (
        <p role="alert" className="mb-6 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
      <Editor
        mode="create"
        initialSection={initialSection}
        existingSlugs={existingSlugs}
        storage={storage}
      />
    </>
  );
}
