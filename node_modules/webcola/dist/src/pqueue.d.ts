export declare class PairingHeap<T> {
    elem: T;
    private subheaps;
    constructor(elem: T);
    toString(selector: any): string;
    forEach(f: any): void;
    count(): number;
    min(): T;
    empty(): boolean;
    contains(h: PairingHeap<T>): boolean;
    isHeap(lessThan: (a: T, b: T) => boolean): boolean;
    insert(obj: T, lessThan: any): PairingHeap<T>;
    merge(heap2: PairingHeap<T>, lessThan: any): PairingHeap<T>;
    removeMin(lessThan: (a: T, b: T) => boolean): PairingHeap<T>;
    mergePairs(lessThan: (a: T, b: T) => boolean): PairingHeap<T>;
    decreaseKey(subheap: PairingHeap<T>, newValue: T, setHeapNode: (e: T, h: PairingHeap<T>) => void, lessThan: (a: T, b: T) => boolean): PairingHeap<T>;
}
export declare class PriorityQueue<T> {
    private lessThan;
    private root;
    constructor(lessThan: (a: T, b: T) => boolean);
    top(): T;
    push(...args: T[]): PairingHeap<T>;
    empty(): boolean;
    isHeap(): boolean;
    forEach(f: any): void;
    pop(): T;
    reduceKey(heapNode: PairingHeap<T>, newKey: T, setHeapNode?: (e: T, h: PairingHeap<T>) => void): void;
    toString(selector: any): string;
    count(): number;
}
