const TableHeader = ({ children, className = "" }) => {
  return (
    <th
      className={`px-1 md:px-3 py-1 md:py-3 text-center font-semibold text-[var(--text-table-header)] ${className}`}
      style={{ border: "none", boxSizing: "border-box" }}
    >
      {children}
    </th>
  );
};

export default TableHeader;
