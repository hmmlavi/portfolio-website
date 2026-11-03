import { useState } from "react";
import type { Node } from "@/data/projectExtras";

/**
 * Component flow explorer.
 *
 * The projects it serves are documented in their READMEs as a three-part
 * request flow, so this shows exactly that — a linear component flow with
 * selectable descriptions. It is deliberately NOT presented as a complete
 * deployment or infrastructure diagram, because the source does not describe one.
 */
export default function ArchitectureExplorer({ nodes }: { nodes: Node[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const current = nodes.find(node => node.id === selected) ?? null;

  return (
    <div className="architecture-panel ui-surface rounded-2xl p-5 sm:p-7" data-architecture>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <p className="text-sm text-white/60">
          Select a component to inspect its role in the request flow.
        </p>
        <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/40">
          from the project README
        </p>
      </div>

      <ol className="architecture-flow" aria-label="Component flow">
        {nodes.map((node, index) => (
          <li className="architecture-step" key={node.id}>
            {index > 0 && (
              <span
                aria-hidden="true"
                className={selected === node.id || selected === nodes[index - 1].id
                  ? "architecture-arrow active"
                  : "architecture-arrow"}
              >
                →
              </span>
            )}
            <button
              type="button"
              aria-pressed={selected === node.id}
              onClick={() => setSelected(selected === node.id ? null : node.id)}
              className="ui-btn-quiet rounded-xl px-4 py-3 text-sm text-left w-full sm:w-auto"
            >
              <span className="font-mono text-[10px] text-white/50 mr-2">0{index + 1}</span>
              {node.label}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-2xl ui-row p-4" aria-live="polite">
        <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/50 mb-1.5">
          {current ? current.label : "Flow overview"}
        </p>
        <p className="text-sm leading-relaxed">
          {current ? current.detail : nodes.map(node => node.label).join(" → ")}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setSelected(null)}
        className="mt-4 text-sm underline underline-offset-4"
      >
        Overview
      </button>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer underline underline-offset-4">Read all component descriptions</summary>
        <ol className="mt-3 space-y-2 list-decimal pl-5">
          {nodes.map(node => (
            <li key={node.id}>
              <strong>{node.label}:</strong> {node.detail}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
