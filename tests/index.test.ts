import SQLSorter from "../src";
import { generateArrayWithUUIDs, shuffleItemsRandomly } from "./util"

const LIST_SIZE = 1000;
const TOTAL_SORTS = 1;

describe("Algorithm benchmarks", () => {
    test(`Random shuffle on ${LIST_SIZE} items`, () => {
        let start = new Date().getTime();
        const array = generateArrayWithUUIDs(100000);

        console.log('initialising array with sorting_keys');
        SQLSorter.initialiseAll(array);

        const sorted = shuffleItemsRandomly(array, 100)

        const runtime = (new Date().getTime() - start) / 1000
        console.log(`sorted ${LIST_SIZE} items ${TOTAL_SORTS} times in ${runtime} seconds`)
    })
})