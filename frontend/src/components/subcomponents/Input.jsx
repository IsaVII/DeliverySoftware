import React, { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      size = "s",
      type = "text",
      placeholder,
      value = "",
      onChange,
      onKeyDown,
      onBlur,
      className = "",
      enterKeyHint,
      inputMode,
    },
    ref,
  ) => {
    const getSize = () => {
      switch (size) {
        case "s":
          return "70px"; // Small size
        case "m":
          return "110px"; // Medium size
        case "l":
          return "200px"; // Large size
        default:
          return "32px"; // Default to small if size is not recognized
      }
    };

    return (
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        style={{ width: getSize() }}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        enterKeyHint={enterKeyHint}
        inputMode={inputMode}
        className={`px-1 py-1 md:px-3 md:py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${className}`}
      />
    );
  },
);

Input.displayName = "Input";

export default Input;
