import { Oxssy, OxssyArray, OxssyMap, datatype, find } from '../src';

describe('find', () => {
  const shallow = new Oxssy();
  const deep = new Oxssy();
  const asDeep = new Oxssy();
  const branch = new OxssyMap({ asDeep, deep });
  const testState = new OxssyMap({ branch, shallow });

  test('finding self', () => {
    expect(find(testState, '.')).toBe(testState);
  });

  test('find via path', () => {
    expect(find(testState, 'shallow')).toBe(shallow);
    expect(find(testState, 'branch')).toBe(branch);
    expect(find(testState, 'branch.deep')).toBe(deep);
    expect(find(testState, 'branch.asDeep')).toBe(asDeep);
  });

  const o1 = new Oxssy('o1');
  const o2 = new Oxssy('o2');
  const o3 = new Oxssy('o3');
  const m1 = new OxssyMap({ o2, o3 });
  const a1 = new OxssyArray([o1, m1]);
  const o4 = new Oxssy('o4');
  const a2 = new OxssyArray([a1, o4]);
  const m2 = new OxssyMap({ a2 });

  test('find via index', () => {
    expect(find(a1, '[1]')).toBe(m1);
    expect(find(a1, '[1].o3')).toBe(o3);
    expect(find(m2, 'a2.[-1]')).toBe(o4);
    expect(find(a2, '[0][1]o2')).toBe(o2);
    expect(find(m2, 'a2[-2][1].o3')).toBe(o3);
  });
});
