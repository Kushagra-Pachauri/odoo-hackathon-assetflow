/**
 * <Tag /> — Displays an asset tag (e.g. AF-0114) with a punched-hole detail.
 * font-mono, 1px border-line, rounded 4px, with a 4px circular "punched hole"
 * in the top-right corner.
 */
export default function Tag({ children, className = "" }) {
  return (
    <span
      className={`relative inline-block font-mono text-xs px-2 py-0.5 border border-line rounded-[4px] text-ink bg-white ${className}`}
    >
      {children}
      {/* Punched hole */}
      <span
        aria-hidden="true"
        className="absolute -top-[2px] -right-[2px] w-[4px] h-[4px] rounded-full bg-paper border border-line"
      />
    </span>
  );
}
