import { Point } from './geom';
import { Rectangle } from './rectangle';
export interface NodeAccessor<Node> {
    getChildren(v: Node): number[];
    getBounds(v: Node): Rectangle;
}
export declare class NodeWrapper {
    id: number;
    rect: Rectangle;
    children: number[];
    leaf: boolean;
    parent: NodeWrapper;
    ports: Vert[];
    constructor(id: number, rect: Rectangle, children: number[]);
}
export declare class Vert {
    id: number;
    x: number;
    y: number;
    node: NodeWrapper;
    line: any;
    constructor(id: number, x: number, y: number, node?: NodeWrapper, line?: any);
}
export declare class LongestCommonSubsequence<T> {
    s: T[];
    t: T[];
    length: number;
    si: number;
    ti: number;
    reversed: boolean;
    constructor(s: T[], t: T[]);
    private static findMatch<T>(s, t);
    getSequence(): T[];
}
export interface GridLine {
    nodes: NodeWrapper[];
    pos: number;
}
export declare class GridRouter<Node> {
    originalnodes: Node[];
    groupPadding: number;
    leaves: NodeWrapper[];
    groups: NodeWrapper[];
    nodes: NodeWrapper[];
    cols: GridLine[];
    rows: GridLine[];
    root: any;
    verts: Vert[];
    edges: any;
    backToFront: any;
    obstacles: any;
    passableEdges: any;
    private avg(a);
    private getGridLines(axis);
    private getDepth(v);
    private midPoints(a);
    constructor(originalnodes: Node[], accessor: NodeAccessor<Node>, groupPadding?: number);
    private findLineage(v);
    private findAncestorPathBetween(a, b);
    siblingObstacles(a: any, b: any): any;
    static getSegmentSets(routes: any, x: any, y: any): any[];
    static nudgeSegs(x: string, y: string, routes: any, segments: any, leftOf: any, gap: number): void;
    static nudgeSegments(routes: any, x: string, y: string, leftOf: (e1: number, e2: number) => boolean, gap: number): void;
    routeEdges<Edge>(edges: Edge[], nudgeGap: number, source: (e: Edge) => number, target: (e: Edge) => number): Point[][][];
    static unreverseEdges(routes: any, routePaths: any): void;
    static angleBetween2Lines(line1: Point[], line2: Point[]): number;
    private static isLeft(a, b, c);
    private static getOrder(pairs);
    static orderEdges(edges: any): (l: number, r: number) => boolean;
    static makeSegments(path: Point[]): Point[][];
    route(s: number, t: number): Point[];
    static getRoutePath(route: Point[][], cornerradius: number, arrowwidth: number, arrowheight: number): {
        routepath: string;
        arrowpath: string;
    };
}
