import { Layout, EventType, Event } from './layout';
export declare class LayoutAdaptor extends Layout {
    trigger(e: Event): void;
    kick(): void;
    drag(): void;
    on(eventType: EventType | string, listener: () => void): this;
    dragstart: (d: any) => void;
    dragStart: (d: any) => void;
    dragend: (d: any) => void;
    dragEnd: (d: any) => void;
    constructor(options: any);
}
export declare function adaptor(options: any): LayoutAdaptor;
