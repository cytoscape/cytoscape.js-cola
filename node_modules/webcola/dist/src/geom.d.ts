export declare class Point {
    x: number;
    y: number;
}
export declare class LineSegment {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    constructor(x1: number, y1: number, x2: number, y2: number);
}
export declare class PolyPoint extends Point {
    polyIndex: number;
}
export declare function isLeft(P0: Point, P1: Point, P2: Point): number;
export declare function ConvexHull(S: Point[]): Point[];
export declare function clockwiseRadialSweep(p: Point, P: Point[], f: (p: Point) => void): void;
export declare function tangent_PolyPolyC(V: Point[], W: Point[], t1: (a: Point, b: Point[]) => number, t2: (a: Point, b: Point[]) => number, cmp1: (a: Point, b: Point, c: Point) => boolean, cmp2: (a: Point, b: Point, c: Point) => boolean): {
    t1: number;
    t2: number;
};
export declare function LRtangent_PolyPolyC(V: Point[], W: Point[]): {
    t1: number;
    t2: number;
};
export declare function RLtangent_PolyPolyC(V: Point[], W: Point[]): {
    t1: number;
    t2: number;
};
export declare function LLtangent_PolyPolyC(V: Point[], W: Point[]): {
    t1: number;
    t2: number;
};
export declare function RRtangent_PolyPolyC(V: Point[], W: Point[]): {
    t1: number;
    t2: number;
};
export declare class BiTangent {
    t1: number;
    t2: number;
    constructor(t1: number, t2: number);
}
export declare class BiTangents {
    rl: BiTangent;
    lr: BiTangent;
    ll: BiTangent;
    rr: BiTangent;
}
export declare class TVGPoint extends Point {
    vv: VisibilityVertex;
}
export declare class VisibilityVertex {
    id: number;
    polyid: number;
    polyvertid: number;
    p: TVGPoint;
    constructor(id: number, polyid: number, polyvertid: number, p: TVGPoint);
}
export declare class VisibilityEdge {
    source: VisibilityVertex;
    target: VisibilityVertex;
    constructor(source: VisibilityVertex, target: VisibilityVertex);
    length(): number;
}
export declare class TangentVisibilityGraph {
    P: TVGPoint[][];
    V: VisibilityVertex[];
    E: VisibilityEdge[];
    constructor(P: TVGPoint[][], g0?: {
        V: VisibilityVertex[];
        E: VisibilityEdge[];
    });
    addEdgeIfVisible(u: TVGPoint, v: TVGPoint, i1: number, i2: number): void;
    addPoint(p: TVGPoint, i1: number): VisibilityVertex;
    private intersectsPolys(l, i1, i2);
}
export declare function tangents(V: Point[], W: Point[]): BiTangents;
export declare function polysOverlap(p: Point[], q: Point[]): boolean;
