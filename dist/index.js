import { createRequire } from 'module';

createRequire(import.meta.url);

// node_modules/unist-util-is/lib/index.js
var convert = (
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
   *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
   *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
   *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
   *   ((test?: Test) => Check)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {Check}
   */
  (function(test) {
    if (test === null || test === void 0) {
      return ok;
    }
    if (typeof test === "function") {
      return castFactory(test);
    }
    if (typeof test === "object") {
      return Array.isArray(test) ? anyFactory(test) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        propertiesFactory(
          /** @type {Props} */
          test
        )
      );
    }
    if (typeof test === "string") {
      return typeFactory(test);
    }
    throw new Error("Expected function, string, or object as test");
  })
);
function anyFactory(tests) {
  const checks = [];
  let index = -1;
  while (++index < tests.length) {
    checks[index] = convert(tests[index]);
  }
  return castFactory(any);
  function any(...parameters) {
    let index2 = -1;
    while (++index2 < checks.length) {
      if (checks[index2].apply(this, parameters)) return true;
    }
    return false;
  }
}
function propertiesFactory(check) {
  const checkAsRecord = (
    /** @type {Record<string, unknown>} */
    check
  );
  return castFactory(all);
  function all(node) {
    const nodeAsRecord = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      node
    );
    let key;
    for (key in check) {
      if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
    }
    return true;
  }
}
function typeFactory(check) {
  return castFactory(type);
  function type(node) {
    return node && node.type === check;
  }
}
function castFactory(testFunction) {
  return check;
  function check(value, index, parent) {
    return Boolean(
      looksLikeANode(value) && testFunction.call(
        this,
        value,
        typeof index === "number" ? index : void 0,
        parent || void 0
      )
    );
  }
}
function ok() {
  return true;
}
function looksLikeANode(value) {
  return value !== null && typeof value === "object" && "type" in value;
}

// node_modules/unist-util-visit-parents/lib/color.node.js
function color(d) {
  return "\x1B[33m" + d + "\x1B[39m";
}

// node_modules/unist-util-visit-parents/lib/index.js
var empty = [];
var CONTINUE = true;
var EXIT = false;
var SKIP = "skip";
function visitParents(tree, test, visitor, reverse) {
  let check;
  if (typeof test === "function" && typeof visitor !== "function") {
    reverse = visitor;
    visitor = test;
  } else {
    check = test;
  }
  const is2 = convert(check);
  const step = reverse ? -1 : 1;
  factory(tree, void 0, [])();
  function factory(node, index, parents) {
    const value = (
      /** @type {Record<string, unknown>} */
      node && typeof node === "object" ? node : {}
    );
    if (typeof value.type === "string") {
      const name = (
        // `hast`
        typeof value.tagName === "string" ? value.tagName : (
          // `xast`
          typeof value.name === "string" ? value.name : void 0
        )
      );
      Object.defineProperty(visit2, "name", {
        value: "node (" + color(node.type + (name ? "<" + name + ">" : "")) + ")"
      });
    }
    return visit2;
    function visit2() {
      let result = empty;
      let subresult;
      let offset;
      let grandparents;
      if (!test || is2(node, index, parents[parents.length - 1] || void 0)) {
        result = toResult(visitor(node, parents));
        if (result[0] === EXIT) {
          return result;
        }
      }
      if ("children" in node && node.children) {
        const nodeAsParent = (
          /** @type {UnistParent} */
          node
        );
        if (nodeAsParent.children && result[0] !== SKIP) {
          offset = (reverse ? nodeAsParent.children.length : -1) + step;
          grandparents = parents.concat(nodeAsParent);
          while (offset > -1 && offset < nodeAsParent.children.length) {
            const child = nodeAsParent.children[offset];
            subresult = factory(child, offset, grandparents)();
            if (subresult[0] === EXIT) {
              return subresult;
            }
            offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
          }
        }
      }
      return result;
    }
  }
}
function toResult(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "number") {
    return [CONTINUE, value];
  }
  return value === null || value === void 0 ? empty : [value];
}

// node_modules/unist-util-visit/lib/index.js
function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
  let reverse;
  let test;
  let visitor;
  {
    test = testOrVisitor;
    visitor = visitorOrReverse;
    reverse = maybeReverse;
  }
  visitParents(tree, test, overload, reverse);
  function overload(node, parents) {
    const parent = parents[parents.length - 1];
    const index = parent ? parent.children.indexOf(node) : void 0;
    return visitor(node, index, parent);
  }
}

