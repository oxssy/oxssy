import { stringifySymbol } from '../util';

export const errorCode = {
  REQUIRED: Symbol('REQUIRED'),
  ARRAY_EXPECTED: Symbol('ARRAY_EXPECTED'),
  BOOL_EXPECTED: Symbol('BOOL_EXPECTED'),
  FUNC_EXPECTED: Symbol('FUNC_EXPECTED'),
  NUMBER_EXPECTED: Symbol('NUMBER_EXPECTED'),
  OBJECT_EXPECTED: Symbol('OBJECT_EXPECTED'),
  STRING_EXPECTED: Symbol('STRING_EXPECTED'),
  SYMBOL_EXPECTED: Symbol('SYMBOL_EXPECTED'),
  ELEMENT_EXPECTED: Symbol('ELEMENT_EXPECTED'),
  NOT_INSTANCE_OF: Symbol('NOT_INSTANCE_OF'),
  INVALID_VALUE: Symbol('INVALID_VALUE'),
  NODE_EXPECTED: Symbol('NODE_EXPECTED'),
  TOO_SMALL: Symbol('TOO_SMALL'),
  TOO_LARGE: Symbol('TOO_LARGE'),
  TOO_SHORT: Symbol('TOO_SHORT'),
  TOO_LONG: Symbol('TOO_LONG'),
  CHECK_LENGTH: Symbol('CHECK_LENGTH'),
  EMAIL_EXPECTED: Symbol('EMAIL_EXPECTED'),
  URL_EXPECTED: Symbol('URL_EXPECTED'),
  UUID_EXPECTED: Symbol('UUID_EXPECTED'),
  INTEGER_EXPECTED: Symbol('INTEGER_EXPECTED'),
  CHECK_UPPERCASE: Symbol('CHECK_UPPERCASE'),
  CHECK_LOWERCASE: Symbol('CHECK_LOWERCASE'),
  CHECK_NUMERAL: Symbol('CHECK_NUMERAL'),
  CHECK_SPECIAL_CHAR: Symbol('CHECK_SPECIAL_CHAR'),
  CHECK_WHITESPACE: Symbol('CHECK_WHITESPACE'),
  ALPHANUMERIC_EXPECTED: Symbol('ALPHANUMERIC_EXPECTED'),
};

export class ValidationError extends Error {
  constructor(oxssy, code, ...params) {
    super(
      `\`${oxssy.value}\` fails validation with error ${stringifySymbol(code)}`,
      ...params,
    );
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
    this.oxssy = oxssy;
    this.errorCode = code;
  }
}

export const isError = (validationError) => {
  if (validationError === null) { return false; }
  if (typeof validationError === 'string' || typeof validationError === 'symbol') {
    return true;
  }
  if (Array.isArray(validationError)) { return validationError.some(el => isError(el)); }
  return Object.values(validationError).some(child => isError(child));
};
