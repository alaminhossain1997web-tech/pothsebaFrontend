import React from 'react';

const InputField = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false 
})=> {
  return (
    <div>
      <label 
        className="block text-sm font-semibold mb-2"
        style={{ color: '#1C2333' }}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
        style={{ 
          borderColor: '#1C2333', 
          color: '#1C2333'
        }}
        required={required}
      />
    </div>
  );
}
export default InputField