import OxssyCollection from './OxssyCollection';
import { mapEval } from './util';


export default class OxssyMap extends OxssyCollection {
  constructor(oxssyMap, transform = null) {
    super(oxssyMap || {}, transform);
  }

  eval() {
    return mapEval(this.oxssyCollection);
  }

  handlers() {
    const handlers = {};
    let anyHandler = false;
    this.entries().forEach(([key, child]) => {
      const childHandler = child.handler;
      if (childHandler) {
        anyHandler = true;
        handlers[key] = childHandler;
      }
    });
    if (!anyHandler) {
      return null;
    }
    return handlers;
  }

  destroy(cascade = false) {
    Object.keys(this.oxssyCollection).forEach((key) => {
      this.removeKey(key, cascade);
    });
  }

  set(key, child, destroyOnCollision = false, cascade = false) {
    if (this.oxssyCollection[key] === child) {
      return Promise.resolve();
    }
    return this.maybeRelay(() => new Promise(resolve => {
      if (this.oxssyCollection[key]) {
        this.removeKey(key, destroyOnCollision, cascade);
      }
      this.oxssyCollection[key] = child;
      child.onObserve(this);;
      resolve();
    }));
  }

  delete(key, destroy = false, cascade = false) {
    if (!this.oxssyCollection[key]) {
      return Promise.resolve();
    }
    return this.maybeRelay(() => new Promise(resolve => {
      this.removeKey(key, destroy, cascade);
      resolve();
    }));
  }

  removeKey(key, destroy, cascade) {
    const toRemove = this.oxssyCollection[key];
    if (toRemove.offObserve(this) && destroy) {
      toRemove.destroy(cascade);
    }
    delete this.oxssyCollection[key];
  }

  update(value, excluded = null) {
    return this.maybeRelay(
      () => {
        if (value === null) {
          return this.setNull(true);
        }
        this.isNull = false;
        const childPromises = [];
        for (const [key, subValue] of Object.entries(value)) {
          const child = this.oxssyCollection[key];
          if (child) {
            childPromises.push(child.update(subValue, this));
          }
        }
        return Promise.all(childPromises);
      },
      null,
      excluded,
    );
  }
}
