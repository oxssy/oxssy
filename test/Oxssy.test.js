import {
  Oxssy,
  datatype,
  OxssyMap,
  errorCode,
} from '../src';


describe('Oxssy', () => {
  test('creating root Oxssy', () => {
    const testData = new Oxssy(null, datatype.string);
    expect(testData).not.toBeNull();
  });

  test('creating Oxssy with initial value', () => {
    const testData = new Oxssy(datatype.string, 'test');
    expect(testData.value).toBe('test');
  });

  test('array operations for Oxssy that is of type array', async () => {
    const testData = new Oxssy(datatype.arrayOf(datatype.string).isRequired, []);
    expect(testData.value).toEqual([]);
    testData.push('tiger');
    expect(testData.value).toEqual(['tiger']);
    testData.unshift('dragon', 'snake');
    expect(testData.value).toEqual(['dragon', 'snake', 'tiger']);
    testData.reverse();
    expect(testData.value).toEqual(['tiger', 'snake', 'dragon']);
    await testData.shift().then(shifted => expect(shifted).toBe('tiger'));
    await testData.pop().then(popped => expect(popped).toBe('dragon'));
  })
});

describe('OxssyMap', () => {
  test('creating OxssyMap', () => {
    const child1 = new Oxssy(datatype.number, 1);
    const child2 = new Oxssy(datatype.string, 'second');
    const testData = new OxssyMap({ child1, child2 });
    expect(testData.value).toEqual({
      child1: 1,
      child2: 'second',
    });
  });

  test('updating OxssyMap', () => {
    const child1 = new Oxssy(datatype.number, 1);
    const child2 = new Oxssy(datatype.string, 'second');
    const testData = new OxssyMap({ child1, child2 });
    const update = {
      child1: 2,
      child2: 'third',
    };
    return testData.update(update).then(() => {
      expect(testData.value).toEqual(update);
    });
  });

  test('updating OxssyMap with transform function', () => {
    const testDataInput = new Oxssy();
    const testData = new OxssyMap(
      { testDataInput },
      ({ testDataInput }) => testDataInput ? testDataInput.length : 0,
    );
    expect(testData.value).toBe(0);
    testDataInput.update('some string').then(() => {
      expect(testData.value).toBe(11);
    });
  });
});


//
// describe('ValidationAppState', () => {
//   test('validation failure will cause ValidationAppState to update', () => {
//     const testData = new Oxssy(datatype.string.isRequired);
//     const validationState = new ValidationAppState(testData);
//     expect(validationState.value).toBe(null);
//     return testData.validateAndNotify().catch((error) => {
//       expect(error.errorCode).toBe(errorCode.REQUIRED);
//       expect(validationState.value).toBe(errorCode.REQUIRED);
//     });
//   });
// });

