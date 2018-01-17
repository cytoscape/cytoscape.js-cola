export declare class TreeBase {
    _root: any;
    size: any;
    _comparator: any;
    clear(): void;
    find(data: any): any;
    findIter: (data: any) => any;
    lowerBound(data: any): Iterator;
    upperBound(data: any): Iterator;
    min(): any;
    max(): any;
    iterator(): Iterator;
    each(cb: any): void;
    reach(cb: any): void;
    _bound(data: any, cmp: any): Iterator;
}
export declare class Iterator {
    _tree: any;
    _ancestors: any;
    _cursor: any;
    constructor(tree: any);
    data(): any;
    next(): any;
    prev(): any;
    _minNode(start: any): void;
    _maxNode(start: any): void;
}
export declare class RBTree<T> extends TreeBase {
    _root: any;
    _comparator: any;
    size: any;
    constructor(comparator: (a: T, b: T) => number);
    insert(data: any): boolean;
    remove(data: any): boolean;
    static is_red(node: any): any;
    static single_rotate(root: any, dir: any): any;
    static double_rotate(root: any, dir: any): any;
}
