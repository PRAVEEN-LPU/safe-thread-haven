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

## 🧠 Core Algorithms & Functions

The project implements two primary deadlock management strategies located in `src/lib/deadlock.ts`:

### 1. Banker's Algorithm (Avoidance)
Used to determine if a system is in a "Safe State" before allocating resources.

- **`computeNeed(max, allocation)`**: 
  - **Input**: Max resources required and currently allocated resources.
  - **Logic**: Subtracts allocation from max to determine how much more each process needs.
  
- **`runBankers(input)`**:
  - **Logic**: Simulates resource allocation. It looks for a process whose needs are less than or equal to the current available resources. If found, it "finishes" the process, releases its resources back to the pool, and continues until all processes are safe or a deadlock is identified.

### 2. Resource Allocation Graph (Detection)
Used to detect deadlocks in systems where resources have single instances.

- **`detectCycles(graph)`**:
  - **Logic**: Uses a **Depth First Search (DFS)** algorithm to traverse the graph of processes and resources. If a node is revisited while still in the current recursion stack, a cycle is detected.
  
- **`suggestVictim(graph)`**:
  - **Logic**: If a deadlock is detected, this function evaluates all processes in the cycle. it calculates the "cost" (number of resources held) and suggests aborting the process with the **minimum** cost to resolve the deadlock with the least impact.

---

## 🛠️ Tech Stack
- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Icons**: Lucide React
- **Graphs**: Custom SVG-based RAG visualization

---

Built by **PRAVEEN-LPU**
