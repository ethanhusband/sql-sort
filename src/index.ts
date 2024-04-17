import { KeyOperator, ParsedKey, SortingKey } from './keyOperator';
import { KeyValidator } from './keyValidator';
import { midpointKey, pairwiseLcm } from './util';

const DEFAULT_SORTING_KEY = 'sorting_key';
const DEFAULT_PRIMARY_KEY = 'id';

/**
 *
 * SQL Sorter
 *
 * Sorts an array of items without shifting the array or performing division
 * It does this via a sorting_key on the items, which is a stringified fraction
 *
 * What this prevents is updating the sorting key of a large chunk of items when rearranging a single item
 * Or using floats as a sorting key and risking floating point division errors
 *
 */
export class SQLSorter {
  private is_sorted: boolean;
  private items: any[];
  private primary_key: string;
  private sorting_key: string;

  private validator: KeyValidator = new KeyValidator();

  /**
   *
   * Initialise the SQLSorter, validate format of submitted items if requested
   * @param items
   * @param sorting_key
   * @param validation_required
   *
   */
  constructor(
    items: any[],
    is_sorted: boolean,
    primary_key: string = DEFAULT_PRIMARY_KEY,
    sorting_key: string = DEFAULT_SORTING_KEY,
    validation_required = false
  ) {
    this.is_sorted = is_sorted;
    this.items = items;
    this.primary_key = primary_key;
    this.sorting_key = sorting_key;

    if (validation_required) {
      this.validator.validateItems(items, sorting_key);
    }
  }

  /**
   *
   * sorted()
   *
   * Uses internal algorithm to return the sorted variant of submitted items array
   * @returns sorted items
   *
   */
  public sorted() {
    if (!this.is_sorted) {
      this.sortInternal();
    }

    return this.items.map((x) => {
      const { index, ...item } = x;
      return item;
    });
  }

  /**
   *
   * sortBetweenKeys()
   *
   * Gets a unique sorting key for an item such that it is sorted between two desired key values
   * Also updates internal item keys to easily return correct order in a sorted() call
   *
   * @param id
   * @param lower_bound
   * @param upper_bound
   *
   * @returns the new key of the item being sorted
   *
   */
  public sortBetweenKeys(pk: string, lower_bound: SortingKey, upper_bound: SortingKey) {
    let lowerParsed = KeyOperator.parseKey(lower_bound);
    let upperParsed = KeyOperator.parseKey(upper_bound);

    let newKey = midpointKey(lowerParsed, upperParsed);
    let uniqueKey = this.validator.isAllowedKey(this.items, this.sorting_key, newKey);

    while (!uniqueKey) {
      // Iteratively take midpoints between the bounds until unique key is found
      if (Math.random() > 0.5) {
        lowerParsed = newKey;
      } else {
        upperParsed = newKey;
      }

      newKey = midpointKey(lowerParsed, upperParsed);
      uniqueKey = this.validator.isAllowedKey(this.items, this.sorting_key, newKey);
    }

    const targetItem = this.items.find((x) => x[this.primary_key] === pk);
    targetItem[this.sorting_key] = KeyOperator.serializeKey(newKey);

    this.sortInternal();

    return newKey;
  }

  /**
   *
   * sortToIndex()
   *
   * Sort an item to be at a particular index
   * Because this uses the surrounding keys, it requires that the items are sorted beforehand
   * Note: This will assume that the item already existing at said index will get pushed ABOVE
   *
   * @param id
   * @param lower_bound
   * @param upper_bound
   *
   * @returns the new key of the item being sorted
   *
   */
  public sortToIndex(currentIndex: number, targetIndex: number) {
    if (!this.is_sorted) {
      this.sortInternal();
    }

    // Edge case - bottom key
    if (targetIndex === 0) {
      this.handleBottomCase();
      return
    }

    // Edge case - top key
    if (targetIndex === this.items.length) {
      this.handleTopCase()
      return;
    }

    const pk = this.items[currentIndex][this.primary_key];

    const lowerBound = this.items[targetIndex - 1][this.sorting_key];
    const upperBound = this.items[targetIndex][this.sorting_key];

    return this.sortBetweenKeys(pk, lowerBound, upperBound);
  }

  /**
   *
   * initialiseAll()
   *
   * If you're registering keys on your items for the first time, use this
   * Will initialise all keys of form
   *
   */
  static initialiseAll(items: any[], sorting_key: string = DEFAULT_SORTING_KEY) {
    for (const i in items) {
      items[i][sorting_key] = KeyOperator.mint(parseInt(i) + 1, 1);
    }
    return items;
  }

  /**
   *
   * sortInternal()
   *
   * Will sort what is stored on this.items, readying for return
   *
   */
  private sortInternal() {
    const { numerators, denominators } = KeyOperator.extractSegregatedKeys(
      this.items,
      this.sorting_key
    );

    const multiplier = pairwiseLcm(denominators);

    for (const i in this.items) {
      const target = this.items[i];
      target.index = numerators[i] * denominators[i] * multiplier;
    }

    this.items = this.items.sort((a: any, b: any) => a.index - b.index);
    this.is_sorted = true;
  }

  private handleBottomCase() {
    let bottomKey: ParsedKey = [1, 1];

    while (!this.validator.isAllowedKey(this.items, this.sorting_key, bottomKey)) {
      bottomKey[1] += 1;
    }

    this.items[0][this.sorting_key] = bottomKey;
    this.sortInternal();
  }

  private handleTopCase() {
    let topKey: ParsedKey = [this.items.length, 1];

    while (!this.validator.isAllowedKey(this.items, this.sorting_key, topKey)) {
      topKey[0] += 1;
    }
    this.items[this.items.length][this.sorting_key] = topKey;
    this.sortInternal();
  }
}

export default SQLSorter;
