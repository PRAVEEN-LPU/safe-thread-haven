import { Activity, ShieldCheck } from "lucide-react";

export const Header = () => (
  <header className="border-b border-border/60 backdrop-blur-md bg-background/60 sticky top-0 z-30">
    <div className="container flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center glow-primary">
          <ShieldCheck className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Deadlock <span className="text-gradient-primary">Toolkit</span>
          </h1>
          <p className="text-xs text-muted-foreground font-mono-data">
            Detection · Prevention · Recovery
          </p>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono-data">
        <Activity className="h-3.5 w-3.5 text-primary ring-pulse" />
        <span>real-time analyzer</span>
      </div>
    </div>
  </header>
);