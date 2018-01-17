import { dispatch } from 'd3-dispatch';
import { timer } from 'd3-timer';
import { drag as d3drag } from 'd3-drag';
import { Layout, EventType, Event } from './layout';
export interface D3Context {
    timer: typeof timer;
    drag: typeof d3drag;
    dispatch: typeof dispatch;
    event: any;
}
export declare class D3StyleLayoutAdaptor extends Layout {
    private d3Context;
    event: any;
    trigger(e: Event): void;
    kick(): void;
    drag: () => any;
    constructor(d3Context: D3Context);
    on(eventType: EventType | string, listener: () => void): D3StyleLayoutAdaptor;
}
