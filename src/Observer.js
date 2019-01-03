let nextMessageId = 0;

const getNextMessageId = () => {
  if (nextMessageId < Number.MAX_SAFE_INTEGER) {
    nextMessageId += 1;
  } else {
    nextMessageId = -nextMessageId;
  }
  return nextMessageId;
};

export const Observable = Class => class extends Class {
  onObserve(observer) {
    if (!this.observers) {
      this.observers = new Map();
    }
    if (this.observers.has(observer)) {
      this.observers.set(observer, this.observers.get(observer) + 1);
    } else {
      this.observers.set(observer, 1);
    }
  }

  offObserve(observer) {
    if (this.observers && this.observers.has(observer)) {
      const observeCount = this.observers.get(observer);
      if (observeCount > 1) {
        this.observers.set(observer, observeCount - 1);
        return false;
      }
      this.observers.delete(observer);
    }
    return true;
  }

  notify(messageId = null, excluded = null) {
    if (!this.observers || this.observers.size === 0) {
      return Promise.resolve();
    }
    const notifyId = messageId || getNextMessageId();
    const observerPromises = [];
    this.observers.forEach((observeCount, observer) => {
      if (excluded !== observer && observer.shouldObserve(notifyId)) {
        observerPromises.push(observer.promiseNotified(notifyId));
      }
    });
    return Promise.all(observerPromises);
  }
};

export const Observer = Class => class extends Class {
  shouldObserve(messageId) {
    return this.currentMessageId !== messageId;
  }

  promiseNotified(messageId) {
    this.currentMessageId = messageId;
    return new Promise((resolve) => {
      this.currentMessageId = null;
      resolve(this.onNotified(messageId));
    });
  }
};
