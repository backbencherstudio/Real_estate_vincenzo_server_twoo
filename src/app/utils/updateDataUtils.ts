/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const filteredObject = (obj: any, parentKey = "", res: any = {}) => {
  for (let key in obj) {
    const propName = parentKey ? `${parentKey}.${key}` : key;
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      filteredObject(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
};
