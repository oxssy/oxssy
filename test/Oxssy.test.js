import {
  Oxssy,
  OxssyArray,
  OxssyMap,
} from '../src';
import { Observer } from '../src/Observer';


const TestObserver = Observer(class BaseObserver {
  onNotified() { this.received = true; }
});

describe('Oxssy', () => {
  test('creating root Oxssy', () => {
    const testData = new Oxssy();
    expect(testData).not.toBeNull();
  });

  test('creating Oxssy with initial value', () => {
    const testData = new Oxssy('test');
    expect(testData.value).toBe('test');
  });
});

describe('OxssyCollection', () => {
  test('An OxssyCollection channels notify via update', () => {
    const oxssy1 = new Oxssy();
    const oxssy2 = new Oxssy();
    const collection1 = new OxssyArray([oxssy1, oxssy2]);
    const collection2 = new OxssyMap({ oxssy2 });
    const observer1 = new TestObserver();
    const observer2 = new TestObserver();
    const observer3 = new TestObserver();
    collection1.onObserve(observer1);
    collection1.onObserve(observer2);
    collection2.onObserve(observer3);
    return oxssy1.update(1)
      .then(() => {
        expect(observer1.received).toBe(true);
        expect(observer2.received).toBe(true);
        expect(observer3.received).toBeFalsy();
      })
      .then(() => oxssy2.update(2))
      .then(() => {
        expect(observer1.received).toBe(true);
        expect(observer2.received).toBe(true);
        expect(observer3.received).toBe(true);
      });
  });

  test('When unobserved, notify will mark OxssyCollection as outdated', async () => {
    const oxssy1 = new Oxssy();
    const oxssy2 = new Oxssy();
    const array1 = new OxssyArray([oxssy1]);
    await oxssy1.notify().then(() => {
      expect(array1.isOutdated).toBe(true);
      array1.recache();
    });

    const array2 = new OxssyArray([oxssy2]);
    array2.recache();
    const map1 = new OxssyMap({ array1, array2 });

    await oxssy1.notify(2).then(() => {
      expect(array1.isOutdated).toBeFalsy();
      expect(array2.isOutdated).toBeFalsy();
      expect(map1.isOutdated).toBe(true);
    });
  });

  test('OxssyCollection notifies only if the recached value has changed', async () => {
    const oxssy1 = new Oxssy(1);
    const oxssy2 = new Oxssy(2);
    const array = new OxssyArray([oxssy1, oxssy2], values => values[1]);
    array.recache();
    const testObserver1 = new TestObserver();
    array.onObserve(testObserver1);
    await oxssy1.update(3).then(() => {
      expect(array.isOutdated).toBeFalsy();
      expect(testObserver1.received).toBeFalsy();
    });

    const map = new OxssyMap({ array, oxssy2 });
    const testObserver2 = new TestObserver();
    map.onObserve(testObserver2);

    await oxssy2.update(2)
      .then(() => {
        expect(testObserver1.received).toBeFalsy();
        expect(testObserver2.received).toBeFalsy();
      })
      .then(() => oxssy2.update(3))
      .then(() => {
        expect(testObserver1.received).toBe(true);
        expect(testObserver2.received).toBe(true);
      });
  });

  test('OxssyCollection can be set to null', async () => {
    const oxssy = new Oxssy(-1);
    const array = new OxssyArray([oxssy]);
    const map = new OxssyMap({ array });

    await array.update(null);
    expect(array.value).toBeNull();
    expect(map.value).toEqual({ array: null });
    await array.update([1]).then(() => map.update(null));
    expect(map.value).toBeNull();
    expect(oxssy.value).toBeNull();
    await array.update([1]);
    expect(array.value).toEqual([1]);
    expect(map.value).toEqual({ array: [1] });
    await map.update({ array: null });
    expect(array.value).toBeNull();
    expect(map.value).toEqual({ array: null });
  });
});


