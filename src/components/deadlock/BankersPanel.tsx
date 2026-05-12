import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatrixEditor, VectorEditor } from "./MatrixEditor";
import { runBankers, computeNeed, type BankerInput } from "@/lib/deadlock";
import { CheckCircle2, AlertTriangle, Play, Plus, Minus, RotateCcw } from "lucide-react";

const defaultInput: BankerInput = {
  processes: ["P0", "P1", "P2", "P3", "P4"],
  resources: ["A", "B", "C"],
  available: [3, 3, 2],
  max: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ],
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ],
};

export const BankersPanel = () => {
  const [input, setInput] = useState<BankerInput>(defaultInput);
  const [result, setResult] = useState<ReturnType<typeof runBankers> | null>(null);

  const need = useMemo(() => computeNeed(input.max, input.allocation), [input]);

  const addProcess = () => {
    const name = `P${input.processes.length}`;
    const zero = input.resources.map(() => 0);
    setInput({
      ...input,
      processes: [...input.processes, name],
      max: [...input.max, [...zero]],
      allocation: [...input.allocation, [...zero]],
    });
  };
  const removeProcess = () => {
    if (input.processes.length <= 1) return;
    setInput({
      ...input,
      processes: input.processes.slice(0, -1),
      max: input.max.slice(0, -1),
      allocation: input.allocation.slice(0, -1),
    });
  };
  const addResource = () => {
    const name = String.fromCharCode(65 + input.resources.length);
    setInput({
      ...input,
      resources: [...input.resources, name],
      available: [...input.available, 0],
      max: input.max.map((r) => [...r, 0]),
      allocation: input.allocation.map((r) => [...r, 0]),
    });
  };
  const removeResource = () => {
    if (input.resources.length <= 1) return;
    setInput({
      ...input,
      resources: input.resources.slice(0, -1),
      available: input.available.slice(0, -1),
      max: input.max.map((r) => r.slice(0, -1)),
      allocation: input.allocation.map((r) => r.slice(0, -1)),
    });
  };

  const run = () => setResult(runBankers(input));
  const reset = () => { setInput(defaultInput); setResult(null); };

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
      <Card className="p-5 bg-card/60 border-border/60 backdrop-blur-sm shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-semibold">Banker's Algorithm</h3>
            <p className="text-xs text-muted-foreground">Edit the matrices, then run safety check.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={addProcess}><Plus className="h-3 w-3 mr-1" />Process</Button>
            <Button size="sm" variant="outline" onClick={removeProcess}><Minus className="h-3 w-3 mr-1" />Process</Button>
            <Button size="sm" variant="outline" onClick={addResource}><Plus className="h-3 w-3 mr-1" />Resource</Button>
            <Button size="sm" variant="outline" onClick={removeResource}><Minus className="h-3 w-3 mr-1" />Resource</Button>
            <Button size="sm" variant="ghost" onClick={reset}><RotateCcw className="h-3 w-3 mr-1" />Reset</Button>
          </div>
        </div>

        <div className="space-y-4">
          <VectorEditor
            cols={input.resources}
            values={input.available}
            onChange={(v) => setInput({ ...input, available: v })}
            label="Available"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <MatrixEditor
              rows={input.processes}
              cols={input.resources}
              values={input.allocation}
              onChange={(v) => setInput({ ...input, allocation: v })}
              label="Allocation"
              accent="primary"
            />
            <MatrixEditor
              rows={input.processes}
              cols={input.resources}
              values={input.max}
              onChange={(v) => setInput({ ...input, max: v })}
              label="Maximum"
              accent="warning"
            />
          </div>

          <div>
            <div className="text-xs font-mono-data uppercase tracking-wider text-muted-foreground mb-2">
              Need = Max − Allocation
            </div>
            <div className="overflow-x-auto rounded-lg border border-border/60 bg-background/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="p-2 text-left text-xs text-muted-foreground font-mono-data"> </th>
                    {input.resources.map((c) => (
                      <th key={c} className="p-2 text-center text-xs text-muted-foreground font-mono-data">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {input.processes.map((p, i) => (
                    <tr key={p} className="border-b border-border/30 last:border-0">
                      <td className="p-2 text-xs text-muted-foreground font-mono-data">{p}</td>
                      {need[i].map((v, j) => (
                        <td key={j} className="p-2 text-center font-mono-data text-sm">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Button onClick={run} className="w-full" size="lg">
            <Play className="h-4 w-4 mr-2" /> Run Safety Algorithm
          </Button>
        </div>
      </Card>

      <Card className="p-5 bg-card/60 border-border/60 backdrop-blur-sm shadow-[var(--shadow-card)]">
        <h3 className="font-semibold mb-4">Result</h3>
        {!result && (
          <div className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-6 text-center">
            Run the algorithm to see whether the system is in a <span className="text-safe">safe</span> state and the safe execution sequence.
          </div>
        )}
        {result && (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 border ${result.safe ? "border-safe/40 bg-safe/10" : "border-danger/40 bg-danger/10"}`}>
              <div className="flex items-center gap-2">
                {result.safe ? (
                  <CheckCircle2 className="h-5 w-5 text-safe" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-danger danger-pulse" />
                )}
                <span className="font-semibold">
                  {result.safe ? "System is in a SAFE state" : "DEADLOCK detected — UNSAFE"}
                </span>
              </div>
              {result.safe ? (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {result.sequence.map((p, i) => (
                    <span key={p} className="flex items-center gap-1.5">
                      <Badge variant="outline" className="font-mono-data border-primary/40 text-primary">{p}</Badge>
                      {i < result.sequence.length - 1 && <span className="text-muted-foreground">→</span>}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Stuck processes: {result.deadlocked.map((p) => (
                    <Badge key={p} className="ml-1 bg-danger/20 text-danger border border-danger/40">{p}</Badge>
                  ))}
                </p>
              )}
            </div>

            <div>
              <div className="text-xs font-mono-data uppercase tracking-wider text-muted-foreground mb-2">Execution log</div>
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {result.steps.map((s) => (
                  <div key={s.step} className={`text-xs font-mono-data rounded-md p-2 border ${s.granted ? "border-border/50 bg-background/40" : "border-danger/40 bg-danger/5"}`}>
                    <span className="text-muted-foreground">#{s.step}</span>{" "}
                    <span className={s.granted ? "text-primary" : "text-danger"}>{s.process}</span>{" "}
                    <span className="text-muted-foreground">— {s.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};