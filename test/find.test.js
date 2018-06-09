import { Oxssy, OxssyMap, find } from '../src';


const shallow = new Oxssy();
const deep = new Oxssy();
const asDeep = new Oxssy();
const branch = new OxssyMap({ asDeep, deep });
const testState = new OxssyMap({ branch, shallow });

describe('find', () => {
  test('finding self', () => {
    expect(find(testState, '.')).toBe(testState);
  });

  test('finding via path', () => {
    expect(find(testState, 'shallow')).toBe(shallow);
    expect(find(testState, 'branch')).toBe(branch);
    expect(find(testState, 'branch.deep')).toBe(deep);
    expect(find(testState, 'branch.asDeep')).toBe(asDeep);
  });
});
