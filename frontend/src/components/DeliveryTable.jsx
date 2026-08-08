import TableHeader from "./subcomponents/TableHeader.jsx";
import H2 from "./subcomponents/H2.jsx";
import Button from "./subcomponents/Button.jsx";

import { useDeliveries } from "../js/hooks/useDeliveries";
import { COLUMNS } from "./subcomponents/Columns.jsx";
import {
  STATUS_FILTERS_CONFIG,
  getStatusCounts,
  getPfandCount,
  getBarcodeCounts,
} from "../js/utils/deliveryStatus";
import { SORT_MODES_CONFIG } from "../js/utils/sorting";
import DeliveryRow from "./subcomponents/DeliveryRow.jsx";
import ToggleButton from "./subcomponents/ToggleButton.jsx";

function getVisibleColumns({
  isPrintMode,
  minimizedColumns,
  showCommentColumn,
}) {
  return COLUMNS.filter((col) => {
    // Hide comment column if toggle is off
    if (col.key === "comment" && !showCommentColumn) return false;

    // Always show "always" columns (except comment, handled above)
    if (col.showWhen === "always") return true;

    // In print mode with minimized columns: show separate artikelnr/streckkod instead of combined
    if (isPrintMode && minimizedColumns) {
      // Hide the combined artikelnr_streckkod column
      if (col.key === "artikelnr_streckkod") return false;
      // Show separate artikelnr and streckkod columns
      if (col.key === "artikelnr" || col.key === "streckkod") return true;
      // Hide all other full columns in print mode
      return false;
    }

    // Normal logic for non-print mode or when columns are not minimized
    return minimizedColumns
      ? col.showWhen === "minimized"
      : col.showWhen === "full";
  });
}

