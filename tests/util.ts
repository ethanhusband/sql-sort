import { v4 as uuid } from 'uuid';
import SQLSorter from '../src';

interface Item {
  id: string;
}

export const generateArrayWithUUIDs = (size: number): Item[] => {
  const array: Item[] = [];

  console.log(`generating array of ${size} items`);
  for (let i = 0; i < size; i++) {
    array.push({ id: uuid() });
  }

  return array;
};

export const shuffleItemsRandomly = (items: Item[], iterations: number) => {
  const sorter = new SQLSorter(items, false);

  console.log(`randomly shuffing ${items.length} items ${iterations} times`);
  for (let i = 0; i < iterations; i++) {
    const randomlySelected = Math.floor(Math.random() * items.length);
    const randomInsertAt = Math.floor(Math.random() * items.length);
    console.debug(`sorting item at ${randomlySelected} to ${randomInsertAt}`);

    sorter.sortToIndex(randomlySelected, randomInsertAt);
    
  }

  return sorter.sorted()
};
