import { LinkLengthAccessor } from './linklengths';
import { Rectangle } from './rectangle';
export declare enum EventType {
    start = 0,
    tick = 1,
    end = 2,
}
export interface Event {
    type: EventType;
    alpha: number;
    stress?: number;
    listener?: () => void;
}
export interface InputNode {
    index?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fixed?: number;
}
export interface Node extends InputNode {
    x: number;
    y: number;
}
export interface Group {
    bounds?: Rectangle;
    leaves?: Node[];
    groups?: Group[];
    padding: number;
}
export interface Link<NodeRefType> {
    source: NodeRefType;
    target: NodeRefType;
    length?: number;
    weight?: number;
}
export declare type LinkNumericPropertyAccessor = (t: Link<Node | number>) => number;
export interface LinkLengthTypeAccessor extends LinkLengthAccessor<Link<Node | number>> {
    getType: LinkNumericPropertyAccessor;
}
export declare class Layout {
    private _canvasSize;
    private _linkDistance;
    private _defaultNodeSize;
    private _linkLengthCalculator;
    private _linkType;
    private _avoidOverlaps;
    private _handleDisconnected;
    private _alpha;
    private _lastStress;
    private _running;
    private _nodes;
    private _groups;
    private _rootGroup;
    private _links;
    private _constraints;
    private _distanceMatrix;
    private _descent;
    private _directedLinkConstraints;
    private _threshold;
    private _visibilityGraph;
    private _groupCompactness;
    protected event: any;
    on(e: EventType | string, listener: (event?: Event) => void): this;
    protected trigger(e: Event): void;
    protected kick(): void;
    protected tick(): boolean;
    private updateNodePositions();
    nodes(): Array<Node>;
    nodes(v: Array<InputNode>): this;
    groups(): Array<Group>;
    groups(x: Array<Group>): this;
    powerGraphGroups(f: Function): this;
    avoidOverlaps(): boolean;
    avoidOverlaps(v: boolean): this;
    handleDisconnected(): boolean;
    handleDisconnected(v: boolean): this;
    flowLayout(axis: string, minSeparation: number | ((t: any) => number)): this;
    links(): Array<Link<Node | number>>;
    links(x: Array<Link<Node | number>>): this;
    constraints(): Array<any>;
    constraints(c: Array<any>): this;
    distanceMatrix(): Array<Array<number>>;
    distanceMatrix(d: Array<Array<number>>): this;
    size(): Array<number>;
    size(x: Array<number>): this;
    defaultNodeSize(): number;
    defaultNodeSize(x: number): this;
    groupCompactness(): number;
    groupCompactness(x: number): this;
    linkDistance(): number;
    linkDistance(): LinkNumericPropertyAccessor;
    linkDistance(x: number): this;
    linkDistance(x: LinkNumericPropertyAccessor): this;
    linkType(f: Function | number): this;
    convergenceThreshold(): number;
    convergenceThreshold(x: number): this;
    alpha(): number;
    alpha(x: number): this;
    getLinkLength(link: Link<Node | number>): number;
    static setLinkLength(link: Link<Node | number>, length: number): void;
    getLinkType(link: Link<Node | number>): number;
    linkAccessor: LinkLengthTypeAccessor;
    symmetricDiffLinkLengths(idealLength: number, w?: number): this;
    jaccardLinkLengths(idealLength: number, w?: number): this;
    start(initialUnconstrainedIterations?: number, initialUserConstraintIterations?: number, initialAllConstraintsIterations?: number, gridSnapIterations?: number, keepRunning?: boolean): this;
    private initialLayout(iterations, x, y);
    private separateOverlappingComponents(width, height);
    resume(): this;
    stop(): this;
    prepareEdgeRouting(nodeMargin?: number): void;
    routeEdge(edge: any, draw: any): any[];
    static getSourceIndex(e: Link<Node | number>): number;
    static getTargetIndex(e: Link<Node | number>): number;
    static linkId(e: Link<Node | number>): string;
    static dragStart(d: Node | Group): void;
    private static stopNode(v);
    private static storeOffset(d, origin);
    static dragOrigin(d: Node | Group): {
        x: number;
        y: number;
    };
    static drag(d: Node | Group, position: {
        x: number;
        y: number;
    }): void;
    static dragEnd(d: any): void;
    static mouseOver(d: any): void;
    static mouseOut(d: any): void;
}
