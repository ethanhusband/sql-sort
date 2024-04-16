export const KEY_SEPERATOR = '/';

export type SortingKey = string; // "int/int"
export type Numerator = number;
export type Denominator = number;
export type ParsedKey = [Numerator, Denominator];

export class KeyOperator {
  static extractSegregatedKeys(items: any[], sorting_key: string) {
    const numerators: number[] = [];
    const denominators: number[] = [];

    for (const item of items) {
      const [numeratorString, denominatorString] = item[sorting_key].split(KEY_SEPERATOR);

      numerators.push(parseInt(numeratorString));
      denominators.push(parseInt(denominatorString));
    }

    return { numerators, denominators };
  }

  static extractKey(item: any, sorting_key: string): ParsedKey {
    return this.parseKey(item[sorting_key]);
  }

  static parseKey(key: string): ParsedKey {
    const [numeratorString, denominatorString] = key.split(KEY_SEPERATOR);
    return [parseInt(numeratorString), parseInt(denominatorString)];
  }

  static serializeKey(key: ParsedKey) {
    return `${key[0]}/${key[1]}`;
  }

  static extractDenominator(item: any, sorting_key: string) {
    const [_, denominatorString] = item[sorting_key].split(KEY_SEPERATOR);
    return parseInt(denominatorString);
  }

  static mint(numerator: Numerator | string, denominator: Denominator | string) {
    return `${numerator}${KEY_SEPERATOR}${denominator}`;
  }
}
