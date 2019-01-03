const splitPath = (path) => {
  let pathStart = 0;
  while (path.charAt(pathStart) === '.' || path.charAt(pathStart) === ' ') {
    pathStart += 1;
  }
  const strippedPath = path.substring(pathStart);
  const delimiter = strippedPath.indexOf('.');
  let next = delimiter === -1 ? strippedPath : strippedPath.substring(0, delimiter);
  let rest = delimiter === -1 ? '' : strippedPath.substring(delimiter + 1);
  const index = /\[-?\d+\]/.exec(next);
  if (index) {
    if (index.index === 0) {
      rest = next.substring(index[0].length) + rest;
      next = next.substring(0, index[0].length);
    } else {
      rest = next.substring(index.index) + rest;
      next = next.substring(0, index.index);
    }
  }
  return [next, rest];
};

export default function find(data, path) {
  if (!data) { return null; }
  if (!path) { return data; }
  const [next, rest] = splitPath(path);
  if (!next) { return data; }
  const index = /^\[(-?\d+)\]$/.exec(next);
  if (index) {
    const nextIndex = +index[1];
    if (!data.length || nextIndex >= data.length || nextIndex < -data.length) {
      return null;
    }
    const actualIndex = nextIndex >= 0 ? nextIndex : (data.length + nextIndex);
    if (Object.prototype.hasOwnProperty.call(data, 'oxssyArray')) {
      return find(data.oxssyArray[actualIndex], rest);
    } else if (Array.isArray(data)) {
      return find(data[actualIndex], rest);
    }
    return null;
  } else if (Object.prototype.hasOwnProperty.call(data, 'oxssyMap')) {
    return find(data.oxssyMap[next], rest);
  }
  return find(data[next], rest);
}
