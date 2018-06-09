import { ValidationError } from './error';


export const EMIT_VALIDATE = Symbol('EMIT_VALIDATE');

export const Validated = (Class) => {
  const validatedMixin = {
    validate: function validate() {
      const validationError = this.validator(this.value);
      return validationError;
    },

    validateAndEmit: function validateAndEmit() {
      const error = this.validate();
      return this.emit(EMIT_VALIDATE)
        .then(() => (
          error ? Promise.reject(new ValidationError(this, error)) : Promise.resolve()
        ));
    },
  };
  Object.assign(Class.prototype, validatedMixin);
  return Class;
};
