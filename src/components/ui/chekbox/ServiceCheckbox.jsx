
const ServiceCheckbox = ({ label, value, checked, onChange }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        value={value}
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 accent-orange-500"
      />

      <span className="text-gray-700">
        {label}
      </span>
    </label>
  );
};

export default ServiceCheckbox;



