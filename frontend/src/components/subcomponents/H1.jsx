const H1 = ({ children }) => {
  return (
    <h1 className="hidden md:block text-lg md:text-2xl font-semibold text-[var(--text-h)] mb-0 truncate">
      {children}
    </h1>
  );
};

export default H1;
