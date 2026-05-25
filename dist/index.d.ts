import { QuartzTransformerPlugin } from '@quartz-community/types';
export { PageGenerator, PageMatcher, QuartzComponent, QuartzComponentConstructor, QuartzComponentProps, QuartzEmitterPlugin, QuartzFilterPlugin, QuartzPageTypePlugin, QuartzPageTypePluginInstance, QuartzTransformerPlugin, StringResource, VirtualPage } from '@quartz-community/types';
export { HandwrittenInkOptions } from './types.js';

declare module "vfile" {
    interface DataMap {
        hasHandwrittenInk?: boolean;
    }
}
interface HandwrittenInkOptions {
    enabled: boolean;
}
declare const HandwrittenInk: QuartzTransformerPlugin<Partial<HandwrittenInkOptions>>;

export { HandwrittenInk };
