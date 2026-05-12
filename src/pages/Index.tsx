import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/deadlock/Header";
import { BankersPanel } from "@/components/deadlock/BankersPanel";
import { RAGPanel } from "@/components/deadlock/RAGPanel";
import { SimulatorPanel } from "@/components/deadlock/SimulatorPanel";
import { Calculator, GitGraph, FlaskConical } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 space-y-8">
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 text-xs font-mono-data uppercase tracking-widest text-primary border border-primary/30 rounded-full px-3 py-1 bg-primary/5">
            OS · Concurrency · Resource Mgmt
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Detect, prevent &amp; recover from <span className="text-gradient-primary">deadlocks</span> in real time
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            An interactive toolkit implementing the Banker's Algorithm and Resource Allocation Graphs,
            with a live simulator for classic deadlock scenarios.
          </p>
        </section>

        <Tabs defaultValue="bankers" className="w-full">
          <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-3 bg-card/60 border border-border/60">
            <TabsTrigger value="bankers" className="gap-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
              <Calculator className="h-4 w-4" /> Banker's
            </TabsTrigger>
            <TabsTrigger value="rag" className="gap-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
              <GitGraph className="h-4 w-4" /> RAG
            </TabsTrigger>
            <TabsTrigger value="sim" className="gap-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
              <FlaskConical className="h-4 w-4" /> Simulator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bankers" className="mt-6">
            <BankersPanel />
          </TabsContent>
          <TabsContent value="rag" className="mt-6">
            <RAGPanel />
          </TabsContent>
          <TabsContent value="sim" className="mt-6">
            <SimulatorPanel />
          </TabsContent>
        </Tabs>

        <footer className="text-center text-xs text-muted-foreground font-mono-data pt-8 border-t border-border/40">
          Built with deterministic algorithms · Banker's safety · DFS cycle detection
        </footer>
      </main>
    </div>
  );
};

export default Index;
