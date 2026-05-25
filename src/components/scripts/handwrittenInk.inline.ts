/* eslint-disable no-restricted-syntax */
interface TldrawPoint {
  x: number;
  y: number;
  z: number;
}

interface TldrawSegment {
  type: string;
  points: TldrawPoint[];
}

interface TldrawDrawShape {
  id: string;
  type: "draw";
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  props: {
    segments: TldrawSegment[];
    color: string;
    fill: string;
    dash: string;
    size: string;
    isComplete: boolean;
    isClosed: boolean;
    isPen: boolean;
    scale: number;
  };
}

interface TldrawStore {
  [key: string]: {
    id: string;
    type?: string;
    typeName?: string;
    x?: number;
    y?: number;
    rotation?: number;
    opacity?: number;
    props?: {
      segments?: TldrawSegment[];
      color?: string;
      fill?: string;
      dash?: string;
      size?: string;
      isComplete?: boolean;
      isClosed?: boolean;
      isPen?: boolean;
      scale?: number;
      w?: number;
      h?: number;
    };
    parentId?: string;
    index?: string;
    meta?: Record<string, unknown>;
    gridSize?: number;
    name?: string;
  };
}

interface WritingFile {
  meta: {
    pluginVersion: string;
    tldrawVersion: string;
  };
  tldraw: {
    document: {
      store: TldrawStore;
    };
  };
}

interface InkEmbedData {
  versionAtEmbed: string;
  filepath: string;
  width?: number;
  aspectRatio?: number;
}

const sizeMap: Record<string, number> = {
  s: 2,
  m: 3,
  l: 5,
  xl: 8,
};

const colorMap: Record<string, string> = {
  black: "var(--dark)",
  white: "var(--light)",
  grey: "var(--gray)",
  blue: "#4a90d9",
  red: "#e03131",
  green: "#2f9e44",
  orange: "#e8590c",
  yellow: "#f59f00",
  purple: "#7950f2",
};

function slugifyFilepath(fp: string): string {
  return fp
    .split("/")
    .map((segment) =>
      segment
        .replace(/\s/g, "-")
        .replace(/&/g, "-and-")
        .replace(/%/g, "-percent")
        .replace(/\?/g, "")
        .replace(/#/g, ""),
    )
    .join("/");
}

function segmentsToPathData(segments: TldrawSegment[]): string {
  let pathData = "";

  for (const segment of segments) {
    if (segment.type === "free" && segment.points.length > 0) {
      const points = segment.points;

      if (points.length === 1) {
        pathData += `M ${points[0]!.x} ${points[0]!.y} L ${points[0]!.x} ${points[0]!.y} `;
      } else {
        pathData += `M ${points[0]!.x} ${points[0]!.y} `;

        for (let i = 1; i < points.length - 1; i++) {
          const p1 = points[i]!;
          const p2 = points[i + 1]!;

          const cpX = p1.x;
          const cpY = p1.y;
          const endX = (p1.x + p2.x) / 2;
          const endY = (p1.y + p2.y) / 2;

          pathData += `Q ${cpX} ${cpY} ${endX} ${endY} `;
        }

        if (points.length > 1) {
          const lastPoint = points[points.length - 1]!;
          pathData += `L ${lastPoint.x} ${lastPoint.y} `;
        }
      }
    }
  }

  return pathData;
}

function createSvgFromTldraw(
  tldrawData: WritingFile,
  explicitWidth?: number,
  aspectRatio?: number,
): SVGSVGElement | null {
  const store = tldrawData.tldraw.document.store;

  const drawShapes: TldrawDrawShape[] = [];

  for (const key of Object.keys(store)) {
    const item = store[key];
    if (item?.type === "draw" && item?.props?.segments) {
      drawShapes.push(item as unknown as TldrawDrawShape);
    }
  }

  if (drawShapes.length === 0) {
    return null;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const shape of drawShapes) {
    for (const segment of shape.props.segments) {
      for (const point of segment.points) {
        const x = shape.x + point.x;
        const y = shape.y + point.y;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const padding = 20;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const calculatedWidth = maxX - minX;
  const calculatedHeight = maxY - minY;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `${minX} ${minY} ${calculatedWidth} ${calculatedHeight}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "auto");
  svg.setAttribute("class", "handwritten-ink-svg");

  if (explicitWidth) {
    svg.style.maxWidth = `${explicitWidth}px`;
  }
  if (aspectRatio) {
    svg.style.aspectRatio = String(aspectRatio);
  } else {
    svg.style.maxHeight = "500px";
  }

  for (const shape of drawShapes) {
    const pathData = segmentsToPathData(shape.props.segments);

    if (pathData) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      path.setAttribute("fill", "none");
      path.setAttribute(
        "stroke",
        colorMap[shape.props.color] || shape.props.color || "currentColor",
      );
      path.setAttribute("stroke-width", String(sizeMap[shape.props.size] || 3));
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("opacity", String(shape.opacity ?? 1));

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", `translate(${shape.x}, ${shape.y})`);
      g.appendChild(path);

      svg.appendChild(g);
    }
  }

  return svg;
}

async function renderHandwrittenInk(
  container: HTMLElement,
  filepath: string,
  width?: number,
  aspectRatio?: number,
): Promise<void> {
  try {
    const slugifiedPath = slugifyFilepath(filepath);
    const url = `/${slugifiedPath}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const tldrawData: WritingFile = await response.json();
    const svg = createSvgFromTldraw(tldrawData, width, aspectRatio);

    if (svg) {
      container.innerHTML = "";
      container.appendChild(svg);
    } else {
      container.innerHTML = '<p class="handwritten-ink-error">No drawing data found</p>';
    }
  } catch (error) {
    console.error("Error rendering handwritten ink:", error);
    container.innerHTML = `<p class="handwritten-ink-error">Failed to load ink: ${error}</p>`;
  }
}

document.addEventListener("nav", async () => {
  const inkBlocks = document.querySelectorAll(
    "code.handwritten-ink, code.handdrawn-ink",
  ) as NodeListOf<HTMLElement>;

  if (inkBlocks.length === 0) return;

  for (const block of inkBlocks) {
    try {
      const inkDataStr = block.getAttribute("data-ink-data");
      if (!inkDataStr) continue;

      const inkData: InkEmbedData = JSON.parse(inkDataStr);
      if (!inkData.filepath) continue;

      const isHanddrawn = block.classList.contains("handdrawn-ink");
      const containerClass = isHanddrawn ? "handdrawn-ink-container" : "handwritten-ink-container";

      const container = document.createElement("div");
      container.className = containerClass;
      container.setAttribute("data-filepath", inkData.filepath);

      const parent = block.parentElement;
      if (parent) {
        parent.insertBefore(container, block);
        block.style.display = "none";
      }

      await renderHandwrittenInk(container, inkData.filepath, inkData.width, inkData.aspectRatio);
    } catch (error) {
      console.error("Error parsing ink data:", error);
    }
  }
});
