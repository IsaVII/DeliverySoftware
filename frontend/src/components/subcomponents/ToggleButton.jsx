// Replaces the repeated inline-style + onMouseEnter/onMouseLeave pattern
// that was previously copy-pasted for every filter and sort button.
export default function ToggleButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors text-[var(--btn-filter-text)] ${
        active
          ? "bg-[var(--btn-filter-active)] hover:bg-[var(--btn-filter-active-hover)]"
          : "bg-[var(--btn-filter-inactive)] hover:bg-[var(--btn-filter-inactive-hover)]"
      }`}
    >
      {children}
    </button>
  );
}
