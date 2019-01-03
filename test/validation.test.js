import { datatype, errorCode } from '../src';

describe('boolean validator', () => {
  test('validating required value', () => {
    const testType = datatype.bool;
    const testTypeRequired = datatype.bool.isRequired;
    expect(testType.baseType).toBe('bool');
    expect(testTypeRequired.baseType).toBe('bool');
    expect(testType(null)).toBeNull();
    expect(testTypeRequired(null)).toBe(errorCode.REQUIRED);
    expect(testTypeRequired(true)).toBeNull();
  });
});

describe('string validator', () => {
  test('validating required value', () => {
    const testType = datatype.string;
    const testTypeRequired = datatype.string.isRequired;
    expect(testType.baseType).toBe('string');
    expect(testTypeRequired.baseType).toBe('string');
    expect(testType(null)).toBeNull();
    expect(testTypeRequired(null)).toBe(errorCode.REQUIRED);
    expect(testTypeRequired('anything')).toBeNull();
  });
});

describe('option', () => {
  test('comparison', () => {
    expect(datatype.number.withOption({ greaterThan: 5 })(4)).toBe(errorCode.TOO_SMALL);
    expect(datatype.string.withOption({ greaterThanEqual: 5 })('5')).toBeNull();
    expect(datatype.string.isRequired.withOption({ lessThanEqual: 5 })('6'))
      .toBe(errorCode.TOO_LARGE);
    expect(datatype.number.withOption({ notEqual: 5 })(5)).toBe(errorCode.INVALID_VALUE);
  });
  test('length', () => {
    expect(datatype.string.withOption({ notEmpty: true })('')).toBe(errorCode.INVALID_VALUE);
    expect(datatype.string.isRequired.withOption({ notEmpty: true })('5')).toBeNull();
    expect(datatype.array.isRequired.withOption({ shorterThan: 5 })([1, 2, 3]))
      .toBeNull();
    expect(datatype.array.withOption({ longerThanEqual: 5 })([1, 2, 3]))
      .toBe(errorCode.TOO_SHORT);
    expect(datatype.string.withOption({ length: 4 })('123')).toBe(errorCode.CHECK_LENGTH);
  });
  test('complexity', () => {
    expect(datatype.string.withOption({ containsUpperCase: true })('abc123'))
      .toBe(errorCode.CHECK_UPPERCASE);
    expect(datatype.string.withOption({ notContainsLowerCase: true })('abc123'))
      .toBe(errorCode.CHECK_LOWERCASE);
    expect(datatype.string.withOption({ containsNumeral: true })('abc123')).toBeNull();
    expect(datatype.string.withOption({ containsSpecialChar: true })('abc123'))
      .toBe(errorCode.CHECK_SPECIAL_CHAR);
    expect(datatype.string.withOption({ notContainsWhitespace: true })('abc123')).toBeNull();
    expect(datatype.string.withOption({ isAlphanumeric: true })('abc123')).toBeNull();
  });
  test('regex', () => {
    const partial = datatype.string.withOption({ match: /[abc]+/ });
    expect(partial('aaa')).toBeNull();
    expect(partial('oxssy')).toBe(errorCode.INVALID_VALUE);
    expect(partial('abd')).toBeNull();
    expect(partial('kabc')).toBeNull();
    const full = datatype.string.withOption({ match: /^[abc]+$/ });
    expect(full('abd')).toBe(errorCode.INVALID_VALUE);
    expect(full('kabc')).toBe(errorCode.INVALID_VALUE);
  });
  test('format', () => {
    expect(datatype.string.withOption({ isEmail: true })('tiger@[192.168.0.1]')).toBeNull();
    expect(datatype.string.withOption({ isEmail: true })('tiger@oxssy.com')).toBeNull();
    expect(datatype.string.withOption({ isEmail: true })('tiger<at>oxssy.com'))
      .toBe(errorCode.EMAIL_EXPECTED);
    expect(datatype.string.withOption({ isUrl: true })('oxssy.com')).toBeNull();
    expect(datatype.string.withOption({ isUrl: true })
      ('https://www.advanced.oxssy.com:8080/genius?name=%20euler&')).toBeNull();
    expect(datatype.string.withOption({ isUrl: true })('.www.oxssy.com'))
      .toBe(errorCode.URL_EXPECTED);
    expect(datatype.string.withOption({ isUuid: true })('15acd780-6f87-11e8-adc0-fa7ae01bbebc'))
      .toBeNull();
    expect(datatype.string.withOption({ isUuid: true })('15acd780-6f87-11e8-adc0-fa7ae01bbeb'))
      .toBe(errorCode.UUID_EXPECTED);
  });
  test('numeric', () => {
    expect(datatype.string.withOption({ isNumeric: true })('2.0.1'))
      .toBe(errorCode.NUMBER_EXPECTED);
    expect(datatype.number.withOption({ isNumeric: true })(-20.18)).toBeNull();
    expect(datatype.string.withOption({ isNumeric: true })('-1e18')).toBeNull();
    expect(datatype.string.withOption({ isInteger: true })('20.18'))
      .toBe(errorCode.INTEGER_EXPECTED);
    expect(datatype.number.withOption({ isInteger: true })(-20.18))
      .toBe(errorCode.INTEGER_EXPECTED);
    expect(datatype.string.withOption({ isInteger: true })('-18')).toBeNull();
  });
});
