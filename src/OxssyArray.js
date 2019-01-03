import OxssyCollection from './OxssyCollection';
import { arrayEval } from './util';


export default class OxssyArray extends OxssyCollection {
  constructor(oxssyArray, transform = null) {
    super(oxssyArray || [], transform);
  }
  
  eval() {
    return arrayEval(this.oxssyCollection);
  }

  handlers() {
    const handlers = [];
    let anyHandler = false;
    this.entries().forEach(([key, child]) => {
      const childHandler = child.handler;
      handlers.push(childHandler);
      if (childHandler) {
        anyHandler = true;
      }
    });
    if (!anyHandler) {
      return null;
    }
    return handlers;
  }

  destroy(cascade = false) {
    while (this.length) {
      const removed = this.oxssyCollection.pop();
      if (removed.offObserve(this) && cascade) {
        removed.destroy();
      }
    }
  }

  get length() {
    return this.oxssyCollection.length;
  }

  update(value, excluded = null) {
    return this.maybeRelay(
      () => {
        if (value === null) {
          return this.setNull(true);
        }
        this.isNull = false;
        return Promise.all(Array.isArray(value)
          ? this.oxssyCollection.slice(0, value.length).map((child, index) =>
            child.update(value[index], this))
          : this.oxssyCollection.map(child => child.update(value, this)));
      },
      null,
      excluded,
    );
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
    return this.maybeRelay(() => {
      oxssyParams.forEach(child => this.observeChild(child));
      const removed = this.oxssyCollection.splice(start, deleteCount, ...oxssyParams);
      removed.forEach((child) => {
        if (child.offObserve(this) && destroy) { child.destroy(cascade); }
      });
      return Promise.resolve();
    });
  }
}

['reverse', 'sort'].forEach((fn) => {
  OxssyArray.prototype[fn] = function (...params) {
    return this.maybeRelay(() => {
      this.oxssyCollection[fn](...params);
      return Promise.resolve();
    });
  }
});

['push', 'unshift'].forEach((fn) => {
  OxssyArray.prototype[fn] = function (...params) {
    return this.maybeRelay(() => {
      params.forEach((child, index) => this.observeChild(child, index));
      this.oxssyCollection[fn](...params);
      return Promise.resolve();
    });
  }
});

['pop', 'shift'].forEach((fn) => {
  OxssyArray.prototype[fn] = function (destroy = false, cascade = false) {
    return this.maybeRelay(() => {
      const removed = this.oxssyCollection[fn]();
      if (removed.offObserve(this) && destroy) { removed.destroy(cascade); }
      return Promise.resolve();
    });
  }
});

['every', 'filter', 'forEach', 'map', 'reduce', 'reduceRight', 'some'].forEach((fn) => {
  OxssyArray.prototype[fn] = function (...params) {
    return this.oxssyCollection[fn](...params);
  }
});
