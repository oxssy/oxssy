import { Conduit, Emitter, Receiver } from '../src/EmitterReceiver';

const TestEmitter = Emitter(class BaseEmitter {});

const TestReceiver = Receiver(class BaseReceiver {
  onReceive() { this.hasReceived = true; }
});

const TestConduit = Conduit(class BaseConduit {
  constructor(arrayOfEmitters) {
    this.arrayOfEmitters = arrayOfEmitters;
  }

  emitters() {
    return this.arrayOfEmitters;
  }
});

describe('Emitter and Receiver', () => {
  test('creating Emitter and Receiver that subscribe and unsubscribe', () => {
    const testEmitter = new TestEmitter();
    expect(testEmitter.receivers).toBeFalsy();

    const testReceiver = new TestReceiver();
    expect(testReceiver.subscribedTo).toBeFalsy();

    testReceiver.subscribeTo(testEmitter);
    expect(testEmitter.receivers.has(testReceiver)).toBe(true);
    expect(testReceiver.subscribedTo.has(testEmitter)).toBe(true);

    testReceiver.unsubscribeTo(testEmitter);
    expect(testEmitter.receivers.has(testReceiver)).toBe(false);
    expect(testReceiver.subscribedTo.has(testEmitter)).toBe(false);
  });

  test('Receiver receives Emitter\'s emit', () => {
    const testEmitter = new TestEmitter();
    const testReceiver = new TestReceiver();
    testReceiver.subscribeTo(testEmitter);
    return testEmitter.emit().then(() => {
      expect(testReceiver.hasReceived).toBe(true);
    })
  });

  test('Receiver ignores Emitter\'s emit with custom message', () => {
    const testEmitter = new TestEmitter();
    const testReceiver = new TestReceiver();
    testReceiver.subscribeTo(testEmitter);
    return testEmitter.emit('do not react').then(() => {
      expect(testReceiver.hasReceived).toBeFalsy();
    })
  });
});

describe('Conduit', () => {
  test('A conduit subscribes to its emitters', () => {
    const emitter1 = new TestEmitter();
    const emitter2 = new TestEmitter();
    const testConduit = new TestConduit([emitter1, emitter2]);
    expect(testConduit.subscribedTo.has(emitter1)).toBe(true);
    expect(testConduit.subscribedTo.has(emitter2)).toBe(true);
  });

  test('Subscribing and unsubscribing to a conduit', () => {
    const emitter1 = new TestEmitter();
    const emitter2 = new TestEmitter();
    const testConduit1 = new TestConduit([emitter1, emitter2]);
    const emitter3 = new TestEmitter();
    const testConduit2 = new TestConduit([emitter3, testConduit1]);
    expect(testConduit2.subscribedTo.has(emitter1)).toBe(true);
    expect(testConduit2.subscribedTo.has(emitter2)).toBe(true);
    expect(testConduit2.subscribedTo.has(emitter3)).toBe(true);
    expect(testConduit2.subscribedTo.has(testConduit1)).toBe(false);
    const testReceiver = new TestReceiver();
    testReceiver.subscribeTo(testConduit2);
    expect(testReceiver.subscribedTo.has(emitter1)).toBe(true);
    expect(testReceiver.subscribedTo.has(emitter2)).toBe(true);
    expect(testReceiver.subscribedTo.has(emitter3)).toBe(true);
    expect(testReceiver.subscribedTo.has(testConduit1)).toBe(false);
    expect(testReceiver.subscribedTo.has(testConduit2)).toBe(false);

    testReceiver.unsubscribeTo(testConduit1);
    expect(testReceiver.subscribedTo.has(emitter1)).toBe(false);
    expect(testReceiver.subscribedTo.has(emitter2)).toBe(false);
    expect(testReceiver.subscribedTo.has(emitter3)).toBe(true);

    testReceiver.unsubscribeTo(testConduit2);
    expect(testReceiver.subscribedTo.has(emitter1)).toBe(false);
    expect(testReceiver.subscribedTo.has(emitter2)).toBe(false);
    expect(testReceiver.subscribedTo.has(emitter3)).toBe(false);
  });

  test('Emitting through conduit will also mark conduit as dirty', () => {
    const emitter1 = new TestEmitter();
    const emitter2 = new TestEmitter();
    const testConduit1 = new TestConduit([emitter1, emitter2]);
    testConduit1.dirty = false;
    const emitter3 = new TestEmitter();
    const testConduit2 = new TestConduit([emitter3, testConduit1]);
    testConduit2.dirty = false;
    const testReceiver = new TestReceiver();
    testReceiver.subscribeTo(testConduit2);

    return emitter3.emit().then(() => {
      expect(testConduit1.dirty).toBe(false);
      expect(testConduit2.dirty).toBe(true);
      expect(testReceiver.hasReceived).toBe(true);
      testConduit2.dirty = false;
      testReceiver.hasReceived = false;
    }).then(() => emitter1.emit().then(() => {
      expect(testConduit1.dirty).toBe(true);
      expect(testConduit2.dirty).toBe(true);
      expect(testReceiver.hasReceived).toBe(true);
    }));
  });
});
