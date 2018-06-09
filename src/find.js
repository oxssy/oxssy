import OxssyMap from './OxssyMap';

const splitPath = (path) => {
  let strippedPath = path;
  while (strippedPath.startsWith('.')) {
    strippedPath = path.substring(1);
  }
  const delimiter = strippedPath.indexOf('.');
  if (delimiter === -1) {
    return [strippedPath, ''];
  }
  return [strippedPath.substring(0, delimiter), strippedPath.substring(delimiter + 1)];
};

export default function find(data, path) {
  if (!path) {
    return data;
  }
  const [next, rest] = splitPath(path);
  if (!next) {
    return data;
  }
  if (data instanceof OxssyMap) {
    return find(data.oxssyMap[next], rest);
  }
  return null;
}
