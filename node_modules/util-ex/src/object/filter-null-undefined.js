import isArray from "../is/type/array.js";
export function filterNullUndefined(obj) {
  if (isArray(obj)) {
    return obj.filter(item => item != null)
  } else if (obj) {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];
      if (value != null) {
        acc[key] = value;
      }
      return acc;
    }, {})
  }
}
