/**
 * SVG edge routing for BlockBind user-flow diagrams (ported from User Flow.html).
 * Expects a `.flow` container with `.node[id]` and optional `data-to` edges.
 */

interface FlowNodeBox {
  el: Element;
  box: ReturnType<typeof rectIn>;
}

function rectIn(parent: HTMLElement, child: Element) {
  const p = parent.getBoundingClientRect();
  const c = child.getBoundingClientRect();
  return {
    cx: c.left - p.left + c.width / 2,
    cy: c.top - p.top + c.height / 2,
    top: c.top - p.top,
    bottom: c.top - p.top + c.height,
    left: c.left - p.left,
    right: c.left - p.left + c.width,
    w: c.width,
    h: c.height,
  };
}

function nodeClassEdge(node: Element): string {
  if (node.classList.contains("node--success")) return "edge--success";
  if (node.classList.contains("node--error")) return "edge--error";
  if (node.classList.contains("node--decision")) return "edge--accent";
  return "";
}

export function renderUserFlowConnectors(flow: HTMLElement): void {
  const svg = flow.querySelector("svg.connectors");
  if (!svg) return;

  const fr = flow.getBoundingClientRect();
  svg.setAttribute("viewBox", `0 0 ${String(fr.width)} ${String(fr.height)}`);
  svg.setAttribute("width", String(fr.width));
  svg.setAttribute("height", String(fr.height));

  const nodes = new Map<string, FlowNodeBox>();
  flow.querySelectorAll(".node[id]").forEach((n) => {
    const el = n as HTMLElement;
    if (!el.id) return;
    nodes.set(el.id, { el, box: rectIn(flow, el) });
  });

  const flowId = flow.id || "flow";

  const defs = `
      <defs>
        <marker id="arr-${flowId}" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/>
        </marker>
        <marker id="arr-${flowId}-dashed" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/>
        </marker>
      </defs>`;

  let paths = "";
  let backLeft = 0;
  let backRight = 0;

  flow.querySelectorAll<HTMLElement>(".node[data-to]").forEach((fromEl) => {
    const fid = fromEl.id;
    if (!fid) return;
    const from = nodes.get(fid);
    if (from === undefined) return;
    const raw = fromEl.getAttribute("data-to");
    if (!raw) return;
    const targets = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    targets.forEach((tspec) => {
      const colon = tspec.indexOf(":");
      const tid = (colon === -1 ? tspec : tspec.slice(0, colon)).trim();
      if (!tid) return;
      const style = colon === -1 ? "" : tspec.slice(colon + 1).trim();
      const to = nodes.get(tid);
      if (to === undefined) return;
      const dashed = style === "dashed" || style === "d" || style === "return";
      const styleCls = dashed ? nodeClassEdge(to.el) || "edge--dashed" : nodeClassEdge(to.el);
      const cls = "edge" + (dashed ? " edge--dashed" : "") + (styleCls ? ` ${styleCls}` : "");

      const f = from.box;
      const t = to.box;

      let d: string;
      if (t.cy < f.cy - 4) {
        const routeLeft = (f.cx + t.cx) / 2 < fr.width / 2;
        const rail = routeLeft
          ? Math.max(12, Math.min(f.left, t.left) - 28 - backLeft * 10)
          : Math.min(fr.width - 12, Math.max(f.right, t.right) + 28 + backRight * 10);
        if (routeLeft) backLeft++;
        else backRight++;
        const sx = routeLeft ? f.left : f.right;
        const sy = f.cy;
        const ex = routeLeft ? t.left : t.right;
        const ey = t.cy;
        const r = 8;
        d = `M ${String(sx)} ${String(sy)}
               L ${String(rail + (routeLeft ? r : -r))} ${String(sy)}
               Q ${String(rail)} ${String(sy)} ${String(rail)} ${String(sy + (sy > ey ? -r : r))}
               L ${String(rail)} ${String(ey + (sy > ey ? r : -r))}
               Q ${String(rail)} ${String(ey)} ${String(rail + (routeLeft ? r : -r))} ${String(ey)}
               L ${String(ex)} ${String(ey)}`;
      } else if (Math.abs(f.cx - t.cx) < 2) {
        d = `M ${String(f.cx)} ${String(f.bottom)} L ${String(t.cx)} ${String(t.top)}`;
      } else if (Math.abs(f.cy - t.cy) < 2) {
        if (f.cx < t.cx)
          d = `M ${String(f.right)} ${String(f.cy)} L ${String(t.left)} ${String(t.cy)}`;
        else d = `M ${String(f.left)}  ${String(f.cy)} L ${String(t.right)} ${String(t.cy)}`;
      } else {
        const sx = f.cx;
        const sy = f.bottom;
        const ex = t.cx;
        const ey = t.top;
        const ymid = sy + (ey - sy) * 0.45;
        const r = 8;
        const sign = ex > sx ? 1 : -1;
        d = `M ${String(sx)} ${String(sy)}
               L ${String(sx)} ${String(ymid - r)}
               Q ${String(sx)} ${String(ymid)} ${String(sx + sign * r)} ${String(ymid)}
               L ${String(ex - sign * r)} ${String(ymid)}
               Q ${String(ex)} ${String(ymid)} ${String(ex)} ${String(ymid + r)}
               L ${String(ex)} ${String(ey)}`;
      }

      const marker = dashed ? `url(#arr-${flowId}-dashed)` : `url(#arr-${flowId})`;
      paths += `<path class="${cls}" d="${d}" marker-end="${marker}"></path>`;
    });
  });

  svg.innerHTML = defs + paths;
}

export function renderAllUserFlowConnectors(root: HTMLElement | null): void {
  if (!root) return;
  root.querySelectorAll<HTMLElement>(".flow").forEach(renderUserFlowConnectors);
}
