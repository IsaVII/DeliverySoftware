import TableHeader from "./subcomponents/TableHeader";
import TableEntry from "./subcomponents/TableEntry";
import { NOT_DELIVERED_COLUMNS } from "../js/config/notDeliveredColumns.jsx";
import { useNotDeliveredItems } from "../js/hooks/useNotDeliveredItems";

function NotDeliveredTable() {
  const { notDeliveredItems, isLoading, error } = useNotDeliveredItems();

  if (isLoading) {
    return (
      <div className="text-center text-[var(--text-secondary)]">
        Hämtar ej levererade artiklar...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">Fel vid hämtning: {error}</div>
    );
  }

  if (notDeliveredItems.length === 0) {
    return (
      <div className="text-center text-[var(--text-secondary)]">
        Inga ej levererade artiklar
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-[var(--border)] rounded-lg">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-[var(--table-header-bg)] sticky top-0">
          <tr>
            {NOT_DELIVERED_COLUMNS.map((col) => (
              <TableHeader key={col.key} className={col.headerClassName}>
                {col.header()}
              </TableHeader>
            ))}
          </tr>
        </thead>
        <tbody>
          {notDeliveredItems.map((item, index) => (
            <tr
              key={index}
              className="min-h-[50px] border-b-1 border-[var(--border)] hover:bg-[var(--bg-entry-hover)]"
            >
              {NOT_DELIVERED_COLUMNS.map((col) => (
                <TableEntry
                  key={col.key}
                  entryData={{ firstEntry: index === 0 }}
                  font={col.font}
                  className={col.cellClassName}
                >
                  {col.cell(item)}
                </TableEntry>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NotDeliveredTable;
