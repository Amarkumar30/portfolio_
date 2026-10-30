/**
 * Callout is a reusable MDX component for note-style content blocks inside blog posts.
 * Props: title and children content.
 * Used in: local MDX blog files through the shared mdxComponents map.
 * TODO: Add tone variants if you later want warning/success/info callouts.
 */
interface CalloutProps {
  title: string;
  children: React.ReactNode;
}

export function Callout({ title, children }: CalloutProps) {
  return (
    <aside className="rounded-3xl border bg-accent-soft p-5">
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <div className="mt-2 text-sm leading-7 text-muted">{children}</div>
    </aside>
  );
}
