export declare class PositionStats {
    scale: number;
    AB: number;
    AD: number;
    A2: number;
    constructor(scale: number);
    addVariable(v: Variable): void;
    getPosn(): number;
}
export declare class Constraint {
    left: Variable;
    right: Variable;
    gap: number;
    equality: boolean;
    lm: number;
    active: boolean;
    unsatisfiable: boolean;
    constructor(left: Variable, right: Variable, gap: number, equality?: boolean);
    slack(): number;
}
export declare class Variable {
    desiredPosition: number;
    weight: number;
    scale: number;
    offset: number;
    block: Block;
    cIn: Constraint[];
    cOut: Constraint[];
    constructor(desiredPosition: number, weight?: number, scale?: number);
    dfdv(): number;
    position(): number;
    visitNeighbours(prev: Variable, f: (c: Constraint, next: Variable) => void): void;
}
export declare class Block {
    vars: Variable[];
    posn: number;
    ps: PositionStats;
    blockInd: number;
    constructor(v: Variable);
    private addVariable(v);
    updateWeightedPosition(): void;
    private compute_lm(v, u, postAction);
    private populateSplitBlock(v, prev);
    traverse(visit: (c: Constraint) => any, acc: any[], v?: Variable, prev?: Variable): void;
    findMinLM(): Constraint;
    private findMinLMBetween(lv, rv);
    private findPath(v, prev, to, visit);
    isActiveDirectedPathBetween(u: Variable, v: Variable): boolean;
    static split(c: Constraint): Block[];
    private static createSplitBlock(startVar);
    splitBetween(vl: Variable, vr: Variable): {
        constraint: Constraint;
        lb: Block;
        rb: Block;
    };
    mergeAcross(b: Block, c: Constraint, dist: number): void;
    cost(): number;
}
export declare class Blocks {
    vs: Variable[];
    private list;
    constructor(vs: Variable[]);
    cost(): number;
    insert(b: Block): void;
    remove(b: Block): void;
    merge(c: Constraint): void;
    forEach(f: (b: Block, i: number) => void): void;
    updateBlockPositions(): void;
    split(inactive: Constraint[]): void;
}
export declare class Solver {
    vs: Variable[];
    cs: Constraint[];
    bs: Blocks;
    inactive: Constraint[];
    static LAGRANGIAN_TOLERANCE: number;
    static ZERO_UPPERBOUND: number;
    constructor(vs: Variable[], cs: Constraint[]);
    cost(): number;
    setStartingPositions(ps: number[]): void;
    setDesiredPositions(ps: number[]): void;
    private mostViolated();
    satisfy(): void;
    solve(): number;
}
export declare function removeOverlapInOneDimension(spans: {
    size: number;
    desiredCenter: number;
}[], lowerBound?: number, upperBound?: number): {
    newCenters: number[];
    lowerBound: number;
    upperBound: number;
};
