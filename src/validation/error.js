export const errorCode = {
  REQUIRED: Symbol('REQUIRED'),
  ARRAY_EXPECTED: Symbol('ARRAY_EXPECTED'),
  BOOLEAN_EXPECTED: Symbol('BOOLEAN_EXPECTED'),
  FUNCTION_EXPECTED: Symbol('FUNCTION_EXPECTED'),
  NUMBER_EXPECTED: Symbol('NUMBER_EXPECTED'),
  OBJECT_EXPECTED: Symbol('OBJECT_EXPECTED'),
  STRING_EXPECTED: Symbol('STRING_EXPECTED'),
  SYMBOL_EXPECTED: Symbol('SYMBOL_EXPECTED'),
  ELEMENT_EXPECTED: Symbol('ELEMENT_EXPECTED'),
  NOT_INSTANCE_OF: Symbol('NOT_INSTANCE_OF'),
  INVALID_VALUE: Symbol('INVALID_VALUE'),
  NODE_EXPECTED: Symbol('NODE_EXPECTED'),
};

export class ValidationError extends Error {
  constructor(appstate, code, ...params) {
    const errorString = code.toString().slice(7, -1);
    super(
      `AppState ${appstate.name} fails validation with error ${errorString}`,
      ...params,
    );
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
    this.appstate = appstate;
    this.errorCode = code;
  }
}
