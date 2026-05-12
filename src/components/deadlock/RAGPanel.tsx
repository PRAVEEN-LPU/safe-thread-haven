import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { detectCycles, suggestVictim, type RAGInput, type RAGEdge } from "@/lib/deadlock";
import { AlertTriangle, CheckCircle2, Plus, Trash2, Zap } from "lucide-react";

const initial: RAGInput = {
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
};

export const RAGPanel = ({ value, onChange }: { value?: RAGInput; onChange?: (g: RAGInput) => void }) => {
  const [internal, setInternal] = useState<RAGInput>(initial);
  const graph = value ?? internal;
  const setGraph = (g: RAGInput) => {
    if (onChange) onChange(g);
    else setInternal(g);
  };

  const cycles = useMemo(() => detectCycles(graph), [graph]);
  const victim = useMemo(() => suggestVictim(graph), [graph]);
  const inCycle = useMemo(() => new Set(cycles.cycles.flat()), [cycles]);
  const cycleEdges = useMemo(() => {
    const set = new Set<string>();
    cycles.cycles.forEach((c) => {
      for (let i = 0; i < c.length - 1; i++) set.add(`${c[i]}→${c[i + 1]}`);
    });
    return set;
  }, [cycles]);

  // Layout: processes on left circle, resources on right circle
  const layout = useMemo(() => {
    const pos = new Map<string, { x: number; y: number }>();
    const W = 560, H = 360;
    const pad = 60;
    graph.processes.forEach((p, i) => {
      const t = (i + 1) / (graph.processes.length + 1);
      pos.set(p, { x: pad + 80, y: pad + t * (H - pad * 2) });
    });
    graph.resources.forEach((r, i) => {
      const t = (i + 1) / (graph.resources.length + 1);
      pos.set(r, { x: W - pad - 80, y: pad + t * (H - pad * 2) });
    });
    return { pos, W, H };
  }, [graph]);

  // edge editor state
  const [from, setFrom] = useState<string>("P1");
  const [to, setTo] = useState<string>("R1");

  const inferType = (f: string, t: string): RAGEdge["type"] | null => {
    const fp = graph.processes.includes(f);
    const tp = graph.processes.includes(t);
    const fr = graph.resources.includes(f);
    const tr = graph.resources.includes(t);
    if (fp && tr) return "request";
    if (fr && tp) return "alloc";
    return null;
  };

  const addEdge = () => {
    const type = inferType(from, to);
    if (!type) return;
    if (graph.edges.some((e) => e.from === from && e.to === to)) return;
    setGraph({ ...graph, edges: [...graph.edges, { from, to, type }] });
  };
  const removeEdge = (idx: number) => {
    setGraph({ ...graph, edges: graph.edges.filter((_, i) => i !== idx) });
  };

  const addProcess = () => {
    const name = `P${graph.processes.length + 1}`;
    setGraph({ ...graph, processes: [...graph.processes, name] });
  };
  const addResource = () => {
    const name = `R${graph.resources.length + 1}`;
    setGraph({ ...graph, resources: [...graph.resources, name] });
  };

  return (
    <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
      <Card className="p-5 bg-card/60 border-border/60 backdrop-blur-sm shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="font-semibold">Resource Allocation Graph</h3>
            <p className="text-xs text-muted-foreground">
              Circles = processes · Squares = resources · Cycle ⇒ deadlock (single-instance).
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={addProcess}><Plus className="h-3 w-3 mr-1" />Process</Button>
            <Button size="sm" variant="outline" onClick={addResource}><Plus className="h-3 w-3 mr-1" />Resource</Button>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/40 overflow-hidden">
          <svg viewBox={`0 0 ${layout.W} ${layout.H}`} className="w-full h-auto">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="hsl(var(--muted-foreground))" />
              </marker>
              <marker id="arrow-danger" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="hsl(var(--danger))" />
              </marker>
              <marker id="arrow-primary" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="hsl(var(--primary))" />
              </marker>
            </defs>

            {graph.edges.map((e, i) => {
              const a = layout.pos.get(e.from);
              const b = layout.pos.get(e.to);
              if (!a || !b) return null;
              const isCycle = cycleEdges.has(`${e.from}→${e.to}`);
              const stroke = isCycle ? "hsl(var(--danger))" : e.type === "alloc" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))";
              const marker = isCycle ? "url(#arrow-danger)" : e.type === "alloc" ? "url(#arrow-primary)" : "url(#arrow)";
              const dx = b.x - a.x, dy = b.y - a.y;
              const len = Math.hypot(dx, dy);
              const ux = dx / len, uy = dy / len;
              const r = 26;
              const x1 = a.x + ux * r, y1 = a.y + uy * r;
              const x2 = b.x - ux * r, y2 = b.y - uy * r;
              return (
                <g key={i} className={isCycle ? "danger-pulse" : ""}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={stroke} strokeWidth={isCycle ? 2.4 : 1.6}
                    strokeDasharray={e.type === "request" ? "5 4" : undefined}
                    markerEnd={marker} />
                </g>
              );
            })}

            {graph.processes.map((p) => {
              const pos = layout.pos.get(p)!;
              const danger = inCycle.has(p);
              return (
                <g key={p} className={danger ? "danger-pulse" : ""}>
                  <circle cx={pos.x} cy={pos.y} r={24}
                    fill="hsl(var(--card))"
                    stroke={danger ? "hsl(var(--danger))" : "hsl(var(--primary))"}
                    strokeWidth={2} />
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle"
                    className="font-mono-data" fontSize="12"
                    fill={danger ? "hsl(var(--danger))" : "hsl(var(--primary))"}>{p}</text>
                </g>
              );
            })}

            {graph.resources.map((r) => {
              const pos = layout.pos.get(r)!;
              const danger = inCycle.has(r);
              return (
                <g key={r}>
                  <rect x={pos.x - 22} y={pos.y - 22} width={44} height={44} rx={6}
                    fill="hsl(var(--card))"
                    stroke={danger ? "hsl(var(--danger))" : "hsl(var(--accent))"}
                    strokeWidth={2} />
                  <circle cx={pos.x} cy={pos.y - 6} r={2.5} fill="hsl(var(--accent))" />
                  <text x={pos.x} y={pos.y + 12} textAnchor="middle"
                    className="font-mono-data" fontSize="11"
                    fill={danger ? "hsl(var(--danger))" : "hsl(var(--accent))"}>{r}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 grid sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
          <div>
            <div className="text-xs text-muted-foreground font-mono-data mb-1">From</div>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[...graph.processes, ...graph.resources].map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-mono-data mb-1">To</div>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[...graph.processes, ...graph.resources].map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addEdge} disabled={!inferType(from, to)}>
            <Plus className="h-4 w-4 mr-1" /> Add edge
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 font-mono-data">
          P → R = request (dashed) · R → P = allocation (solid)
        </p>
      </Card>

      <div className="space-y-4">
        <Card className={`p-5 border ${cycles.hasCycle ? "border-danger/40 bg-danger/10" : "border-safe/40 bg-safe/10"} backdrop-blur-sm`}>
          <div className="flex items-center gap-2">
            {cycles.hasCycle ? (
              <AlertTriangle className="h-5 w-5 text-danger danger-pulse" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-safe" />
            )}
            <span className="font-semibold">
              {cycles.hasCycle ? "Deadlock detected" : "No deadlock"}
            </span>
          </div>
          {cycles.hasCycle && (
            <div className="mt-3 space-y-2">
              {cycles.cycles.map((c, i) => (
                <div key={i} className="text-xs font-mono-data flex flex-wrap items-center gap-1">
                  {c.map((n, j) => (
                    <span key={j} className="flex items-center gap-1">
                      <span className="text-danger">{n}</span>
                      {j < c.length - 1 && <span className="text-muted-foreground">→</span>}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 bg-card/60 border-border/60 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-accent" />
            <h4 className="font-semibold">Recovery suggestion</h4>
          </div>
          {victim.victim ? (
            <div className="space-y-2">
              <Badge className="bg-accent/20 text-accent border border-accent/40 font-mono-data">
                Abort {victim.victim}
              </Badge>
              <p className="text-xs text-muted-foreground">{victim.reason}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setGraph({
                    ...graph,
                    edges: graph.edges.filter((e) => e.from !== victim.victim && e.to !== victim.victim),
                  })
                }
              >
                <Trash2 className="h-3 w-3 mr-1" /> Apply: terminate {victim.victim}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{victim.reason}</p>
          )}
        </Card>

        <Card className="p-5 bg-card/60 border-border/60 backdrop-blur-sm">
          <h4 className="font-semibold mb-2 text-sm">Edges</h4>
          <div className="space-y-1 max-h-56 overflow-y-auto">
            {graph.edges.length === 0 && (
              <p className="text-xs text-muted-foreground">No edges yet.</p>
            )}
            {graph.edges.map((e, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-mono-data rounded-md border border-border/50 bg-background/40 px-2 py-1.5">
                <span>
                  <span className={e.type === "alloc" ? "text-primary" : "text-muted-foreground"}>{e.from}</span>
                  <span className="mx-1 text-muted-foreground">{e.type === "alloc" ? "→" : "⇢"}</span>
                  <span className={e.type === "alloc" ? "text-primary" : "text-muted-foreground"}>{e.to}</span>
                  <Badge variant="outline" className="ml-2 text-[10px] py-0 px-1.5">{e.type}</Badge>
                </span>
                <button onClick={() => removeEdge(i)} className="text-muted-foreground hover:text-danger">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};