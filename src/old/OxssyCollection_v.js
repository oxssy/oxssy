import { errorCode, ValidationError } from './validation';
import { Observable, Observer } from './Observer';
import { shallowEqual } from './util';


const Relay = Class => class extends Observer(Observable(Class)) {
  promiseNotified(messageId) {
    this.isNull = false;
    if (!this.observers || this.observers.size === 0) {
      this.isOutdated = true;
      return Promise.resolve();
    }
    return this.maybeNotifyAfter(() => Promise.resolve(), messageId);
  }
};

class OxssyCollection {
  constructor(isRequired = true, transform = null, translateError = null) {
    this.transform = transform;
    this.cachedValue = null;
    this.validationError = null;
    this.isNull = false;
    this.isOutdated = true;
    this.isRequired = isRequired;
    this.translateError = translateError;
  }

  get validation() {
    if (this.isOutdated) {
      this.recache();
    }
    if (this.isNull) {
      return this.translateError
        ? this.translateError(this.validationError)
        : this.validationError;
    }
    return this.validationError;
  }

  get value() {
    if (this.isOutdated) {
      this.recache();
    }
    return this.cachedValue;
  }

  maybeNotifyAfter(promiseFunction, messageId, excluded = null) {
    const previousValue = this.cachedValue;
    const previousValidation = this.validationError;
    this.isOutdated = true;
    return promiseFunction().then(() => {
      this.recache();
      if (
        previousValue === this.cachedValue
        && previousValidation === this.validationError
      ) {
        return Promise.resolve();
      }
      return this.notify(messageId, excluded);
    });
  }

  observeChild(key, child) {
    if (!child || !child.onObserve) {
      throw new Error(`OxssyCollection: invalid value ${child} for key ${key}`);
    }
    child.onObserve(this);
  }

  recache() {
    this.isOutdated = false;
    if (this.isNull) {
      this.cachedValue = null;
      this.validationError = this.isRequired ? errorCode.REQUIRED : null;
      return;
    }
    const value = typeof this.transform === 'function'
      ? this.transform(this.childrenEval())
      : this.childrenEval();
    if (!shallowEqual(value, this.cachedValue)) {
      this.cachedValue = value;
    }
    const validationError = this.childrenEval(true);
    if (!shallowEqual(validationError, this.validationError)) {
      this.validationError = validationError;
    }
  }

  reset(excluded = null) {
    return this.maybeNotifyAfter(
      () => Promise.all(this.children().map(child => child.reset(this))),
      null,
      excluded,
    );
  }

  setNull(isNull = false) {
    if (this.isNull === isNull) {
      return Promise.resolve();
    }
    this.isNull = isNull;
    return this.reset();
  }

  unsetValidationError(excluded = null) {
    return this.maybeNotifyAfter(
      () => Promise.all(this.children().map(child => child.unsetValidationError(this))),
      null,
      excluded,
    );
  }

  validate(rejectOnError = false, excluded = null) {
    let shouldReject = false;
    return this.maybeNotifyAfter(
      this.isNull
        ? () => new Promise((resolve) => {
          shouldReject = this.isRequired && rejectOnError;
          resolve();
        })
        : () => Promise.all(this.children().map(child => child.validate(true, this)))
          .catch(() => { shouldReject = rejectOnError; }),
      null,
      excluded,
    ).then(() => (shouldReject
      ? Promise.reject(new ValidationError(
        this,
        this.isNull ? errorCode.REQUIRED : errorCode.INVALID_VALUE,
      ))
      : Promise.resolve()
    ));
  }
}

export default Relay(OxssyCollection);
