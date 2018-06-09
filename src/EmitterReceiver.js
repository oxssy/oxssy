let nextMessageId = 0;

const getNextMessageId = () => {
  if (nextMessageId < Number.MAX_SAFE_INTEGER) {
    nextMessageId += 1;
  } else {
    nextMessageId = -nextMessageId;
  }
  return nextMessageId;
}

const UPDATE = Symbol('UPDATE');

export const Emitter = Class => class extends Class {
  constructor(...params) {
    super(...params);
  }

  onSubscribe(receiver) {
    if (!this.receivers) {
      this.receivers = new Set();
    }
    this.receivers.add(receiver);
    return [this];
  }

  onUnsubscribe(receiver) {
    if (this.receivers) {
      this.receivers.delete(receiver);
    }
    return [this];
  }

  emit(message = UPDATE) {
    if (!this.receivers || this.receivers.size === 0) {
      return Promise.resolve();
    }
    const receiverPromises = [];
    this.receivers.forEach((receiver) => {
      receiverPromises.push(receiver.promiseReceive(getNextMessageId(), message));
    });
    return Promise.all(receiverPromises);
  }
};

export const Receiver = Class => class extends Class {
  constructor(...params) {
    super(...params);
    this.currentMessageId = null;
  }

  subscribeTo(emitter) {
    if (!this.subscribedTo) {
      this.subscribedTo = new Set();
    }
    const subs = emitter.onSubscribe(this);
    subs.forEach(sub => this.subscribedTo.add(sub));
    return subs;
  }

  unsubscribeTo(emitter) {
    const unsubs = emitter.onUnsubscribe(this);
    if (this.subscribedTo) {
      unsubs.forEach(unsub => this.subscribedTo.delete(unsub));
    }
    return unsubs;
  }

  shouldReceiveMessage(message) {
    return message === UPDATE;
  }

  promiseReceive(messageId, message) {
    if (!this.onReceive || !this.shouldReceiveMessage(message)
      || this.currentMessageId === messageId) {
      return Promise.resolve();
    }
    this.currentMessageId = messageId;
    return new Promise((resolve) => {
      this.currentMessageId = null;
      resolve(this.onReceive(message));
    });
  }
};

export const Conduit = Class => class extends Receiver(Class) {
  constructor(...params) {
    super(...params);
    this.emitters().forEach(emitter => this.subscribeTo(emitter));
    this.dirty = true;
  }

  onSubscribe(receiver) {
    return this.emitters().reduce(
      (arr, emitter) => arr.concat(receiver.subscribeTo(emitter)),
      [],
    );
  }

  onUnsubscribe(receiver) {
    return this.emitters().reduce(
      (arr, emitter) => arr.concat(receiver.unsubscribeTo(emitter)),
      [],
    );
  }

  promiseReceive(messageId, message) {
    if (message === UPDATE) {
      this.dirty = true;
    }
    return Promise.resolve();
  }
};
