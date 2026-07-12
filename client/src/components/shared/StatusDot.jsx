/**
 * <StatusDot /> — A 6px colored circle + uppercase font-mono label at 11px.
 * Replaces all colored badges/pills for status display.
 */

const STATUS_COLORS = {
  available: "#3F7D45",
  active: "#1E7F91",
  allocated: "#1E7F91",
  under_maintenance: "#B8720E",
  maintenance: "#B8720E",
  pending: "#B8720E",
  approved: "#1E7F91",
  resolved: "#3F7D45",
  requested: "#B8720E",
  upcoming: "#1E7F91",
  returned: "#8D97A6",
  past: "#8D97A6",
  cancelled: "#A8321F",
  overdue: "#A8321F",
  lost: "#A8321F",
  retired: "#8D97A6",
  disposed: "#8D97A6",
  reserved: "#B8720E",
};

export default function StatusDot({ status, label }) {
  const color = STATUS_COLORS[status] || "#8D97A6";
  const displayLabel = label || status?.replace(/_/g, " ");

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="w-[6px] h-[6px] rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span
        className="font-mono text-[11px] uppercase tracking-[0.03em] text-ink"
      >
        {displayLabel}
      </span>
    </span>
  );
}
