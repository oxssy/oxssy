import { Observable, Observer } from '../src/Observer';

describe('Observable and Observer', () => {
  const TestObservable = Observable(class BaseObservable {});

  const TestObserver = Observer(class BaseObserver {
    onNotified() { this.received = true; }
  });

  test('creating Observable and Observer that subscribe and unsubscribe', () => {
    const testObservable = new TestObservable();
    expect(testObservable.observers).toBeFalsy();

    const testObserver = new TestObserver();

    testObservable.onObserve(testObserver);
    expect(testObservable.observers.has(testObserver)).toBe(true);

    testObservable.offObserve(testObserver);
    expect(testObservable.observers.has(testObserver)).toBe(false);
  });

  test('Observer receives Observable\'s notify', () => {
    const testObservable = new TestObservable();
    const testObserver = new TestObserver();
    testObservable.onObserve(testObserver);
    return testObservable.notify().then(() => {
      expect(testObserver.received).toBe(true);
    });
  });

  test('Observer ignores Observable\'s notify when specified', () => {
    const testObservable = new TestObservable();
    const testObserver1 = new TestObserver();
    const testObserver2 = new TestObserver();
    const testObserver3 = new TestObserver();
    testObserver3.shouldObserve = () => false;

    testObservable.onObserve(testObserver1);
    testObservable.onObserve(testObserver2);
    testObservable.onObserve(testObserver3);
    return testObservable.notify(null, testObserver2).then(() => {
      expect(testObserver1.received).toBe(true);
      expect(testObserver2.received).toBeFalsy();
      expect(testObserver3.received).toBeFalsy();
    });
  });
});
