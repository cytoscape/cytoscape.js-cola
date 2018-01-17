export interface LinkAccessor<Link> {
    getSourceIndex(l: Link): number;
    getTargetIndex(l: Link): number;
}
export interface LinkLengthAccessor<Link> extends LinkAccessor<Link> {
    setLength(l: Link, value: number): void;
}
export declare function symmetricDiffLinkLengths<Link>(links: Link[], la: LinkLengthAccessor<Link>, w?: number): void;
export declare function jaccardLinkLengths<Link>(links: Link[], la: LinkLengthAccessor<Link>, w?: number): void;
export interface IConstraint {
    left: number;
    right: number;
    gap: number;
}
export interface DirectedEdgeConstraints {
    axis: string;
    gap: number;
}
export interface LinkSepAccessor<Link> extends LinkAccessor<Link> {
    getMinSeparation(l: Link): number;
}
export declare function generateDirectedEdgeConstraints<Link>(n: number, links: Link[], axis: string, la: LinkSepAccessor<Link>): IConstraint[];
export declare function stronglyConnectedComponents<Link>(numVertices: number, edges: Link[], la: LinkAccessor<Link>): number[][];
