import OxssyCollection from './OxssyCollection';
import { arrayEval } from './util';


export default class OxssyArray extends OxssyCollection {
  constructor(oxssyArray, isRequired = true, transform = null, translateError = null) {
    super(isRequired, transform, translateError);
    this.enableArrayOps();
    this.oxssyArray = oxssyArray || [];
    Object.entries(this.oxssyArray).forEach(entry => this.observeChild(...entry));
  }

  children() {
    return this.oxssyArray;
  }

  childrenEval(validation = false) {
    return arrayEval(this.oxssyArray, validation);
  }

  destroy(cascade = false) {
    while (this.length) {
      const removed = this.oxssyArray.pop();
      if (removed.offObserve(this) && cascade) {
        removed.destroy();
      }
    }
  }

  enableArrayOps() {
    const reorderArrayOps = ['reverse', 'sort'];
    const insertionArrayOps = ['push', 'unshift'];
    const removalArrayOps = ['pop', 'shift'];
    reorderArrayOps.forEach((opName) => {
      this[opName] = function op(...params) {
        return this.maybeNotifyAfter(() => {
          this.oxssyArray[opName](...params);
          return Promise.resolve();
        });
      };
    });
    insertionArrayOps.forEach((opName) => {
      this[opName] = function op(...params) {
        return this.maybeNotifyAfter(() => {
          params.forEach((child, index) => this.observeChild(index, child));
          this.oxssyArray[opName](...params);
          return Promise.resolve();
        });
      };
    });
    removalArrayOps.forEach((opName) => {
      this[opName] = function op(destroy = false, cascade = false) {
        return this.maybeNotifyAfter(() => {
          const removed = this.oxssyArray[opName]();
          if (removed.offObserve(this) && destroy) { removed.destroy(cascade); }
          return Promise.resolve();
        });
      };
    });
  }

  get handler() {
    const handlers = this.oxssyArray.map(child => child.handler);
    if (handlers.every(handler => handler === null)) {
      return null;
    }
    return handlers;
  }

  get length() {
    return this.oxssyArray.length;
  }

  splice(start, deleteCount = 0, ...params) {
    let destroy = false;
    let cascade = false;
    let oxssyParams = params;
    if (typeof params[params.length - 1] === 'boolean') {
      if (typeof params[params.length - 2] === 'boolean') {
        destroy = params[params.length - 2];
        cascade = params[params.length - 1];
        oxssyParams = params.slice(0, -2);
      } else {
        destroy = params[params.length - 1];
        oxssyParams = params.slice(0, -1);
      }
    }
    if (deleteCount === 0 && !oxssyParams.length) {
      return Promise.resolve();
    }
    return this.maybeNotifyAfter(() => {
      oxssyParams.forEach((child, index) => this.observeChild(index, child));
      const removed = this.oxssyArray.splice(start, deleteCount, ...oxssyParams);
      removed.forEach((child) => {
        if (child.offObserve(this) && destroy) { child.destroy(cascade); }
      });
      return Promise.resolve();
    });
  }

  update(value, excluded = null) {
    return this.maybeNotifyAfter(
      () => {
        if (value === null) {
          return this.setNull(true);
        }
        this.isNull = false;
        return Promise.all(Array.isArray(value)
          ? this.oxssyArray.slice(0, value.length).map((child, index) =>
            child.update(value[index], this))
          : this.oxssyArray.map(child => child.update(value, this)));
      },
      null,
      excluded,
    );
  }
}
