/**
 * SkillGroup renders one grouped skill category with concise chips for scannability.
 * Props: title, items, and optional note.
 * Used in: home skills snapshot and the about page skills section.
 * TODO: Split proficiency tiers further if you later want stronger skill signaling.
 */
interface SkillGroupProps {
  title: string;
  items: string[];
  note?: string;
}

export function SkillGroup({ title, items, note }: SkillGroupProps) {
  return (
    <article className="section-card p-5">
      <h3 className="font-heading text-xl font-semibold">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border bg-surface-strong px-3 py-1.5 text-sm text-muted"
          >
            {item}
          </span>
        ))}
      </div>
      {note ? <p className="mt-4 text-sm leading-7 text-muted">{note}</p> : null}
    </article>
  );
}
