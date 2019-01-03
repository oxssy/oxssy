import OxssyCollection from './OxssyCollection';
import { mapEval } from './util';


export default class OxssyMap extends OxssyCollection {
  constructor(oxssyMap, isRequired = true, transform = null, translateError = null) {
    super(isRequired, transform, translateError);
    this.oxssyMap = oxssyMap || {};
    Object.entries(this.oxssyMap).forEach(entry => this.observeChild(...entry));
  }

  children() {
    return Object.values(this.oxssyMap);
  }

  childrenEval(validation = false) {
    return mapEval(this.oxssyMap, validation);
  }

  destroy(cascade = false) {
    Object.keys(this.oxssyMap).forEach((key) => {
      this.removeKey(key, cascade);
    });
  }

  delete(key, destroy = false, cascade = false) {
    if (!this.oxssyMap[key]) {
      return Promise.resolve();
    }
    return this.maybeNotifyAfter(() => {
      this.removeKey(key, destroy, cascade);
      return Promise.resolve();
    });
  }

  get handler() {
    const handlers = {};
    Object.entries(this.oxssyMap).forEach(([key, child]) => {
      const childHandler = child.handler;
      if (childHandler) {
        handlers[key] = childHandler;
      }
    });
    if (Object.keys(handlers).length === 0) {
      return null;
    }
    return handlers;
  }

  set(key, child, destroyOnCollision = false, cascade = false) {
    if (this.oxssyMap[key] === child) {
      return Promise.resolve();
    }
    return this.maybeNotifyAfter(() => {
      if (this.oxssyMap[key]) {
        this.removeKey(key, destroyOnCollision, cascade);
      }
      this.oxssyMap[key] = child;
      this.observeChild(key, child);
      return Promise.resolve();
    });
  }

  removeKey(key, destroy, cascade) {
    const toRemove = this.oxssyMap[key];
    if (toRemove.offObserve(this) && destroy) {
      toRemove.destroy(cascade);
    }
    delete this.oxssyMap[key];
  }

  update(value, excluded = null) {
    return this.maybeNotifyAfter(
      () => {
        if (value === null) {
          return this.setNull(true);
        }
        this.isNull = false;
        const childPromises = [];
        for (const [key, subValue] of Object.entries(value)) {
          const child = this.oxssyMap[key];
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
