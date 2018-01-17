export declare class Calculator<Link> {
    n: number;
    es: Link[];
    private neighbours;
    constructor(n: number, es: Link[], getSourceIndex: (l: Link) => number, getTargetIndex: (l: Link) => number, getLength: (l: Link) => number);
    DistanceMatrix(): number[][];
    DistancesFromNode(start: number): number[];
    PathFromNodeToNode(start: number, end: number): number[];
    PathFromNodeToNodeWithPrevCost(start: number, end: number, prevCost: (u: number, v: number, w: number) => number): number[];
    private dijkstraNeighbours(start, dest?);
}
