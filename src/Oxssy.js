import { datatype, ValidationError } from './validation';
import { Observable } from './Observer';
import { shallowEqual } from './util';


function handleChange(e) {
  const { target } = e;
  if (target.type === 'checkbox' || target.type === 'radio') {
    return this.update(target.checked);
  }
  if (target.type === 'select-multiple') {
    const selectedValues = [];
    for (const option of target.options) {
      if (option.selected) { selectedValues.push(option.value); }
    }
    return this.update(selectedValues);
  }
  return this.update(target.value);
} // TODO add HTML 5 support

class Oxssy {
  constructor(
    type,
    value = null,
    hasHandler = false,
    validatesOnUpdate = false,
    translateError = null,
  ) {
    this.oxssyType = type || datatype.any;
    this.validationError = null;
    this.validatesOnUpdate = validatesOnUpdate;
    this.cachedValue = value;
    this.translateError = translateError;
    if (hasHandler) {
      this.handleChange = handleChange.bind(this);
    }
    if (this.oxssyType.baseType === 'array') {
      this.enableArrayOps();
    }
  }

  destroy() {}

  get handler() {
    return this.handleChange || null;
  }

  get value() {
    return this.cachedValue;
  }

  get validation() {
    return this.translateError
      ? this.translateError(this.validationError)
      : this.validationError;
  }

  enableArrayOps() {
    const arrayOps = ['fill', 'pop', 'push', 'reverse', 'shift', 'splice', 'sort', 'unshift'];
    arrayOps.forEach((opName) => {
      this[opName] = function op(...params) {
        const result = this.cachedValue[opName](...params);
        return this.notify().then(() => result);
      };
    });
  }

  setValidationError(validationError, rejectOnError = false, excluded = null) {
    const changed = this.validationError !== validationError;
    if (changed) {
      this.validationError = validationError;
    }
    return (changed ? this.notify(null, excluded) : Promise.resolve())
      .then(() => ((rejectOnError && validationError)
        ? Promise.reject(new ValidationError(this, validationError))
        : Promise.resolve()));
  }

  update(value, excluded = null) {
    if (shallowEqual(value, this.cachedValue)) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.cachedValue = value;
      if (this.validatesOnUpdate) {
        this.validationError = this.oxssyType(value);
      } else {
        this.validationError = null;
      }
      resolve();
    }).then(() => this.notify(null, excluded));
  }

  unsetValidationError(excluded = null) {
    return this.setValidationError(null, false, excluded);
  }

  validate(rejectOnError = false, excluded = null) {
    return this.setValidationError(this.oxssyType(this.value), rejectOnError, excluded);
  }

  reset(excluded = null) {
    this.validationError = null;
    return this.update(null, excluded);
  }
}

export default Observable(Oxssy);
