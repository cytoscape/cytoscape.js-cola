import { Descent } from './descent';
import { GraphNode, Rectangle } from './rectangle';
import { Variable } from './vpsc';
export declare class Link3D {
    source: number;
    target: number;
    length: number;
    constructor(source: number, target: number);
    actualLength(x: number[][]): number;
}
export declare class Node3D implements GraphNode {
    x: number;
    y: number;
    z: number;
    fixed: boolean;
    width: number;
    height: number;
    px: number;
    py: number;
    bounds: Rectangle;
    variable: Variable;
    constructor(x?: number, y?: number, z?: number);
}
export declare class Layout3D {
    nodes: Node3D[];
    links: Link3D[];
    idealLinkLength: number;
    static dims: string[];
    static k: number;
    result: number[][];
    constraints: any[];
    constructor(nodes: Node3D[], links: Link3D[], idealLinkLength?: number);
    linkLength(l: Link3D): number;
    useJaccardLinkLengths: boolean;
    descent: Descent;
    start(iterations?: number): Layout3D;
    tick(): number;
}
