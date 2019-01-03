import { errorCode } from './error';

const isString = value => typeof value === 'string';
const isEmail = value => new RegExp('^(([^<>()\\[\\]\\\\.,;:\\s@"]+' +
  '(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@' +
  '((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])' +
  '|(([a-z\\-0-9]+\\.)+[a-z]{2,}))$', 'i').test(value);
const isUrl = value => new RegExp('^(https?:\\/\\/)?' +
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
  '((\\d{1,3}\\.){3}\\d{1,3}))' +
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
  '(\\?[;&a-z\\d%_.~+=-]*)?' +
  '(\\#[-a-z\\d_]*)?$', 'i').test(value);
const isUuid = value => /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
  .test(value);


const option = {
  greaterThan: (value, spec) => (value <= spec ? errorCode.TOO_SMALL : null),
  greaterThanEqual: (value, spec) => (value < spec ? errorCode.TOO_SMALL : null),
  lessThan: (value, spec) => (value >= spec ? errorCode.TOO_LARGE : null),
  lessThanEqual: (value, spec) => (value > spec ? errorCode.TOO_LARGE : null),
  notEqual: (value, spec) => (value == spec ? errorCode.INVALID_VALUE : null),
  equal: (value, spec) => (value != spec ? errorCode.INVALID_VALUE : null),

  notEmpty: value => (!Object.keys(value).length ? errorCode.INVALID_VALUE : null),
  longerThan: (value, spec) => (Object.keys(value).length <= spec
    ? errorCode.TOO_SHORT : null),
  longerThanEqual: (value, spec) => (Object.keys(value).length < spec
    ? errorCode.TOO_SHORT : null),
  shorterThan: (value, spec) => (Object.keys(value).length >= spec
    ? errorCode.TOO_LONG : null),
  shorterThanEqual: (value, spec) => (Object.keys(value).length > spec
    ? errorCode.TOO_LONG : null),
  length: (value, spec) => (!Object.keys(value).length !== spec
    ? errorCode.CHECK_LENGTH : null),

  containsUpperCase: value => (!(isString(value) && /[A-Z]/.test(value))
    ? errorCode.CHECK_UPPERCASE : null),
  notContainsUpperCase: value => (!(isString(value) && !/[A-Z]/.test(value))
    ? errorCode.CHECK_UPPERCASE : null),
  containsLowerCase: value => (!(isString(value) && /[a-z]/.test(value))
    ? errorCode.CHECK_LOWERCASE : null),
  notContainsLowerCase: value => (!(isString(value) && !/[a-z]/.test(value))
    ? errorCode.CHECK_LOWERCASE : null),
  containsNumeral: value => (!(isString(value) && /\d/.test(value))
    ? errorCode.CHECK_NUMERAL : null),
  notContainsNumeral: value => (!(isString(value) && !/\d/.test(value))
    ? errorCode.CHECK_NUMERAL : null),
  containsSpecialChar: value => (!(isString(value)
    && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value))
    ? errorCode.CHECK_SPECIAL_CHAR : null),
  notContainsSpecialChar: value => (!(isString(value)
    && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value))
    ? errorCode.CHECK_SPECIAL_CHAR : null),
  containsWhitespace: value => (!(isString(value) && /\s/.test(value))
    ? errorCode.CHECK_WHITESPACE : null),
  notContainsWhitespace: value => (!(isString(value) && !/\s/.test(value))
    ? errorCode.CHECK_WHITESPACE : null),
  isAlphanumeric: value => (!(isString(value) && /^[a-z0-9]*$/i.test(value))
    ? errorCode.ALPHANUMERIC_EXPECTED : null),
  match: (value, spec) => (!spec.test(value)
    ? errorCode.INVALID_VALUE : null),

  isEmail: value => (!(isString(value) && isEmail(value)) ? errorCode.EMAIL_EXPECTED : null),
  isUrl: value => (!(isString(value) && isUrl(value)) ? errorCode.URL_EXPECTED : null),
  isUuid: value => (!(isString(value) && isUuid(value)) ? errorCode.UUID_EXPECTED : null),

  isNumeric: value => (isNaN(value) ? errorCode.NUMBER_EXPECTED : null),
  isInteger: value => ((isNaN(value) || !Number.isInteger(+value))
    ? errorCode.INTEGER_EXPECTED : null),
};
export default option;
