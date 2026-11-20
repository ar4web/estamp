/** Small section heading used by the compact template galleries. */
export default function CompactHead({ title }) {
  return (
    <h3
      className="mb-1 flex items-baseline justify-between gap-1 border-b pb-0.5 text-[9px] font-semibold uppercase tracking-[0.08em]"
      style={{ color: "var(--text-dim)", borderColor: "var(--border-soft)" }}
    >
      <span className="truncate">{title}</span>
    </h3>
  );
}
