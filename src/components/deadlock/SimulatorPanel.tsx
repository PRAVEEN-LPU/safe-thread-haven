import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RAGPanel } from "./RAGPanel";
import type { RAGInput } from "@/lib/deadlock";
import { Utensils, RotateCw, Network, ArrowRightLeft } from "lucide-react";

const presets: { id: string; label: string; icon: typeof Utensils; description: string; build: () => RAGInput }[] = [
  {
    id: "circular",
    label: "Circular Wait",
    icon: RotateCw,
    description: "Classic 3-process circular wait — guaranteed deadlock.",
    build: () => ({
      processes: ["P1", "P2", "P3"],
      resources: ["R1", "R2", "R3"],
      edges: [
        { from: "R1", to: "P1", type: "alloc" },
        { from: "P1", to: "R2", type: "request" },
        { from: "R2", to: "P2", type: "alloc" },
        { from: "P2", to: "R3", type: "request" },
        { from: "R3", to: "P3", type: "alloc" },
        { from: "P3", to: "R1", type: "request" },
      ],
    }),
  },
  {
    id: "philosophers",
    label: "Dining Philosophers",
    icon: Utensils,
    description: "5 philosophers, 5 forks, all grab left fork — deadlock.",
    build: () => {
      const processes = ["Ph1", "Ph2", "Ph3", "Ph4", "Ph5"];
      const resources = ["F1", "F2", "F3", "F4", "F5"];
      const edges = processes.flatMap((p, i) => [
        { from: resources[i], to: p, type: "alloc" as const },
        { from: p, to: resources[(i + 1) % 5], type: "request" as const },
      ]);
      return { processes, resources, edges };
    },
  },
  {
    id: "safe",
    label: "Safe Allocation",
    icon: Network,
    description: "Holds resources but no waiting cycle — system runs fine.",
    build: () => ({
      processes: ["P1", "P2", "P3"],
      resources: ["R1", "R2", "R3"],
      edges: [
        { from: "R1", to: "P1", type: "alloc" },
        { from: "R2", to: "P2", type: "alloc" },
        { from: "P3", to: "R3", type: "request" },
      ],
    }),
  },
  {
    id: "two-way",
    label: "Two-way Hold & Wait",
    icon: ArrowRightLeft,
    description: "Two processes each hold one resource and want the other.",
    build: () => ({
      processes: ["P1", "P2"],
      resources: ["R1", "R2"],
      edges: [
        { from: "R1", to: "P1", type: "alloc" },
        { from: "P1", to: "R2", type: "request" },
        { from: "R2", to: "P2", type: "alloc" },
        { from: "P2", to: "R1", type: "request" },
      ],
    }),
  },
];

export const SimulatorPanel = () => {
  const [graph, setGraph] = useState<RAGInput>(presets[0].build());
  const [activePreset, setActivePreset] = useState<string>("circular");

  return (
    <div className="space-y-6">
      <Card className="p-5 bg-card/60 border-border/60 backdrop-blur-sm shadow-[var(--shadow-card)]">
        <h3 className="font-semibold mb-1">Scenario Simulator</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Load a classic scenario or build your own using the graph editor below.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((p) => {
            const Icon = p.icon;
            const active = activePreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => { setGraph(p.build()); setActivePreset(p.id); }}
                className={`text-left rounded-lg border p-3 transition-all ${
                  active
                    ? "border-primary/60 bg-primary/10 shadow-[var(--shadow-glow)]"
                    : "border-border/60 bg-background/40 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-medium text-sm">{p.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">{p.description}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setGraph({ processes: [], resources: [], edges: [] }); setActivePreset(""); }}
          >
            Clear graph
          </Button>
        </div>
      </Card>

      <RAGPanel value={graph} onChange={(g) => { setGraph(g); setActivePreset(""); }} />
    </div>
  );
};