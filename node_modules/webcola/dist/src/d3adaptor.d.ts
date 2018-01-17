import * as d3v4 from './d3v4adaptor';
import { Layout, EventType, Event } from './layout';
export interface D3v3Context {
    version: string;
}
export interface ID3StyleLayoutAdaptor {
    trigger(e: Event): void;
    kick(): void;
    drag: () => any;
    on(eventType: EventType | string, listener: () => void): ID3StyleLayoutAdaptor;
}
export declare function d3adaptor(d3Context?: d3v4.D3Context | D3v3Context): Layout & ID3StyleLayoutAdaptor;
