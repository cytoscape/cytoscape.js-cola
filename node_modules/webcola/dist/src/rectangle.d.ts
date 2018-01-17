import { Constraint, Variable } from './vpsc';
import { Point } from './geom';
export interface Leaf {
    bounds: Rectangle;
    variable: Variable;
}
export interface ProjectionGroup {
    bounds: Rectangle;
    padding: number;
    stiffness: number;
    leaves: Leaf[];
    groups: ProjectionGroup[];
    minVar: Variable;
    maxVar: Variable;
}
export declare function computeGroupBounds(g: ProjectionGroup): Rectangle;
export declare class Rectangle {
    x: number;
    X: number;
    y: number;
    Y: number;
    constructor(x: number, X: number, y: number, Y: number);
    static empty(): Rectangle;
    cx(): number;
    cy(): number;
    overlapX(r: Rectangle): number;
    overlapY(r: Rectangle): number;
    setXCentre(cx: number): void;
    setYCentre(cy: number): void;
    width(): number;
    height(): number;
    union(r: Rectangle): Rectangle;
    lineIntersections(x1: number, y1: number, x2: number, y2: number): Array<Point>;
    rayIntersection(x2: number, y2: number): Point;
    vertices(): Point[];
    static lineIntersection(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): Point;
    inflate(pad: number): Rectangle;
}
export declare function makeEdgeBetween(source: Rectangle, target: Rectangle, ah: number): {
    sourceIntersection: Point;
    targetIntersection: Point;
    arrowStart: Point;
};
export declare function makeEdgeTo(s: {
    x: number;
    y: number;
}, target: Rectangle, ah: number): Point;
export declare function generateXConstraints(rs: Rectangle[], vars: Variable[]): Constraint[];
export declare function generateYConstraints(rs: Rectangle[], vars: Variable[]): Constraint[];
export declare function generateXGroupConstraints(root: ProjectionGroup): Constraint[];
export declare function generateYGroupConstraints(root: ProjectionGroup): Constraint[];
export declare function removeOverlaps(rs: Rectangle[]): void;
export interface GraphNode extends Leaf {
    fixed: boolean;
    fixedWeight?: number;
    width: number;
    height: number;
    x: number;
    y: number;
    px: number;
    py: number;
}
export declare class IndexedVariable extends Variable {
    index: number;
    constructor(index: number, w: number);
}
export declare class Projection {
    private nodes;
    private groups;
    private rootGroup;
    private avoidOverlaps;
    private xConstraints;
    private yConstraints;
    private variables;
    constructor(nodes: GraphNode[], groups: ProjectionGroup[], rootGroup?: ProjectionGroup, constraints?: any[], avoidOverlaps?: boolean);
    private createSeparation(c);
    private makeFeasible(c);
    private createAlignment(c);
    private createConstraints(constraints);
    private setupVariablesAndBounds(x0, y0, desired, getDesired);
    xProject(x0: number[], y0: number[], x: number[]): void;
    yProject(x0: number[], y0: number[], y: number[]): void;
    projectFunctions(): {
        (x0: number[], y0: number[], r: number[]): void;
    }[];
    private project(x0, y0, start, desired, getDesired, cs, generateConstraints, updateNodeBounds, updateGroupBounds);
    private solve(vs, cs, starting, desired);
}
