import { Observable, Observer } from './Observer';
import { shallowEqual } from './util';


class OxssyCollection {
  constructor(collection = null, transform = null) {
    this.transform = transform;
    this.cachedValue = null;
    this.cachedHandlers = null;
    this.isNull = false;
    this.isOutdated = true;
    this.oxssyCollection = collection;
    this.entries().forEach(([key, child]) => this.observeChild(child, key));
  }

  keys() {
    return Object.keys(this.oxssyCollection);
  }

  values() {
    return Object.values(this.oxssyCollection);
  }

  entries() {
    return Object.entries(this.oxssyCollection);
  }

  requireOxssy(child, key = null) {
    if (!child.isOxssy) {
      throw new Error(
        `Value ${child} ${key !== null ? `at key ${key}` : ``} is not an oxssy.`
      );
    }
  }

  observeChild(child, key = null) {
    this.requireOxssy(child, key);
    child.onObserve(this);
  }

  get value() {
    if (this.isOutdated) {
      this.recache();
    }
    return this.cachedValue;
  }

  get handler() {
    if (this.isOutdated) {
      this.recache();
    }
    return this.cachedHandlers;
  }

  get isOxssy() {
    return true;
  }

  onNotified(messageId) {
    this.isNull = false;
    if (!this.observers || this.observers.size === 0) {
      this.isOutdated = true;
      return Promise.resolve();
    }
    return this.maybeRelay(() => Promise.resolve(), messageId);
  }

  maybeRelay(promiseFunction, messageId, excluded = null) {
    return promiseFunction().then(() => {
      const previousValue = this.cachedValue;
      this.isOutdated = true;
      this.recache();
      if (previousValue === this.cachedValue) {
        return Promise.resolve();
      }
      return this.notify(messageId, excluded);
    });
  }

  recache() {
    if (!this.isOutdated) {
      return;
    }
    this.isOutdated = false;
    if (this.isNull) {
      this.cachedValue = null;
      this.cachedHandlers = null;
      return;
    }
    this.cachedValue = typeof this.transform === 'function'
      ? this.transform(this.eval()) : this.eval();
    this.cachedHandlers = this.handlers();
  }

  reset(excluded = null) {
    return this.maybeRelay(
      () => Promise.all(this.entries().map(([key, child]) => child.reset(this))),
      null,
      excluded,
    );
  }

  setNull(isNull = false) {
    if (this.isNull === isNull) {
      return Promise.resolve();
    }
    this.isNull = isNull;
    return this.reset();
  }
}

export default Observer(Observable(OxssyCollection));
