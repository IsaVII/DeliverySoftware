import Input from "./Input.jsx";
import { useState, useEffect, useRef } from "react";

export default function DeliveredField({
  article,
  saveReceived,
  fillWithKFP,
  isSelected,
  clearSelection,
}) {
  const [tempValue, setTempValue] = useState(
    article.received !== -1 ? article.received : "",
  );
  const inputRef = useRef(null);

  // Sync tempValue when article.received changes (after saveReceived updates parent)
  useEffect(() => {
    setTempValue(article.received !== -1 ? article.received : "");
  }, [article.received]);

  // Auto-focus input when this row is selected
  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSelected]);

  const handleChange = (e) => {
    setTempValue(e.target.value);
  };

  const handleInput = (e) => {
    setTempValue(e.target.value);
    // Trigger save for spinner arrow clicks
    const finalValue = e.target.value === "" ? -1 : parseFloat(e.target.value);
    saveReceived(article.leveransnr, article.Rad, finalValue);
    if (clearSelection) {
      clearSelection();
    }
  };

  const handleBlur = () => {
    const finalValue = tempValue === "" ? -1 : parseFloat(tempValue);
    saveReceived(article.leveransnr, article.Rad, finalValue);
    if (clearSelection) {
      clearSelection();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        paddingTop: "1px",
      }}
    >
      <Input
        ref={inputRef}
        type="number"
        placeholder="Qty"
        size="s"
        step="0.01"
        value={tempValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onInput={handleInput}
        style={{
          flex: 1,
          padding: "4px",
          borderRadius: "4px",
          border: "1px solid var(--border)",
          boxSizing: "border-box",
        }}
      />
      <button
        onClick={() => {
          const kfpValue = parseFloat(article.KFP);
          fillWithKFP(article.leveransnr, article.Rad, kfpValue);
        }}
        title="Fill with KFP"
        style={{
          padding: "6px 10px",
          backgroundColor: "var(--btn-bg)",
          color: "var(--btn-font-color)",
          borderRadius: "4px",
          border: "none",
          cursor: "pointer",
          fontSize: "15px",
        }}
      >
        Fill
      </button>
    </div>
  );
}
