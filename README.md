# Safe Thread Haven - Deadlock Management Toolkit

An interactive web-based toolkit for visualizing, detecting, and preventing deadlocks in Operating Systems using deterministic algorithms.

## 🚀 How to Execute

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Steps to Run
1. **Clone the repository**:
   ```bash
   git clone https://github.com/PRAVEEN-LPU/safe-thread-haven.git
   cd safe-thread-haven
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:8080](http://localhost:8080) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🏗️ Detailed Architecture & Code Logic

This project follows a modular React architecture. Below is a granular breakdown of each core file and function.

### 1. Core Logic: `src/lib/deadlock.ts`
This file contains the "brain" of the application—the deterministic algorithms for deadlock handling.

#### **A. Banker's Algorithm Suite**
- **`computeNeed(max: number[][], allocation: number[][])`**
  - **Logic**: Performs a matrix subtraction. 
  - **Line-by-line**: `max.map((row, i) => row.map((v, j) => v - allocation[i][j]))`. 
  - **Purpose**: Determines exactly how many instances of each resource a process still requires to complete its task.
- **`runBankers(input: BankerInput)`**
  - **Inputs**: `processes`, `available`, `max`, `allocation`.
  - **State Variables**: 
    - `work`: A copy of `available` that increases as processes release resources.
    - `finish`: A boolean array tracking which processes have safely completed.
  - **Main Loop**: Uses a `while(progress)` loop. In each pass, it checks every unfinished process.
  - **Safety Check**: If `Need[i] <= Work`, the process is considered "safe to run". 
  - **Resource Release**: Once a process "runs", it releases its `Allocation` back to `Work` (`Work = Work + Allocation`).
  - **Result**: Returns a `BankerResult` containing the `safe` status, the execution `sequence`, and a detailed `steps` log.

#### **B. RAG & Cycle Detection**
- **`detectCycles(graph: RAGInput)`**
  - **Graph Representation**: Converts processes and resources into nodes in an adjacency list.
  - **DFS Implementation**: 
    - Uses a `visited` set to avoid redundant checks.
    - Uses an `onStack` set (recursion stack) to detect back-edges.
    - If a node is encountered that is already `onStack`, a **Cycle** is found.
  - **Cycle Extraction**: Traces the recursion stack back to the start of the cycle to return the exact path (e.g., `P0 -> R1 -> P1 -> R0 -> P0`).
- **`suggestVictim(graph: RAGInput)`**
  - **Heuristic**: Abort the process with the minimum "held" resources.
  - **Logic**: 
    - 1. Calls `detectCycles`.
    - 2. Filters processes involved in the cycle.
    - 3. Counts outgoing "alloc" edges for each process.
    - 4. Returns the process with the lowest count to minimize system rollback cost.

---

## 🧩 UI Component Breakdown

### 1. `BankersPanel.tsx`
The primary interface for the Banker's Algorithm.
- **Dynamic State**: Manages `input` (matrices) and `result`.
- **Matrix Editors**: Custom components (`MatrixEditor`, `VectorEditor`) allow real-time editing of Resource/Process counts.
- **Auto-Compute**: Uses `useMemo` to update the `Need` matrix instantly as the user types.

### 2. `RAGPanel.tsx`
A visual canvas for the Resource Allocation Graph.
- **Node Management**: Users can add Process nodes (circles) or Resource nodes (rectangles).
- **Edge Management**: Supports "Request" (P -> R) and "Allocation" (R -> P) edges.
- **Live Detection**: Calls `detectCycles` on every graph change to highlight deadlocked paths in red.

### 3. `SimulatorPanel.tsx`
Pre-configured scenarios.
- **Logic**: Loads "Classic Deadlock" (Dining Philosophers, etc.) or "Safe States" to help users understand complex interleaving without manual input.

---

## 🛠️ Tech Stack & Styling
- **React 18**: Component-based UI.
- **Tailwind CSS**: Modern, utility-first styling with a dark-themed "Glassmorphism" aesthetic.
- **Shadcn UI**: High-quality accessible components (Tabs, Cards, Buttons, Dialogs).
- **Lucide React**: Clean, consistent iconography.
- **Vitest**: Unit testing for the core algorithm logic (`src/test/example.test.ts`).

---

Built by **PRAVEEN-LPU**
