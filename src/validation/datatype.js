import { isValidElement } from 'react';
import { errorCode } from './error';
import { is } from '../util';

const getValueType = (value) => {
  if (Array.isArray(value)) {
    return 'array';
  }
  const jsType = typeof value;
  if (jsType === 'boolean') return 'bool';
  if (jsType === 'function') return 'func';
  return jsType;
};

const validateOptions = (options, value) => null;

const chainableValidator = (validate) => {
  const validateRequired = (isRequired, value) => {
    if (value === null || value === undefined) {
      return isRequired ? errorCode.REQUIRED : null;
    }
    return validate(value);
  };
  const validator = value => validateRequired(false, value);
  validator.isRequired = value => validateRequired(true, value);
  validator.withOptions = options => (
    value => validator(value) || validateOptions(options, value)
  );
  validator.isRequired.withOptions = options => (
    value => validator.isRequired(value) || validateOptions(options, value)
  );
  validator.baseType = validate.baseType;
  validator.isRequired.baseType = validate.baseType;
  validator.withOptions.baseType = validate.baseType;
  validator.isRequired.withOptions.baseType = validate.baseType;
  return validator;
};

const primitiveValidator = (type) => {
  const validate = (value) => {
    if (getValueType(value) !== type) {
      switch (type) {
        case 'array': return errorCode.ARRAY_EXPECTED;
        case 'bool': return errorCode.BOOLEAN_EXPECTED;
        case 'func': return errorCode.FUNCTION_EXPECTED;
        case 'number': return errorCode.NUMBER_EXPECTED;
        case 'object': return errorCode.OBJECT_EXPECTED;
        case 'string': return errorCode.STRING_EXPECTED;
        case 'symbol': return errorCode.SYMBOL_EXPECTED;
        default: return null;
      }
    }
    return null;
  };
  validate.baseType = type;
  return chainableValidator(validate);
};

const createAnyValidator = () => {
  const validate = () => null;
  return chainableValidator(validate);
};

const arrayOfValidator = (validator) => {
  if (typeof validator !== 'function') {
    throw new Error('invalid validation specification.');
  }
  const validate = (value) => {
    if (!Array.isArray(value)) {
      return errorCode.ARRAY_EXPECTED;
    }
    for (const item of value) {
      const itemError = validator(item);
      if (itemError) { return itemError; }
    }
    return null;
  };
  validate.baseType = 'array';
  return chainableValidator(validate);
};

const elementValidator = () => {
  const validate = value => (isValidElement(value) ? null : errorCode.ELEMENT_EXPECTED);
  validate.baseType = 'object';
  return chainableValidator(validate);
};

const instanceValidator = (expectedClass) => {
  const validate = value => (value instanceof expectedClass ? null : errorCode.NOT_INSTANCE_OF);
  validate.baseType = 'object';
  return chainableValidator(validate);
};

const enumValidator = (expectedValues) => {
  if (!Array.isArray(expectedValues)) {
    throw new Error('Invalid validation specification.');
  }
  const validate = value => (
    expectedValues.some(expected => is(value, expected)) ? null : errorCode.INVALID_VALUE
  );
  return chainableValidator(validate);
};

const objectOfValidator = (validator) => {
  if (typeof validator !== 'function') {
    throw new Error('invalid validation specification.');
  }
  const validate = (value) => {
    if (getValueType(value) !== 'object') { return errorCode.OBJECT_EXPECTED; }
    for (const item of Object.values(value)) {
      const itemError = validator(item);
      if (itemError) { return itemError; }
    }
    return null;
  };
  validate.baseType = 'object';
  return chainableValidator(validate);
};

const unionValidator = (arrayOfValidators) => {
  if (!Array.isArray(arrayOfValidators) || arrayOfValidators.some(v => typeof v !== 'function')) {
    throw new Error('invalid validation specification.');
  }
  const validate = (value) => {
    if (arrayOfValidators.some(v => v(value) === null)) {
      return null;
    }
    return errorCode.INVALID_VALUE;
  };
  return chainableValidator(validate);
};

const nodeValidator = () => {
  const validate = (value) => {
    if (value === null || value === undefined) { return null; }
    const valueType = getValueType(value);
    if (valueType === 'number' || valueType === 'string') { return null; }
    if (valueType === 'bool') { return value ? errorCode.NODE_EXPECTED : null; }
    if (valueType === 'object') {
      if (isValidElement(value)) { return null; }
      if (typeof value[Symbol.iterator] === 'function') {
        if (value[Symbol.iterator] === value.entries) {
          for (const entry of value) { if (validate(entry[1])) { return errorCode.NODE_EXPECTED; } }
        } else {
          for (const entry of value) { if (validate(entry)) { return errorCode.NODE_EXPECTED; } }
        }
        return null;
      }
    }
    return errorCode.NODE_EXPECTED;
  };
  return chainableValidator(validate);
};

const shapeValidator = (shape) => {
  const validate = (value) => {
    if (getValueType(value) !== 'object') { return errorCode.OBJECT_EXPECTED; }
    for (const [key, child] of Object.entries(value)) {
      const childValidator = shape[key];
      if (childValidator) {
        const childError = childValidator(child);
        if (childError) { return childError; }
      }
    }
    return null;
  };

  validate.baseType = 'object';
  return chainableValidator(validate);
};

const strictShapeValidator = (shape) => {
  const validate = (value) => {
    if (getValueType(value) !== 'object') { return errorCode.OBJECT_EXPECTED; }
    const keys = [...Object.keys(shape), ...Object.keys(value)];
    for (const key of keys) {
      const childValidator = shape[key];
      if (!childValidator) { return errorCode.INVALID_VALUE; }
      const childError = childValidator(value[key]);
      if (childError) { return childError; }
    }
    return null;
  };
  validate.baseType = 'object';
  return chainableValidator(validate);
};

const customValidator = (validate) => {
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  PropTypeError.prototype = Error.prototype;
  return chainableValidator(validate);
};

export default {
  array: primitiveValidator('array'),
  bool: primitiveValidator('bool'),
  func: primitiveValidator('func'),
  number: primitiveValidator('number'),
  object: primitiveValidator('object'),
  string: primitiveValidator('string'),
  symbol: primitiveValidator('symbol'),
  any: createAnyValidator(),
  arrayOf: arrayOfValidator,
  element: elementValidator(),
  instanceOf: instanceValidator,
  node: nodeValidator(),
  objectOf: objectOfValidator,
  oneOf: enumValidator,
  oneOfType: unionValidator,
  shape: shapeValidator,
  exact: strictShapeValidator,
  custom: customValidator,
};
