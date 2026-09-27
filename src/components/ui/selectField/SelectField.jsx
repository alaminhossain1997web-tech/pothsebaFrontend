
import React from "react";
import { FaChevronDown } from "react-icons/fa";

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  placeholder = "Select an option",
}) => {
  return (
    <div>
      <label
        className="block text-sm font-semibold mb-2"
        style={{ color: "#000000" }}
      >
        {label}
      </label>

      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors appearance-none pr-10 cursor-pointer"
          style={{
            borderColor: "#1C2333",
            color: "#000000",
          }}
          required={required}
        >
          <option
            value=""
            disabled
            style={{
              backgroundColor: "#f7f6f2",
              color: "#000000",
            }}
          >
            {placeholder}
          </option>

          {options.map((option, index) => (
            <option
              key={index}
              value={option.value || option}
              style={{
                backgroundColor: "#f27a00",
                color: "#000000",
              }}
            >
              {option.label || option}
            </option>
          ))}
        </select>

        <div
          className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
          style={{ color: "#000000" }}
        >
          <FaChevronDown className="text-xs" />
        </div>
      </div>
    </div>
  );
};

export default SelectField;

