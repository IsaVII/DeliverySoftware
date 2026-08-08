import TableEntry from "./TableEntry.jsx";
import { getRowStatus, getRowClassName } from "../../js/utils/deliveryStatus";

export default function DeliveryRow({
  article,
  columns,
  borderFirstEntry,
  showLeveransnr,
  isSelected,
  rowRef,
  saveBarcode,
  saveReceived,
  saveComment,
  fillWithKFP,
  clearSelection,
  isPrintMode,
}) {
  const rowStatus = getRowStatus(article);
  const helpers = {
    saveBarcode,
    saveReceived,
    saveComment,
    fillWithKFP,
    isSelected,
    clearSelection,
    showLeveransnr,
    isPrintMode,
  };

  return (
    <tr
      ref={rowRef}
      className={`${getRowClassName(rowStatus)} ${
        isSelected ? "!bg-[var(--table-row-selected-bg)]" : ""
      }`}
    >
      {columns.map((col) => (
        <TableEntry
          key={col.key}
          entryData={{ firstEntry: borderFirstEntry }}
          font={col.font}
          className={col.cellClassName}
        >
          {col.cell(article, borderFirstEntry, helpers)}
        </TableEntry>
      ))}
    </tr>
  );
}
