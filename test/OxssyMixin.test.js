import { Oxssy, OxssyMixin } from '../src';
import { Observer } from '../src/Observer';

describe('OxssyMixin', () => {
  class TestMixin extends OxssyMixin {
    constructor(name, activateOnUpdate) {
      super(name, activateOnUpdate, 'testProperty', 'mix');
    }

    compute() {
      return this.property ? this.property + 1 : 1;
    }
  }

  test('OxssyMixin enables property on oxssy', () => {
    const oxssy = new Oxssy('test');
    const testMixin = new TestMixin('test', false);
    testMixin.attach(oxssy);
    expect(oxssy.testProperty).toBe(null);
    expect(typeof oxssy.mix).toBe('function');
    oxssy.mix();
    expect(oxssy.testProperty).toBe(1);
  });

  test('OxssyMixin can trigger notify', () => {
    const TestObserver = Observer(class BaseObserver {
      onNotified() { this.received = true; }
    });
    const observer = new TestObserver();
    const oxssy = new Oxssy('test');
    oxssy.onObserve(observer);
    const testMixin = new TestMixin('test', false);
    testMixin.attach(oxssy);
    oxssy.mix().then(() => {
      expect(observer.received).toBe(true);
    });
  });

  test('OxssyMixin can be triggered when oxssy is updated', () => {
    const TestObserver = Observer(class BaseObserver {
      onNotified() { this.received = true; }
    });
    const observer = new TestObserver();
    const oxssy1 = new Oxssy('test');
    oxssy1.onObserve(observer);
    const testMixin = new TestMixin('test', false);
    testMixin.attach(oxssy1);
    oxssy1.update('test').then(() => {
      expect(observer.received).toBeFalsy();
    });
    const oxssy2 = new Oxssy('test');
    const testMixinActOnUpdate = new TestMixin('test', true);
    oxssy2.onObserve(observer);
    testMixinActOnUpdate.attach(oxssy2);
    oxssy2.update('test').then(() => {
      expect(observer.received).toBe(true);
    });
  });
});
