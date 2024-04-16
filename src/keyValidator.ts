import { KEY_SEPERATOR, KeyOperator, ParsedKey } from './keyOperator';

const VALIDATION_ERROR = {
  backslashMissing: (key: string) => {
    throw new Error(
      `A valid sorting_key value must be numerator and denominator seperated by a "/" character - found violating key: ${key}`
    );
  },
  tooManyValues: (key: string) => {
    throw new Error(
      `Invalid sorting_key value format. Expected "<numerator>/<denominator>, found violating key ${key}`
    );
  },
  invalidIntegers: (key: string) => {
    throw new Error(
      `One of the numerator or denominator was not a valid integer on sorting_key value ${key}`
    );
  }
};

const INTEGERS_PER_KEY = 2;

export class KeyValidator {
  /**
   *
   * validateItems()
   *
   * Validate all submitted items are of the expected format
   *
   */
  public validateItems = (items: any[], sorting_key: string) => {
    for (const item of items) {
      this.isValidSortKey(item[sorting_key]);
    }
  };

  /**
   *
   * isValidSortKey()
   *
   * Validate all sorting_key values are of the correct format
   * Throws on any format violations
   * @param key
   *
   */
  public isValidSortKey = (key: string) => {
    if (!key.includes(KEY_SEPERATOR)) {
      VALIDATION_ERROR.backslashMissing(key);
    }

    const values = key.split(KEY_SEPERATOR);
    if (values.length !== INTEGERS_PER_KEY) {
      VALIDATION_ERROR.tooManyValues(key);
    }

    const [numeratorString, denominatorString] = values;
    try {
      parseInt(numeratorString);
      parseInt(denominatorString);
    } catch (_err) {
      VALIDATION_ERROR.invalidIntegers(key);
    }
  };

  /**
   *
   * isAllowedKey()
   *
   * Ensures a proposed key for an item is not already taken
   * 
   */
  public isAllowedKey(items: any[], sorting_key: string, proposed_key: ParsedKey) {
    const serialisedKey = KeyOperator.serializeKey(proposed_key)
    return items.map((x) => x[sorting_key]).includes(serialisedKey);
  }
}
