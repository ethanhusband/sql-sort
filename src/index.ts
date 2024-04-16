import { KeyOperator, SortingKey } from './keyOperator';
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
  private items: any[];
  private primary_key: string;
  private sorting_key: string;
  private validator: KeyValidator;

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
    primary_key: string = DEFAULT_PRIMARY_KEY,
    sorting_key: string = DEFAULT_SORTING_KEY,
    validation_required = false
  ) {
    if (validation_required) {
      this.validator.validateItems(items, sorting_key);
    }

    this.items = items;
    this.primary_key = primary_key;
    this.sorting_key = sorting_key;
  }

  /**
   *
   * sorted()
   *
   * Uses algorithm to return the sorted variant of submitted items array
   * Will leave the sorting index present on the item
   * @returns sorted items
   *
   */
  public sorted() {
    const { numerators, denominators } = KeyOperator.extractSegregatedKeys(
      this.items,
      this.sorting_key
    );

    const multiplier = pairwiseLcm(denominators);

    for (const i in this.items) {
      const target = this.items[i];
      target.index = numerators[i] * denominators[i] * multiplier;
    }

    return this.items.sort((a: any, b: any) => a.index - b.index);
  }

  /**
   *
   * sortBetween()
   *
   * Where the magic happens
   * Gets a unique sorting key for an item such that it is sorted between two desired items
   *
   * @param id
   * @param lowerBound
   * @param upperbound
   *
   * @returns the new key of the item being sorted
   *
   */
  public sortBetween(pk: string, lower_bound: SortingKey, upper_bound: SortingKey) {
    let lowerParsed = KeyOperator.parseKey(lower_bound);
    let upperParsed = KeyOperator.parseKey(upper_bound);

    let newKey = upperParsed;
    let uniqueKey = false;

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
    targetItem[this.sorting_key] = newKey;

    return newKey;
  }

  /**
   *
   * initialiseAll()
   *
   * If you're registering keys on your items for the first time, use this
   *
   */
  public initialiseAll(items: any[]) {
    for (const i in this.items) {
      this.items[i][this.sorting_key] = KeyOperator.mint(i, i);
    }
    return this.items;
  }
}
