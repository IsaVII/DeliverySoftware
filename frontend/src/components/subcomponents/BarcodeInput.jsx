import { useState, useEffect, useRef } from "react";
import Input from "./Input.jsx";
import EditButton from "./EditButton.jsx";

const BarcodeInput = ({
  deliveryNr,
  rad,
  barcodeValue,
  inputValue,
  onInputChange,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(inputValue || "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSave(deliveryNr, rad, tempValue);
      setIsEditing(false);
      setTempValue("");
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setTempValue("");
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setTempValue(barcodeValue || "");
  };

  const handleBlur = () => {
    onSave(deliveryNr, rad, tempValue);
    setIsEditing(false);
    setTempValue("");
  };

  return (
    <div className="flex items-center gap-2 ">
      {isEditing ||
      barcodeValue === undefined ||
      barcodeValue === "" ||
      barcodeValue === "-" ? (
        <Input
          ref={inputRef}
          size="s"
          type="text"
          placeholder="Enter..."
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          enterKeyHint="done"
          inputMode="text"
          className="px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
      ) : (
        <>
          <span>{barcodeValue || "-"}</span>
          {barcodeValue && <EditButton onClick={handleEditClick} />}
        </>
      )}
    </div>
  );
};

export default BarcodeInput;
