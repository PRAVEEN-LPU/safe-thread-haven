// Core deadlock algorithms: Banker's safety + RAG cycle detection.

export interface BankerInput {
  processes: string[];     // e.g. ["P0","P1",...]
  resources: string[];     // e.g. ["A","B","C"]
  available: number[];     // length = resources.length
  max: number[][];         // processes x resources
  allocation: number[][];  // processes x resources
}

export interface BankerStep {
  step: number;
  process: string;
  work: number[];
  needed: number[];
  granted: boolean;
  reason: string;
}

export interface BankerResult {
  safe: boolean;
  sequence: string[];
  steps: BankerStep[];
  need: number[][];
  finish: boolean[];
  deadlocked: string[]; // processes that couldn't finish
}

export function computeNeed(max: number[][], allocation: number[][]): number[][] {
  return max.map((row, i) => row.map((v, j) => v - (allocation[i]?.[j] ?? 0)));
}

export function runBankers(input: BankerInput): BankerResult {
  const { processes, available, max, allocation } = input;
  const n = processes.length;
  const m = available.length;
  const need = computeNeed(max, allocation);
  const finish = new Array<boolean>(n).fill(false);
  const work = [...available];
  const sequence: string[] = [];
  const steps: BankerStep[] = [];
  let stepCounter = 0;

  let progress = true;
  while (progress) {
    progress = false;
    for (let i = 0; i < n; i++) {
      if (finish[i]) continue;
      const canRun = need[i].every((v, j) => v <= work[j]);
      if (canRun) {
        const before = [...work];
        for (let j = 0; j < m; j++) work[j] += allocation[i][j];
        finish[i] = true;
        sequence.push(processes[i]);
        steps.push({
          step: ++stepCounter,
          process: processes[i],
          work: before,
          needed: [...need[i]],
          granted: true,
          reason: `Need ${fmt(need[i])} ≤ Work ${fmt(before)}. Release allocation ${fmt(allocation[i])}.`,
        });
        progress = true;
      }
    }
  }

  const deadlocked = processes.filter((_, i) => !finish[i]);
  if (deadlocked.length) {
    deadlocked.forEach((p) => {
      const i = processes.indexOf(p);
      steps.push({
        step: ++stepCounter,
        process: p,
        work: [...work],
        needed: [...need[i]],
        granted: false,
        reason: `Need ${fmt(need[i])} > Work ${fmt(work)}. Cannot proceed.`,
      });
    });
  }

  return {
    safe: deadlocked.length === 0,
    sequence,
    steps,
    need,
    finish,
    deadlocked,
  };
}

const fmt = (a: number[]) => `[${a.join(",")}]`;

// ---------- Resource Allocation Graph ----------
// Single-instance resources: cycle => deadlock.
// Edge types: allocation R->P, request P->R.

export interface RAGEdge {
  from: string;
  to: string;
  type: "alloc" | "request";
}

export interface RAGInput {
  processes: string[]; // ids prefixed with P
  resources: string[]; // ids prefixed with R
  edges: RAGEdge[];
}

export interface CycleResult {
  hasCycle: boolean;
  cycles: string[][];
}

export function detectCycles(graph: RAGInput): CycleResult {
  const nodes = [...graph.processes, ...graph.resources];
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n, []));
  graph.edges.forEach((e) => {
    adj.get(e.from)?.push(e.to);
  });

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack: string[] = [];
  const onStack = new Set<string>();

  const dfs = (u: string) => {
    visited.add(u);
    stack.push(u);
    onStack.add(u);
    for (const v of adj.get(u) ?? []) {
      if (!visited.has(v)) {
        dfs(v);
      } else if (onStack.has(v)) {
        const idx = stack.indexOf(v);
        const cyc = stack.slice(idx);
        // dedupe by signature
        const sig = [...cyc].sort().join("|");
        if (!cycles.some((c) => [...c].sort().join("|") === sig)) {
          cycles.push([...cyc, v]);
        }
      }
    }
    stack.pop();
    onStack.delete(u);
  };

  for (const n of nodes) if (!visited.has(n)) dfs(n);

  return { hasCycle: cycles.length > 0, cycles };
}

// Recovery: pick victim by lowest allocation cost (fewest held resources).
export function suggestVictim(graph: RAGInput): { victim: string | null; reason: string } {
  const held = new Map<string, number>();
  graph.processes.forEach((p) => held.set(p, 0));
  graph.edges.forEach((e) => {
    if (e.type === "alloc") held.set(e.to, (held.get(e.to) ?? 0) + 1);
  });
  const inCycle = new Set<string>();
  detectCycles(graph).cycles.flat().forEach((n) => inCycle.add(n));
  const candidates = graph.processes.filter((p) => inCycle.has(p));
  if (!candidates.length) return { victim: null, reason: "No processes involved in a deadlock cycle." };
  candidates.sort((a, b) => (held.get(a) ?? 0) - (held.get(b) ?? 0));
  const v = candidates[0];
  return {
    victim: v,
    reason: `Abort ${v} (holds ${held.get(v)} resource(s)) — minimal rollback cost.`,
  };
}