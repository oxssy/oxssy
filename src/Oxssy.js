import { Observable } from './Observer';
import { shallowEqual } from './util';


function handleChange(e) {
  const { target } = e;
  if (target.type === 'checkbox' || target.type === 'radio') {
    return this.update(target.checked);
  }
  if (target.type === 'select-multiple') {
    const selectedValues = [];
    target.options.forEach((option) => {
      if (option.selected) {
        selectedValues.push(option.value);
      }
    });
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

  // eslint-disable-next-line class-methods-use-this
  destroy() {}

  get handler() {
    return this.handleChange || null;
  }

  get value() {
    return this.cachedValue;
  }

  update(value, excluded = null) {
    if (
      Object.values(this.mixins).every(mix => !mix.onUpdate(value, this.cachedValue))
      && shallowEqual(value, this.cachedValue)
    ) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.cachedValue = value;
      resolve();
    }).then(() => this.notify(null, excluded));
  }

  reset(excluded = null) {
    return this.update(null, excluded);
  }
}
Oxssy.prototype.isOxssy = true;

export default Observable(Oxssy);
