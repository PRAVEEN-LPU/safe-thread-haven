import { Input } from "@/components/ui/input";

interface Props {
  rows: string[];      // process labels
  cols: string[];      // resource labels
  values: number[][];
  onChange: (next: number[][]) => void;
  label: string;
  accent?: "primary" | "accent" | "warning";
}

const accentMap = {
  primary: "text-primary",
  accent: "text-accent",
  warning: "text-warning",
};

export const MatrixEditor = ({ rows, cols, values, onChange, label, accent = "primary" }: Props) => {
  const setCell = (i: number, j: number, v: string) => {
    const n = Math.max(0, Math.min(99, parseInt(v || "0", 10) || 0));
    const next = values.map((r) => [...r]);
    next[i][j] = n;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className={`text-xs font-mono-data uppercase tracking-wider ${accentMap[accent]}`}>{label}</div>
      <div className="overflow-x-auto rounded-lg border border-border/60 bg-card/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60">
              <th className="p-2 text-left text-muted-foreground font-mono-data text-xs"> </th>
              {cols.map((c) => (
                <th key={c} className="p-2 text-center font-mono-data text-xs text-muted-foreground">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r} className="border-b border-border/40 last:border-0">
                <td className="p-2 font-mono-data text-xs text-muted-foreground">{r}</td>
                {cols.map((_, j) => (
                  <td key={j} className="p-1">
                    <Input
                      value={values[i]?.[j] ?? 0}
                      onChange={(e) => setCell(i, j, e.target.value)}
                      inputMode="numeric"
                      className="h-8 w-14 text-center font-mono-data bg-background/60"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface VectorProps {
  cols: string[];
  values: number[];
  onChange: (next: number[]) => void;
  label: string;
}

export const VectorEditor = ({ cols, values, onChange, label }: VectorProps) => {
  const setCell = (j: number, v: string) => {
    const n = Math.max(0, Math.min(99, parseInt(v || "0", 10) || 0));
    const next = [...values];
    next[j] = n;
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <div className="text-xs font-mono-data uppercase tracking-wider text-accent">{label}</div>
      <div className="rounded-lg border border-border/60 bg-card/40 p-2 flex gap-2">
        {cols.map((c, j) => (
          <div key={c} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground font-mono-data">{c}</span>
            <Input
              value={values[j] ?? 0}
              onChange={(e) => setCell(j, e.target.value)}
              inputMode="numeric"
              className="h-8 w-14 text-center font-mono-data bg-background/60"
            />
          </div>
        ))}
      </div>
    </div>
  );
};