// ---------------------------------------------------------------------------
// Main component — pure rendering. All state, data fetching, and business
// logic live in useDeliveries(); this component just wires it to JSX.
// ---------------------------------------------------------------------------
export default function DeliveryTable({
  showNotDeliveredTable,
  setShowNotDeliveredTable,
}) {
  const d = useDeliveries();

  if (d.loading) {
    return (
      <section className="bg-[var(--bg-panel)] p-6 rounded-lg border border-gray-300">
        <H2>
          Leveranser{" "}
          {d.currentFilename && (
            <span className="text-sm font-normal text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis inline-block max-w-xs md:max-w-none">
              ({d.currentFilename})
            </span>
          )}
        </H2>
        <p className="text-gray-500">Läser in...</p>
      </section>
    );
  }

  const filteredArticles = d.filteredArticles;
  const statusCounts = getStatusCounts(d.articles, !d.showPfand);
  const pfandCount = getPfandCount(d.articles);
  const barcodeCounts = getBarcodeCounts(d.articles);
  const visibleColumns = getVisibleColumns({
    isPrintMode: d.isPrintMode,
    minimizedColumns: d.minimizedColumns,
    showCommentColumn: d.showCommentColumn,
  });

  // Parse the delivery date from metadata (format: "2026.07.14")
  // Note: metadata is nested, so we access metadata.metadata or metadata directly depending on structure
  let deliveryDate = null;
  const metadataObj = d.metadata?.metadata || d.metadata;
  if (metadataObj?.Leveransdatum) {
    deliveryDate = metadataObj.Leveransdatum;
  }

  return (
    <section className="bg-[var(--bg-panel)]  p-2 rounded-lg border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <H2>
          Leveranser{" "}
          {d.currentFilename && (
            <span className="text-sm font-normal text-[var(--text-muted)] whitespace-nowrap overflow-hidden text-ellipsis inline-block max-w-xs md:max-w-none">
              ({d.currentFilename})
            </span>
          )}
        </H2>
        <button
          onClick={() => d.setIsTableMinimized(!d.isTableMinimized)}
          title={d.isTableMinimized ? "Expandera" : "Minimera"}
          className="px-3 py-1 rounded-md text-sm font-medium transition-colors text-[var(--btn-filter-text)] bg-[var(--btn-filter-inactive)] hover:bg-[var(--btn-filter-inactive-hover)] flex items-center gap-2"
        >
          <span className="text-lg">{d.isTableMinimized ? "➕" : "➖"}</span>
        </button>
      </div>

      {!d.isTableMinimized && (
        <span className="text-sm text-[var(--text-muted)] mt-0 mb-2 block">
          {deliveryDate && !isNaN(deliveryDate) ? (
            <span>Leveransdatum: {deliveryDate.toLocaleDateString()}</span>
          ) : metadataObj?.Leveransdatum ? (
            <span>Leveransdatum: {metadataObj.Leveransdatum}</span>
          ) : null}
        </span>
      )}

      {/* Status Filter Buttons - only show when table is expanded */}
      {!d.isTableMinimized && !d.isPrintMode && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-[var(--text-muted)] self-center">
              Filtrera efter status:
            </span>
            {STATUS_FILTERS_CONFIG.map(({ key, label, colorVar }) => (
              <ToggleButton
                key={key}
                active={d.statusFilters[key]}
                onClick={() => d.toggleStatusFilter(key)}
              >
                {label}{" "}
                <span
                  style={{ color: `var(${colorVar})` }}
                  className="font-semibold ml-1 drop-shadow"
                >
                  ({statusCounts[key]})
                </span>
              </ToggleButton>
            ))}

            <ToggleButton
              active={d.showPfand}
              onClick={() => d.setShowPfand(!d.showPfand)}
            >
              {"Pant"} ({pfandCount})
            </ToggleButton>
            <ToggleButton active={true} onClick={d.toggleBarcodeFilter}>
              {d.barcodeFilter === "all"
                ? `Med & Utan streckkod (${barcodeCounts.total})`
                : d.barcodeFilter === "with-barcode"
                  ? `Med streckkod (${barcodeCounts.withBarcode})`
                  : `Utan streckkod (${barcodeCounts.withoutBarcode})`}
            </ToggleButton>
          </div>

          {/* Sort Buttons */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-[var(--text-muted)] self-center">
              Sortera efter beskrivning:
            </span>
            <ToggleButton active={d.sortMode === "none"} onClick={d.resetSort}>
              ✕ Ingen sortering
            </ToggleButton>
            {SORT_MODES_CONFIG.map(({ key, label }) => (
              <ToggleButton
                key={key}
                active={d.sortMode === key}
                onClick={() => d.toggleSortMode(key)}
              >
                {d.sortMode === key
                  ? `${d.sortDirection === "asc" ? "↑" : "↓"} ${label}`
                  : label}
              </ToggleButton>
            ))}
          </div>

          {/* Search fields */}
          <div className="mb-4 flex gap-4 flex-col md:flex-row">
            <div className="flex-1">
              <label className="text-sm font-medium text-[var(--text-muted)]">
                Sök efter beskrivning
              </label>
              <input
                type="text"
                placeholder="Sök artikelbeskrivning..."
                value={d.searchDescriptionInput}
                onChange={(e) => d.setSearchDescriptionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    d.searchByDescription(d.searchDescriptionInput);
                  }
                }}
                onBlur={() => d.searchByDescription(d.searchDescriptionInput)}
                enterKeyHint="go"
                inputMode="text"
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium text-[var(--text-muted)]">
                    Sök efter streckkod
                  </label>
                  <input
                    ref={d.barcodeInputRef}
                    type="text"
                    placeholder="Sök streckkod..."
                    value={d.searchBarcodeInput}
                    onChange={(e) => {
                      d.setSearchBarcodeInput(e.target.value);
                      d.setBarcodeSearchError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        d.searchByBarcode(d.searchBarcodeInput);
                      }
                    }}
                    onBlur={() => d.searchByBarcode(d.searchBarcodeInput)}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <button
                  onClick={() => d.setAutoFillEnabled(!d.autoFillEnabled)}
                  title={
                    d.autoFillEnabled
                      ? "Inaktivera autofyll"
                      : "Aktivera autofyll"
                  }
                  className={`px-4 py-2 rounded-md font-medium transition-colors text-[var(--btn-filter-text)] self-end ${
                    d.autoFillEnabled
                      ? "bg-[var(--btn-filter-active)] hover:bg-[var(--btn-filter-active-hover)]"
                      : "bg-[var(--btn-filter-inactive)] hover:bg-[var(--btn-filter-inactive-hover)]"
                  }`}
                >
                  {d.autoFillEnabled ? "🟠 Autofyll" : "⭕ Autofyll"}
                </button>
              </div>
              {d.barcodeSearchError && (
                <p className="text-red-500 text-sm mt-1">
                  {d.barcodeSearchError}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Show fetch/save errors inline instead of calling alert() during render */}
      {d.error && (
        <p className="text-red-500 mb-2" role="alert">
          Fel: {d.error}
        </p>
      )}

      {!d.isTableMinimized && d.articles.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              handleClick={d.toggleMinimizeColumns}
              title="Växla kolumnvy"
            >
              <span className="text-xl font-bold">
                {d.minimizedColumns ? "⊞ " : "⊟ "}
              </span>
              <span>{d.minimizedColumns ? "Visa alla" : "Minimera"}</span>
            </Button>
            <Button
              handleClick={() => d.setShowCommentColumn(!d.showCommentColumn)}
              title={d.showCommentColumn ? "Dölj kommentar" : "Visa kommentar"}
            >
              <span className="text-xl font-bold">
                {d.showCommentColumn ? "💬 " : "🚫 "}
              </span>
              <span>
                {d.showCommentColumn ? "Dölj kommentar" : "Visa kommentar"}
              </span>
            </Button>
            <Button
              handleClick={() => d.setIsPrintMode(!d.isPrintMode)}
              title={
                d.isPrintMode ? "Avsluta utskrift" : "Förhandsgranska utskrift"
              }
            >
              <span className="text-xl font-bold">
                {d.isPrintMode ? "✕ " : "🖨️ "}
              </span>
              <span>
                {d.isPrintMode ? "Avsluta utskrift" : "Utskriftsläge"}
              </span>
            </Button>
            {d.isPrintMode && (
              <>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  🖨️ Skriv ut
                </button>
                <button
                  onClick={() =>
                    setShowNotDeliveredTable(!showNotDeliveredTable)
                  }
                  className={`px-4 py-2 rounded-md transition-colors ${
                    showNotDeliveredTable
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-gray-400 text-white hover:bg-gray-500"
                  }`}
                >
                  {showNotDeliveredTable
                    ? "✓ Visa ej levererade"
                    : "👁️ Dölj ej levererade"}
                </button>
              </>
            )}
          </div>

          {d.isPrintMode && (
            <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-sm print:hidden">
              <p>
                <strong>Utskriftsläge aktiverat:</strong> Inmatningsfält är
                dolda. Klicka "Skriv ut" för att öppna utskriftsdialogen.
              </p>
            </div>
          )}
          <div className="mt-2 border border-gray-300 rounded-md overflow-hidden">
            {/* Fixed Header Table */}
            <table className="w-full text-sm" style={{ tableLayout: "auto" }}>
              <thead>
                <tr className="bg-[var(--table-header-bg)]">
                  {visibleColumns.map((col) => (
                    <TableHeader key={col.key} className={col.headerClassName}>
                      {col.header()}
                    </TableHeader>
                  ))}
                </tr>
              </thead>
            </table>

            {/* Scrollable Body Table */}
            <div
              style={{
                maxHeight: "600px",
                overflowY: "auto",
                overflowX: "auto",
              }}
              className="scroll-container"
            >
              <table className="w-full text-sm" style={{ tableLayout: "auto" }}>
                <tbody>
                  {filteredArticles.map((article, index) => {
                    const firstEntry =
                      index === 0 ||
                      filteredArticles[index - 1].leveransnr !==
                        article.leveransnr;
                    // In complete list sort mode, always show leveransnr
                    const showLeveransnr =
                      d.sortMode === "completeList" ? true : firstEntry;
                    // In complete list sort mode, treat as not firstEntry for border styling
                    const borderFirstEntry =
                      d.sortMode === "completeList" ? false : firstEntry;
                    const rowId = `${article.leveransnr}-${article.Rad}`;

                    return (
                      <DeliveryRow
                        key={rowId}
                        article={article}
                        columns={visibleColumns}
                        borderFirstEntry={borderFirstEntry}
                        showLeveransnr={showLeveransnr}
                        isSelected={d.selectedRowId === rowId}
                        rowRef={(el) => {
                          if (el) d.tableRowRefs.current[rowId] = el;
                        }}
                        saveBarcode={d.saveBarcode}
                        saveReceived={d.saveReceived}
                        saveComment={d.saveComment}
                        fillWithKFP={d.fillWithKFP}
                        clearSelection={d.clearSelection}
                        isPrintMode={d.isPrintMode}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {filteredArticles.length === 0 && (
            <p className="text-gray-500 mt-4">
              Inga artiklar matchar de valda filtren eller sökningen.
            </p>
          )}
        </>
      ) : !d.isTableMinimized ? (
        <p className="text-gray-500">Inga leveranser hittades</p>
      ) : null}
    </section>
  );
}
