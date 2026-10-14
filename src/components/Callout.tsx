import type { Callout as CalloutData } from "../data/corridor";

export function Callout({ tone, stat, text }: CalloutData) {
  return (
    <aside className="callout" data-tone={tone}>
      <strong className="callout-stat">{stat}</strong>
      <p className="callout-text">{text}</p>
    </aside>
  );
}

export function CalloutList({ items }: { items: readonly CalloutData[] }) {
  if (!items.length) return null;
  return (
    <div className="callout-list">
      {items.map((c) => (
        <Callout key={`${c.stat}-${c.text}`} {...c} />
      ))}
    </div>
  );
}
