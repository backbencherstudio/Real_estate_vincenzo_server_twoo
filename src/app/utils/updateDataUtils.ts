/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const filteredObject = (obj: any, parentKey = "", res: any = {}) => {
  for (let key in obj) {
    const propName = parentKey ? `${parentKey}.${key}` : key;
    const value = obj[key];

    // If the value is an object, recursively filter it
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      filteredObject(value, propName, res);
    } 
    // Only include fields that have non-empty and non-undefined values
    else if (value !== undefined && value !== "") {
      res[propName] = value;
    }
  }
  return res;
};
