export function shallowEqual(objA, objB) {
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
    if (!objB.hasOwnProperty(key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }
  return true;
}

export function is(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  }
  return x !== x && y !== y;
}

export function mapEval(objectOfData) {
  return Object.entries(objectOfData).reduce((obj, [key, data]) => {
    const result = obj;
    result[key] = data.value;
    return result;
  }, {});
}

export function arrayEval(arrayOfData) {
  return arrayOfData.map(el => el.value);
}
