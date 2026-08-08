export default function MetadataDisplay({ metadata }) {
  if (!metadata) return null;

  return (
    <div className="print:block hidden bg-[var(--bg-panel)] print:p-2 print:rounded-none print:border-b print:border-t border-[var(--border)]">
      <div className="grid grid-cols-4 gap-2 print:gap-2">
        <div>
          <p className="text-xs print:text-xs font-semibold text-[var(--text-secondary)] print:mb-0">
            Leveransmottagare
          </p>
          <p className="text-sm print:text-sm font-bold text-[var(--text)] print:m-0">
            {metadata.Leveransmottagare}
          </p>
        </div>
        <div>
          <p className="text-xs print:text-xs font-semibold text-[var(--text-secondary)] print:mb-0">
            Följesedelnr
          </p>
          <p className="text-sm print:text-sm font-bold text-[var(--text)] print:m-0">
            {metadata.Följesedelnr}
          </p>
        </div>
        <div>
          <p className="text-xs print:text-xs font-semibold text-[var(--text-secondary)] print:mb-0">
            Leveransdatum
          </p>
          <p className="text-sm print:text-sm font-bold text-[var(--text)] print:m-0">
            {metadata.Leveransdatum}
          </p>
        </div>
        <div>
          <p className="text-xs print:text-xs font-semibold text-[var(--text-secondary)] print:mb-0">
            Dokumentutskrift
          </p>
          <p className="text-sm print:text-sm font-bold text-[var(--text)] print:m-0">
            {metadata.Dokumentutskrift}
          </p>
        </div>
      </div>
    </div>
  );
}
