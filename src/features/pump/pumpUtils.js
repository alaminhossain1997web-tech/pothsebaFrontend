export const FUEL_TYPES = ["Petrol", "Octane", "Diesel", "CNG", "LPG", "EV"];
export const FACILITIES = ["Restroom", "Prayer Room", "Restaurant", "Car Wash", "Air Pump", "ATM", "Convenience Store", "EV Charging"];

export const getPumpList = (response) => {
  const candidates = [response?.data?.pumps, response?.data?.items, response?.pumps, response?.data];
  return candidates.find(Array.isArray) || [];
};
export const getPumpSummary = (response) => response?.data?.summary || response?.summary || {};
export const getPagination = (response, count) => response?.data?.pagination || response?.pagination || {
  totalPumps: count, currentPage: 1, totalPages: 1, limit: 10, hasNextPage: false, hasPrevPage: false,
};
export const getErrorMessage = (error) => {
  if (error?.status === 401) return "Your session has expired. Please sign in again.";
  if (error?.status === 403) return error?.data?.message || "You do not have permission to manage this pump.";
  if (error?.status === 404) return error?.data?.message || "This pump could not be found. Refresh the list and try again.";
  if (error?.status === 409) return error?.data?.message || "This change conflicts with the current pump status.";
  if (error?.status === 400) return error?.data?.message || "Please check the submitted information.";
  return error?.data?.message || "Something went wrong. Please try again.";
};
export const ensureApiSuccess = (response) => {
  if (response?.success === false) {
    const error = new Error(response.message || "The server could not complete this request.");
    error.status = 400;
    error.data = { message: error.message };
    throw error;
  }
  return response;
};
export const hasValidFuelRows = (fuels) => Boolean(
  fuels.length &&
  fuels.every((fuel) => fuel.type && fuel.price !== "" && Number.isFinite(Number(fuel.price)) && Number(fuel.price) >= 0) &&
  new Set(fuels.map((fuel) => fuel.type)).size === fuels.length,
);
export const getPumpId = (pump) => String(pump?._id || pump?.pumpId || pump?.id || "");
export const toInputDate = (date) => date ? new Date(date).toLocaleString() : "—";
