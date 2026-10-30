import { notFound } from "next/navigation";
import { AdminBar } from "@/components/admin/admin-bar";
import { Editor } from "@/components/admin/editor";
import { requireAdminPage } from "@/lib/admin/auth";
import { ContentError, readEntry } from "@/lib/admin/content-service";
import { getStorage } from "@/lib/admin/storage";
import { isSectionId, sections } from "@/lib/content/sections";

export const metadata = { title: "Edit" };

interface EditPageProps {
  params: Promise<{ section: string; slug: string }>;
}

export default async function AdminEditPage({ params }: EditPageProps) {
  await requireAdminPage();

  const { section, slug } = await params;

  if (!isSectionId(section)) {
    notFound();
  }

  let entry: Awaited<ReturnType<typeof readEntry>>;
  try {
    entry = await readEntry(section, slug);
  } catch (error) {
    if (error instanceof ContentError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <AdminBar title={`Edit ${sections[section].singular.toLowerCase()}`} storage={getStorage().kind} />
      <Editor
        key={`${section}/${slug}`}
        mode="update"
        initialSection={section}
        initialSlug={slug}
        initialData={entry.data}
        initialBody={entry.body}
        existingSlugs={{}}
        storage={getStorage().kind}
      />
    </>
  );
}
