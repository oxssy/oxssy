import { datatype } from './validation';
import { Emitter } from './EmitterReceiver';
import { shallowEqual } from './util';


function handleChange(e) {
  this.value = e.target.value;
}

class Oxssy {
  constructor(type, value = null, hasHandler = false, resetOnUnsubscribe = false) {
    this.validator = type || datatype.any;
    this.cachedValue = value;
    this.resetOnUnsubscribe = resetOnUnsubscribe;
    if (hasHandler) {
      this.handler = handleChange.bind(this);
    }
    if (this.validator.baseType === 'array') {
      this.enableArrayOps();
    }
  }

  get value() {
    return this.cachedValue;
  }

  get type() {
    return this.validator;
  }

  enableArrayOps() {
    const arrayOps = ['fill', 'pop', 'push', 'reverse', 'shift', 'splice', 'sort', 'unshift'];
    arrayOps.forEach((opName) => {
      this[opName] = function op(...params) {
        const result = this.cachedValue[opName](...params);
        return this.emit().then(() => result);
      };
    });
  }

  update(value) {
    if (shallowEqual(value, this.cachedValue)) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      this.cachedValue = value;
      resolve();
    }).then(() => this.emit());
  }

  reset() {
    return this.update(null);
  }
}

export default Emitter(Oxssy);