describe('OxssyMap', () => {
  test('creating OxssyMap', () => {
    const child1 = new Oxssy(1);
    const child2 = new Oxssy('second');
    const testData = new OxssyMap({ child1, child2 });
    expect(testData.value).toEqual({
      child1: 1,
      child2: 'second',
    });
  });

  test('adding and removing child', () => {
    const child1 = new Oxssy(1);
    const child2 = new Oxssy('second');
    const testData = new OxssyMap({ child1, child2 });
    const newChild = new Oxssy(true);
    expect(testData.value).toEqual({
      child1: 1,
      child2: 'second',
    });
    return testData.set('child1', newChild)
      .then(() => testData.delete('child2', true))
      .then(() => {
        expect(testData.value).toEqual({ child1: true });
      });
  });

  test('updating OxssyMap', () => {
    const child1 = new Oxssy(1);
    const child2 = new Oxssy('second');
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
      ({ testDataInput: input }) => (input ? input.length : 0),
    );
    expect(testData.value).toBe(0);
    testDataInput.update('some string').then(() => {
      expect(testData.value).toBe(11);
    });
  });
});


describe('OxssyArray', () => {
  test('creating OxssyArray', () => {
    const child1 = new Oxssy(1);
    const child2 = new Oxssy('second');
    const testData = new OxssyArray([child1, child2]);
    expect(testData.value).toEqual([1, 'second']);
  });

  test('array operations', async () => {
    const child1 = new Oxssy(1);
    const child2 = new Oxssy(2);
    const child3 = new Oxssy(3);
    const child4 = new Oxssy(4);
    const child5 = new Oxssy(5);
    const testData = new OxssyArray();
    await testData.push(child1, child2);
    expect(testData.value).toEqual([1, 2]);
    await testData.unshift(child1, child3);
    expect(testData.value).toEqual([1, 3, 1, 2]);
    await testData.shift();
    expect(testData.value).toEqual([3, 1, 2]);
    expect(child1.observers.has(testData)).toBe(true);
    await testData.pop(true, true);
    expect(testData.value).toEqual([3, 1]);
    expect(child2.observers.has(testData)).toBe(false);
    await testData.reverse();
    expect(testData.value).toEqual([1, 3]);
    await testData.splice(0, 1, child4, child5, true, true);
    expect(testData.value).toEqual([4, 5, 3]);
    expect(child1.observers.has(testData)).toBe(false);
    expect(child5.observers.has(testData)).toBe(true);
    await testData.sort((a, b) => a.value - b.value);
    expect(testData.value).toEqual([3, 4, 5]);
  });

  test('array no-ops', async () => {
    const child1 = new Oxssy(1);
    const child2 = new Oxssy(2);
    const child3 = new Oxssy(3);
    const child4 = new Oxssy(4);
    const child5 = new Oxssy(5);
    const testData = new OxssyArray();
    await testData.push(child1, child2, child3, child4, child5);
    expect(testData.some(child => child.value > 2)).toBe(true);
    expect(testData.every(child => child.value > 2)).toBe(false);
    expect(testData.filter(child => child.value > 2)).toEqual([child3, child4, child5]);
    testData.forEach(async (child) => {
      await child.update(child.value + 1);
    });
    expect(testData.map(child => child.value)).toEqual([2, 3, 4, 5, 6]);
    const reduction = (sum, cur) => {
      if (sum >= cur.value) return sum - cur.value;
      return sum + cur.value;
    };
    expect(testData.reduce(reduction, 2)).toBe(8);
    expect(testData.reduceRight(reduction, 2)).toBe(2);
  });

  test('updating OxssyArray', () => {
    const child1 = new Oxssy(1);
    const child2 = new Oxssy('second');
    const testData = new OxssyMap({ child1, child2 });
    const update = {
      child1: 2,
      child2: 'third',
    };
    return testData.update(update).then(() => {
      expect(testData.value).toEqual(update);
    });
  });

  test('updating OxssyArray with transform function', () => {
    const testInput = new Oxssy();
    const testData = new OxssyMap(
      { testInput },
      ({ testInput: input }) => (input ? input.length : 0),
    );
    expect(testData.value).toBe(0);
    testInput.update('some string').then(() => {
      expect(testData.value).toBe(11);
    });
  });
});
