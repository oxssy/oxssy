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
} // TODO add HTML 5 support; add promises for time debounce

class Oxssy {
  constructor(value = null, hasHandler = false) {
    this.mixins = {};
    this.cachedValue = value;
    if (hasHandler) {
      this.handleChange = handleChange.bind(this);
    }
  }

  destroy() {}

  get handler() {
    return this.handleChange || null;
  }

  get value() {
    return this.cachedValue;
  }

  get isOxssy() {
    return true;
  }

  update(value, excluded = null) {
    if (shallowEqual(value, this.cachedValue)) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.cachedValue = value;
      Object.values(this.mixins).forEach(mixin => mixin.update(value));
      resolve();
    }).then(() => this.notify(null, excluded));
  }

  reset(excluded = null) {
    return this.update(null, excluded);
  }
}

export default Observable(Oxssy);
