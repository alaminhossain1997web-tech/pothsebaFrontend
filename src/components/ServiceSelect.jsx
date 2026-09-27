import { useServicesQuery } from "../services/Api";


const ServiceSelect = ({ value = [], onChange }) => {
  const {
    data,
    isLoading,
    isError,
  } = useServicesQuery();

  const services = data?.services || [];

  const handleServiceChange = (serviceId) => {
    let updatedServices;

    if (value.includes(serviceId)) {
      // Remove service
      updatedServices = value.filter(
        (id) => id !== serviceId
      );
    } else {
      // Add service
      updatedServices = [...value, serviceId];
    }

    console.log("Selected Service IDs:", updatedServices);

    onChange(updatedServices);
  };

  return (
    <div className="relative w-full max-w-md">
      <details className="group">
        {/* Select Box */}
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
          <span className="text-gray-600">
            {value.length > 0
              ? `${value.length} service selected`
              : "Select Service"}
          </span>

          <span className="transition group-open:rotate-180">
            ▼
          </span>
        </summary>

        {/* Dropdown */}
        <div className="absolute z-10 mt-2 w-full rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          {/* Loading */}
          {isLoading && (
            <p className="py-2 text-sm text-gray-500">
              Loading services...
            </p>
          )}

          {/* Error */}
          {isError && (
            <p className="py-2 text-sm text-red-500">
              Failed to load services.
            </p>
          )}

          {/* No Services */}
          {!isLoading &&
            !isError &&
            services.length === 0 && (
              <p className="py-2 text-sm text-gray-500">
                No services available.
              </p>
            )}

          {/* Services */}
          {!isLoading &&
            !isError &&
            services.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {services.map((service) => (
                  <label
                    key={service._id}
                    className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      value={service._id}
                      checked={value.includes(
                        service._id
                      )}
                      onChange={() =>
                        handleServiceChange(
                          service._id
                        )
                      }
                      className="h-4 w-4 accent-orange-500"
                    />

                    <span className="text-sm text-gray-700">
                      {service.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
        </div>
      </details>
    </div>
  );
};

export default ServiceSelect;