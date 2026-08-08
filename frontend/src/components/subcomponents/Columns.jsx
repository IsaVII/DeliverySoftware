import BarcodeInput from "./BarcodeInput.jsx";
import DeliveredField from "./DeliveredField.jsx";

// ---------------------------------------------------------------------------
// Column configuration
// ---------------------------------------------------------------------------
// Each entry describes one column exactly once. `showWhen` controls when it
// appears:
//   "always"    - shown in both full and minimized view
//   "full"      - only shown when NOT minimized
//   "minimized" - only shown when minimized (e.g. a column that combines
//                 two full-view columns into one, like Artikelnr+Streckkod)
// This replaces the ~10 repeated `minimizedColumns ? null : ...` branches
// that previously had to be kept in sync between the header and every row.
//
// `cell` receives (article, firstEntry, helpers) and returns the content for
// that column in a normal row.
export const COLUMNS = [
  {
    key: "leveransnr",
    showWhen: "always",
    header: () => (
      <>
        <span className="hidden md:inline">Delivery No.</span>
        <span className="inline md:hidden">
          Delivery
          <br />
          No.
        </span>
      </>
    ),
    headerClassName: "w-[85px] overflow-hidden",
    cellClassName: "w-[85px] overflow-hidden break-words",
    cell: (article, firstEntry, helpers) =>
      (helpers?.showLeveransnr ?? firstEntry) ? article.leveransnr : "",
  },
  {
    key: "rad",
    showWhen: "full",
    headerClassName: "w-[64px]",
    cellClassName: "w-[64px]",
    header: () => "Row",
    cell: (article) => article.Rad || "-",
  },
  {
    key: "artikelnr",
    showWhen: "full",
    headerClassName: "w-[110px]",
    cellClassName: "w-[110px]",
    header: () => "Article No.",
    cell: (article) => article.Artikelnr || "-",
  },
  {
    key: "streckkod",
    showWhen: "full",
    headerClassName: "w-[200px]",
    cellClassName: "w-[200px]",
    header: () => "Barcode",
    cell: (article, _firstEntry, { saveBarcode, isPrintMode }) =>
      isPrintMode ? (
        <span>{article.Streckkod || "-"}</span>
      ) : (
        <BarcodeInput
          deliveryNr={article.leveransnr}
          barcodeValue={article.Streckkod || ""}
          rad={article.Rad}
          onSave={saveBarcode}
        />
      ),
  },
  {
    // Minimized view only: Artikelnr and the barcode input stacked in one
    // cell instead of two separate columns.
    key: "artikelnr_streckkod",
    headerClassName: "w-[200px]",
    cellClassName: "w-[200px]",
    showWhen: "minimized",
    header: () => (
      <>
        Article No.
        <br />
        Barcode
      </>
    ),
    cell: (article, _firstEntry, { saveBarcode, isPrintMode }) =>
      isPrintMode ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <div>{article.Artikelnr || "-"}</div>
          <div>{article.Streckkod || "-"}</div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <div>{article.Artikelnr || "-"}</div>
          <BarcodeInput
            deliveryNr={article.leveransnr}
            barcodeValue={article.Streckkod || ""}
            rad={article.Rad}
            onSave={saveBarcode}
          />
        </div>
      ),
  },
  {
    key: "beskrivning",
    showWhen: "always",
    header: () => "Description",
    font: "left",
    headerClassName: "w-[200px] md:w-[300px]",
    cellClassName:
      "w-[200px] md:w-[300px] overflow-hidden text-ellipsis whitespace-nowrap",
    cell: (article) => article.Beskrivning || "-",
  },
  {
    key: "kvant",
    showWhen: "always",
    headerClassName: "w-[70px]",
    cellClassName: "w-[70px] text-center",
    header: () => (
      <>
        Delivered
        <br />
        Qty
      </>
    ),
    cell: (article) => article.Kvant || "-",
  },
  {
    key: "enh",
    showWhen: "full",
    headerClassName: "w-[60px]",
    cellClassName: "w-[60px]",
    header: () => "Unit",
    cell: (article) => article.Enh || "-",
  },
  {
    key: "kfp",
    showWhen: "always",
    headerClassName: "w-[90px]",
    cellClassName: "w-[90px]",
    header: () => (
      <>
        Delivered
        <br />
        KFP
      </>
    ),
    cell: (article) => article.KFP || "-",
  },
  {
    key: "price",
    showWhen: "full",
    headerClassName: "w-[90px]",
    cellClassName: "w-[90px]",
    header: () => "Unit Price",
    cell: (article) => article.Price || "-",
  },
  {
    key: "rekpris",
    showWhen: "full",
    headerClassName: "w-[90px]",
    cellClassName: "w-[90px]",
    header: () => (
      <>
        <span className="hidden md:inline">
          Rec.
          <br />
        </span>
        List Price
      </>
    ),
    cell: (article) => article.RekPris || "-",
  },
  {
    key: "marginal",
    showWhen: "full",
    headerClassName: "w-[100px]",
    cellClassName: "w-[100px]",
    header: () => (
      <>
        Margin
        <br />%
      </>
    ),
    cell: (article) => article.Marginal || "-",
  },
  {
    key: "nettopris",
    showWhen: "full",
    headerClassName: "w-[100px]",
    cellClassName: "w-[100px]",
    header: () => "Net Price",
    cell: (article) => article.Nettopris || "-",
  },
  {
    key: "referens",
    showWhen: "full",
    headerClassName: "w-[100px]",
    cellClassName: "w-[100px]",
    header: () => "Reference",
    cell: (article) => article.referens || "",
  },
  {
    key: "received",
    showWhen: "always",
    header: () => "Delivered",
    cell: (
      article,
      firstEntry,
      { saveReceived, fillWithKFP, isSelected, clearSelection, isPrintMode },
    ) => {
      if (isPrintMode) {
        const kfp = parseFloat(article.KFP);
        const received = article.received;
        let icon = "";

        if (received === -1) {
          // Unchecked: no icon
          icon = "";
        } else if (received === 0) {
          // Not delivered: ✗
          icon = "✗";
        } else if (received < kfp) {
          // Partly delivered: ⚠
          icon = "⚠";
        } else if (received === kfp) {
          // All delivered: ✓
          icon = "✓";
        } else if (received > kfp) {
          // Too many: ✓+
          icon = "✓+";
        }

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              textAlign: "center",
              width: "100%",
              height: "100%",
              boxSizing: "border-box",
              paddingTop: "1px",
            }}
          >
            <span>{received === -1 ? "-" : received}</span>
            {icon && <span style={{ fontSize: "14px" }}>{icon}</span>}
          </div>
        );
      }
      return (
        <DeliveredField
          article={article}
          saveReceived={saveReceived}
          fillWithKFP={fillWithKFP}
          isSelected={isSelected}
          clearSelection={clearSelection}
        />
      );
    },
  },
  {
    key: "comment",
    showWhen: "always",
    header: () => "Comment",
    headerClassName: "max-w-[120px]",
    cellClassName: "max-w-[120px]",
    cell: (article, _firstEntry, { saveComment, isPrintMode }) => {
      if (isPrintMode) {
        return <span>{article.comment || "-"}</span>;
      }
      return (
        <input
          type="text"
          placeholder="Add comment"
          defaultValue={article.comment || ""}
          onBlur={(e) => {
            const newComment = e.target.value;
            if (newComment !== (article.comment || "")) {
              saveComment(article.leveransnr, article.Rad, newComment);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const newComment = e.currentTarget.value;
              if (newComment !== (article.comment || "")) {
                saveComment(article.leveransnr, article.Rad, newComment);
              }
              e.currentTarget.blur();
            }
          }}
          className="w-full px-2 py-1 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
        />
      );
    },
  },
];
