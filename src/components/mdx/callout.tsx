/**
 * Callout is a reusable MDX component for note-style content blocks inside posts.
 * Props: title and children content.
 * Used in: MDX content through the shared mdxComponents map.
 */
interface CalloutProps {
  title: string;
  children: React.ReactNode;
}

export function Callout({ title, children }: CalloutProps) {
  return (
    <aside className="rounded-card border bg-surface-muted p-5">
      <p className="font-semibold text-foreground">{title}</p>
      <div className="mt-1.5 text-small text-muted">{children}</div>
    </aside>
  );
}
