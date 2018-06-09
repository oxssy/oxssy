import { Oxssy, datatype, errorCode } from '../src';

describe('boolean validator', () => {
  test('validating required value', async () => {
    const testState = new Oxssy(datatype.bool);
    const testStateRequired = new Oxssy(datatype.bool.isRequired);
    expect(testState.type.baseType).toBe('bool');
    expect(testStateRequired.type.baseType).toBe('bool');
    expect(testState.validate()).toBe(null);
    expect(testStateRequired.validate()).toBe(errorCode.REQUIRED);
    await testStateRequired.update(true);
    expect(testStateRequired.validate()).toBe(null);
  });
});

describe('string validator', () => {
  test('validating required value', async () => {
    const testState = new Oxssy(datatype.string);
    const testStateRequired = new Oxssy(datatype.string.isRequired);
    expect(testState.type.baseType).toBe('string');
    expect(testStateRequired.type.baseType).toBe('string');
    expect(testState.validate()).toBe(null);
    expect(testStateRequired.validate()).toBe(errorCode.REQUIRED);
    await testStateRequired.update('anything');
    expect(testStateRequired.validate()).toBe(null);
  });
});