// src/components/scripts/handwrittenInk.inline.ts
var handwrittenInk_inline_default = 'var b={s:2,m:3,l:5,xl:8},y={black:"var(--dark)",white:"var(--light)",grey:"var(--gray)",blue:"#4a90d9",red:"#e03131",green:"#2f9e44",orange:"#e8590c",yellow:"#f59f00",purple:"#7950f2"};function k(s){return s.split("/").map(e=>e.replace(/\\s/g,"-").replace(/&/g,"-and-").replace(/%/g,"-percent").replace(/\\?/g,"").replace(/#/g,"")).join("/")}function x(s){let e="";for(let a of s)if(a.type==="free"&&a.points.length>0){let t=a.points;if(t.length===1)e+=`M ${t[0].x} ${t[0].y} L ${t[0].x} ${t[0].y} `;else{e+=`M ${t[0].x} ${t[0].y} `;for(let n=1;n<t.length-1;n++){let i=t[n],r=t[n+1],l=i.x,d=i.y,m=(i.x+r.x)/2,f=(i.y+r.y)/2;e+=`Q ${l} ${d} ${m} ${f} `}if(t.length>1){let n=t[t.length-1];e+=`L ${n.x} ${n.y} `}}}return e}function S(s,e,a){let t=s.tldraw.document.store,n=[];for(let o of Object.keys(t)){let g=t[o];g?.type==="draw"&&g?.props?.segments&&n.push(g)}if(n.length===0)return null;let i=1/0,r=1/0,l=-1/0,d=-1/0;for(let o of n)for(let g of o.props.segments)for(let c of g.points){let u=o.x+c.x,h=o.y+c.y;i=Math.min(i,u),r=Math.min(r,h),l=Math.max(l,u),d=Math.max(d,h)}let m=20;i-=m,r-=m,l+=m,d+=m;let f=l-i,w=d-r,p=document.createElementNS("http://www.w3.org/2000/svg","svg");p.setAttribute("viewBox",`${i} ${r} ${f} ${w}`),p.setAttribute("width","100%"),p.setAttribute("height","auto"),p.setAttribute("class","handwritten-ink-svg"),e&&(p.style.maxWidth=`${e}px`),a?p.style.aspectRatio=String(a):p.style.maxHeight="500px";for(let o of n){let g=x(o.props.segments);if(g){let c=document.createElementNS("http://www.w3.org/2000/svg","path");c.setAttribute("d",g),c.setAttribute("fill","none"),c.setAttribute("stroke",y[o.props.color]||o.props.color||"currentColor"),c.setAttribute("stroke-width",String(b[o.props.size]||3)),c.setAttribute("stroke-linecap","round"),c.setAttribute("stroke-linejoin","round"),c.setAttribute("opacity",String(o.opacity??1));let u=document.createElementNS("http://www.w3.org/2000/svg","g");u.setAttribute("transform",`translate(${o.x}, ${o.y})`),u.appendChild(c),p.appendChild(u)}}return p}async function $(s,e,a,t){try{let i=`/${k(e)}`,r=await fetch(i);if(!r.ok)throw new Error(`Failed to fetch ${i}: ${r.status}`);let l=await r.json(),d=S(l,a,t);d?(s.innerHTML="",s.appendChild(d)):s.innerHTML=\'<p class="handwritten-ink-error">No drawing data found</p>\'}catch(n){console.error("Error rendering handwritten ink:",n),s.innerHTML=`<p class="handwritten-ink-error">Failed to load ink: ${n}</p>`}}document.addEventListener("nav",async()=>{let s=document.querySelectorAll("code.handwritten-ink, code.handdrawn-ink");if(s.length!==0)for(let e of s)try{let a=e.getAttribute("data-ink-data");if(!a)continue;let t=JSON.parse(a);if(!t.filepath)continue;let i=e.classList.contains("handdrawn-ink")?"handdrawn-ink-container":"handwritten-ink-container",r=document.createElement("div");r.className=i,r.setAttribute("data-filepath",t.filepath);let l=e.parentElement;l&&(l.insertBefore(r,e),e.style.display="none"),await $(r,t.filepath,t.width,t.aspectRatio)}catch(a){console.error("Error parsing ink data:",a)}});\n';

// src/components/styles/handwrittenInk.scss
var handwrittenInk_default = ".handwritten-ink-container,\n.handdrawn-ink-container {\n  margin: 1rem 0;\n  padding: 1rem;\n  border-radius: 8px;\n  background: var(--highlight);\n  overflow: hidden;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100px;\n}\n\n.handwritten-ink-svg {\n  max-width: 100%;\n  height: auto;\n  display: block;\n}\n\n.handwritten-ink-error {\n  color: var(--secondary);\n  font-style: italic;\n  text-align: center;\n  margin: 0;\n}\n\n[data-theme=dark] .handwritten-ink-container,\n[data-theme=dark] .handdrawn-ink-container {\n  background: var(--lightgray);\n}\n\ncode.handwritten-ink,\ncode.handdrawn-ink {\n  display: none;\n}\n\narticle .handwritten-ink-container,\narticle .handdrawn-ink-container {\n  margin-left: auto;\n  margin-right: auto;\n  max-width: 100%;\n}\n\n.handdrawn-ink-container {\n  min-height: 200px;\n}\n\n.handdrawn-ink-container .handwritten-ink-svg {\n  max-height: none;\n}";

// src/transformers/handwritten-ink.ts
var INK_LANGUAGES = ["handwritten-ink", "handdrawn-ink"];
var defaultOptions = {
  enabled: true
};
var HandwrittenInk = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  return {
    name: "HandwrittenInk",
    markdownPlugins(_ctx) {
      return [
        () => {
          return (tree, file) => {
            visit(tree, "code", (node) => {
              if (node.lang && INK_LANGUAGES.includes(node.lang)) {
                file.data.hasHandwrittenInk = true;
                node.data = {
                  hProperties: {
                    className: [node.lang],
                    "data-ink-data": node.value
                  }
                };
              }
            });
          };
        }
      ];
    },
    externalResources(_ctx) {
      if (!opts.enabled) return {};
      return {
        css: [
          {
            content: handwrittenInk_default,
            inline: true
          }
        ],
        js: [
          {
            script: handwrittenInk_inline_default,
            loadTime: "afterDOMReady",
            contentType: "inline"
          }
        ]
      };
    }
  };
};

export { HandwrittenInk };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map