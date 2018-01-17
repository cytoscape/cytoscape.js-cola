import { Layout, EventType, Event } from './layout';
import { ID3StyleLayoutAdaptor } from './d3adaptor';
export declare class D3StyleLayoutAdaptor extends Layout implements ID3StyleLayoutAdaptor {
    event: any;
    trigger(e: Event): void;
    kick(): void;
    drag: () => any;
    constructor();
    on(eventType: EventType | string, listener: () => void): this;
}
export declare function d3adaptor(): D3StyleLayoutAdaptor;
