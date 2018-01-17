import { Node, Link, Layout } from './layout';
import { Point } from './geom';
export declare function gridify(pgLayout: any, nudgeGap: number, margin: number, groupMargin: number): Point[][][];
export declare function powerGraphGridLayout(graph: {
    nodes: Node[];
    links: Link<Node>[];
}, size: number[], grouppadding: number): {
    cola: Layout;
    powerGraph: any;
};
