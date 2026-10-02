import React from "react";

const PrimaryButton = ({
  children,
  onClick,
  disabled = false,
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-lg bg-[#ff7f11] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e96f05] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
};

export default PrimaryButton;