import PropTypes from 'prop-types';
import { Conduit } from './EmitterReceiver';
import { mapEval } from './util';


const getDataMapPropType = oxssyMap => PropTypes.exact(Object.entries(oxssyMap).reduce(
  (obj, [key, data]) => {
    const result = obj;
    result[key] = data.validator.propType;
    return result;
  },
  {},
)).isRequired;

class OxssyMap {
  constructor(oxssyMap, transform = null) {
    this.oxssyMap = oxssyMap;
    this.transform = transform;
    this.validator.propType = getDataMapPropType(this.oxssyMap);
    this.cachedValue = {};
    this.subscribedTo = new Set();
    this.emitters().forEach(emitter => this.subscribeTo(emitter));
  }

  emitters() {
    return Object.values(this.oxssyMap);
  }

  get value() {
    if (this.dirty) {
      if (typeof this.transform === 'function') {
        this.cachedValue = this.transform(mapEval(this.oxssyMap));
      } else {
        this.cachedValue = mapEval(this.oxssyMap);
      }
      this.dirty = false;
    }
    return this.cachedValue;
  }

  get type() {
    return this.validator;
  }

  update(value, strict = false) {
    const childPromises = [];
    Object.entries(value).forEach(([key, subValue]) => {
      const child = this.oxssyMap[key];
      if (child) {
        childPromises.push(child.update(subValue));
      } else if (strict) {
        return Promise.reject(new Error('Invalid key for update'));
      }
    })
    return Promise.all(childPromises);
  }

  reset() {
    return Promise.all(this.emitters().map(emitter => emitter.reset()));
  }

  validator() {
    for (const emitter of this.emitters()) {
      const emitterError = emitter.validate();
      if (emitterError !== null) {
        return emitterError;
      }
    }
    return null;
  }
}
export default Conduit(OxssyMap);
