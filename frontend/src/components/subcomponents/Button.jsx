const Button = ({ handleClick, children, disabled, title }) => {
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={title}
      className={`px-2 py-1 md:px-4 md:py-2 bg-[var(--btn-bg)] text-[var(--btn-font-color)] rounded-md transition-colors font-medium ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-[var(--btn-hover)] hover:text-[var(--btn-font-color-hover)]"
      }`}
    >
      {children}
    </button>
  );
};

export default Button;
