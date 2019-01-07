import { shallowEqual } from './util';

export default class OxssyMixin {
  constructor(name, activateOnUpdate = false, propertyName = null, actionName = null) {
    this.name = name;
    this.activateOnUpdate = activateOnUpdate;
    this.propertyName = propertyName;
    this.actionName = actionName;
    this.property = null;
    this.oxssy = null;
  }

  attach(oxssy) {
    this.oxssy = oxssy;
    const { name } = this;
    this.oxssy.mixins[name] = this;
    if (this.propertyName) {
      Object.defineProperty(oxssy, this.propertyName, {
        get() {
          return this.mixins[name].property;
        },
      });
    }
    if (this.actionName) {
      Object.defineProperty(oxssy, this.actionName, {
        get() {
          return () => {
            const value = oxssy.value;
            if (this.mixins[name].activate(value, value)) {
              return oxssy.notify(null);
            }
            return Promise.resolve();
          };
        },
      });
    }
  }

  activate(value, previousValue) {
    const computed = this.compute(value, previousValue);
    if (shallowEqual(this.property, computed)) {
      return false;
    }
    this.property = computed;
    return true;
  }

  compute() {
    return null;
  }

  onUpdate(value, previousValue) {
    if (this.activateOnUpdate) {
      return this.activate(value, previousValue);
    }
    return false;
  }
}
