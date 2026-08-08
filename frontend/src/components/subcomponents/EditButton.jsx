const EditButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-6 h-6 flex items-center justify-center bg-[var(--btn-bg)] hover:bg-[var(--btn-bg-hover)] text-white font-bold rounded-md transition-colors duration-200"
      title="Edit barcode"
    >
      ✎
    </button>
  );
};

export default EditButton;
