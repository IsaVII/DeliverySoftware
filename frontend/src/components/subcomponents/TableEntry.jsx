const TableEntry = ({
  font = "center",
  entryData,
  children,
  className = "",
}) => {
  const getBorderSize = () => {
    switch (entryData.firstEntry) {
      case true:
        return "border-t-3  border-[var(--border-thick)]";
    }
  };

  const getPadding = () => {
    return entryData.firstEntry
      ? "px-1 pt-0 pb-1 md:px-3 md:pt-0 md:pb-2"
      : "px-1 py-1 md:px-3 md:py-2";
  };

  return (
    <td
      id={entryData.id}
      className={`${getPadding()} min-h-[44px] ${getBorderSize()}  text-${font} ${className}`}
      style={{ boxSizing: "border-box" }}
    >
      {children}
    </td>
  );
};

export default TableEntry;
