import { LinkAccessor } from './linklengths';
export interface LinkTypeAccessor<Link> extends LinkAccessor<Link> {
    getType(l: Link): number;
}
export declare class PowerEdge {
    source: any;
    target: any;
    type: number;
    constructor(source: any, target: any, type: number);
}
export declare class Configuration<Link> {
    private linkAccessor;
    modules: Module[];
    roots: ModuleSet[];
    R: number;
    constructor(n: number, edges: Link[], linkAccessor: LinkTypeAccessor<Link>, rootGroup?: any[]);
    private initModulesFromGroup(group);
    merge(a: Module, b: Module, k?: number): Module;
    private rootMerges(k?);
    greedyMerge(): boolean;
    private nEdges(a, b);
    getGroupHierarchy(retargetedEdges: PowerEdge[]): any[];
    allEdges(): PowerEdge[];
    static getEdges(modules: ModuleSet, es: PowerEdge[]): void;
}
export declare class Module {
    id: number;
    outgoing: LinkSets;
    incoming: LinkSets;
    children: ModuleSet;
    definition: any;
    gid: number;
    constructor(id: number, outgoing?: LinkSets, incoming?: LinkSets, children?: ModuleSet, definition?: any);
    getEdges(es: PowerEdge[]): void;
    isLeaf(): boolean;
    isIsland(): boolean;
    isPredefined(): boolean;
}
export declare class ModuleSet {
    table: any;
    count(): number;
    intersection(other: ModuleSet): ModuleSet;
    intersectionCount(other: ModuleSet): number;
    contains(id: number): boolean;
    add(m: Module): void;
    remove(m: Module): void;
    forAll(f: (m: Module) => void): void;
    modules(): Module[];
}
export declare class LinkSets {
    sets: any;
    n: number;
    count(): number;
    contains(id: number): boolean;
    add(linktype: number, m: Module): void;
    remove(linktype: number, m: Module): void;
    forAll(f: (ms: ModuleSet, linktype: number) => void): void;
    forAllModules(f: (m: Module) => void): void;
    intersection(other: LinkSets): LinkSets;
}
export declare function getGroups<Link>(nodes: any[], links: Link[], la: LinkTypeAccessor<Link>, rootGroup?: any[]): {
    groups: any[];
    powerEdges: PowerEdge[];
};
