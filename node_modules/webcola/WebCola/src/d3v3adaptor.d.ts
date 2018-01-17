/// <reference path="../extern/d3v3.d.ts" />
/// <reference path="layout.d.ts" />
import { Layout, EventType, Event } from './layout';
export declare class D3StyleLayoutAdaptor extends Layout {
    event: d3.Dispatch;
    trigger(e: Event): void;
    kick(): void;
    drag: () => any;
    constructor();
    on(eventType: EventType | string, listener: () => void): D3StyleLayoutAdaptor;
}
export declare function d3adaptor(): D3StyleLayoutAdaptor;
