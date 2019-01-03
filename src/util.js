export const shallowEqual = (objA, objB) => {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) {
    return false;
  }
  for (const key of Object.keys(objA)) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }
  return true;
};

export const is = (x, y) => {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  }
  return x !== x && y !== y;
};

export const mapEval = (objectOfData) => {
  const values = {};
  Object.entries(objectOfData).forEach(([key, data]) => {
    values[key] = data.value;
  });
  return values;
};

export const arrayEval = arrayOfData => arrayOfData.map(el => el.value);
