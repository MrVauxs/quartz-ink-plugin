import type { PluggableList } from "unified";
import type { Root } from "mdast";
import type { Code } from "mdast";
import type { VFile } from "vfile";
import { visit } from "unist-util-visit";
import type { QuartzTransformerPlugin, BuildCtx } from "@quartz-community/types";
// @ts-expect-error bundled as raw text via tsup inline-script-loader
import handwrittenInkScript from "../components/scripts/handwrittenInk.inline";
import handwrittenInkStyle from "../components/styles/handwrittenInk.scss";

const INK_LANGUAGES = ["handwritten-ink", "handdrawn-ink"];

declare module "vfile" {
  interface DataMap {
    hasHandwrittenInk?: boolean;
  }
}

export interface HandwrittenInkOptions {
  enabled: boolean;
}

const defaultOptions: HandwrittenInkOptions = {
  enabled: true,
};

export const HandwrittenInk: QuartzTransformerPlugin<Partial<HandwrittenInkOptions>> = (
  userOpts?: Partial<HandwrittenInkOptions>,
) => {
  const opts = { ...defaultOptions, ...userOpts };

  return {
    name: "HandwrittenInk",
    markdownPlugins(_ctx: BuildCtx) {
      return [
        () => {
          return (tree: Root, file: VFile) => {
            visit(tree, "code", (node: Code) => {
              if (node.lang && INK_LANGUAGES.includes(node.lang)) {
                file.data.hasHandwrittenInk = true;
                node.data = {
                  hProperties: {
                    className: [node.lang],
                    "data-ink-data": node.value,
                  },
                };
              }
            });
          };
        },
      ] as PluggableList;
    },
    externalResources(_ctx: BuildCtx) {
      if (!opts.enabled) return {};
      return {
        css: [
          {
            content: handwrittenInkStyle,
            inline: true,
          },
        ],
        js: [
          {
            script: handwrittenInkScript,
            loadTime: "afterDOMReady",
            contentType: "inline",
          },
        ],
      };
    },
  };
};
