export const isInt = Number.isInteger || function (value) {
  return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
};
export default isInt;
