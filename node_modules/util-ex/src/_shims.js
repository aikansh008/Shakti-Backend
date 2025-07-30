let _keys, _getOwnPropertyNames;
// In IE the description property of an error is visible
// eslint-disable-next-line unicorn/error-message
if ((new Error()).hasOwnProperty('description')) {
  const ERROR_PROPERTY_FILTER = function (obj, array) {
    if (Object.prototype.toString.call(obj) === '[object Error]') {
      array = array.filter((name) => {
        return name !== 'description' && name !== 'number';
      });
    }
    return array;
  };
  _keys = function keys(object) {
    return ERROR_PROPERTY_FILTER(object, Object.keys(object));
  };
  _getOwnPropertyNames = function getOwnPropertyNames(object) {
    return ERROR_PROPERTY_FILTER(object, Object.getOwnPropertyNames(object));
  };
} else {
  _keys = Object.keys;
  _getOwnPropertyNames = Object.getOwnPropertyNames;
}
export const keys = _keys;
export const getOwnPropertyNames = _getOwnPropertyNames;
