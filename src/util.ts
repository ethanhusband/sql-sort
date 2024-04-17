import { ParsedKey } from "./keyOperator";

const gcd = (a: number, b: number): number => (a ? gcd(b % a, a) : b);

const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

export const pairwiseLcm = (numbers: number[]) => numbers.reduce(lcm);

export const midpointKey = (a: ParsedKey, b: ParsedKey): ParsedKey => {
    let newNum = a[0] + b[0];
    let newDom = a[1] + b[1];

    // Factorise
    const divisor = gcd(newNum, newDom);
    newNum = ~~(newNum / divisor)
    newDom = ~~(newDom / divisor)

    return [newNum, newDom];
}
