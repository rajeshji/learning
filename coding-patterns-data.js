// The complete algorithmic pattern vocabulary, sourced from coding.txt.
// TIERS = ordered groups matching the site's "Tier 1..8" structure.
// Each pattern: { num, name, subs[], note? } — note is an aside like
// "this isn't really its own pattern" that gets rendered distinctly.
const TIERS = [
  {
    id: "t1", emoji: "\ud83d\udfe2", title: "Tier 1 \u2014 Arrays & Strings",
    subtitle: "Your immediate priority", color: "emerald",
    patterns: [
      { num: 1, name: "HashMap / HashSet", subs: ["Frequency", "Existence", "Complement", "Value \u2192 Index", "Grouping"] },
      { num: 2, name: "Two Pointers", subs: ["Opposite direction", "Same direction", "Fast/slow", "Read/write", "Partition"] },
      { num: 3, name: "Sliding Window", subs: ["Fixed window", "Variable window", "At most K", "Exactly K", "Minimum window", "Maximum window"] },
      { num: 4, name: "Prefix Sum \u2b50", subs: ["Basic prefix sum", "Prefix sum + HashMap", "Prefix sum + modulo", "2D prefix sum", "Difference array"] },
      { num: 5, name: "Binary Search", subs: ["Normal binary search", "First/last occurrence", "Lower/upper bound", "Rotated array", "Peak", "Binary search on answer"] },
      { num: 6, name: "Sorting + Scanning", subs: ["Sort + two pointers", "Sort + greedy", "Sort + grouping", "Sort + interval processing"] },
      { num: 7, name: "Intervals", subs: ["Merge intervals", "Overlap", "Insert interval", "Meeting rooms", "Interval scheduling", "Sweep line"] },
      { num: 8, name: "Kadane / Running Optimization", subs: ["Maximum subarray", "Maximum/minimum running state", "Maximum product variants"] },
      { num: 9, name: "Bit Manipulation", subs: ["XOR", "Parity", "Bit masking", "Set/unset bits", "Power of two", "Subsets using bits"],
        note: "Parity is NOT a completely separate major pattern \u2014 it's a small technique inside Bit Manipulation / counting." }
    ]
  },
  {
    id: "t2", emoji: "\ud83d\udfe1", title: "Tier 2 \u2014 Stack, Queue & Heap",
    subtitle: null, color: "amber",
    patterns: [
      { num: 10, name: "Stack", subs: ["Matching", "Parentheses", "Expression processing"] },
      { num: 11, name: "Monotonic Stack", subs: ["Next greater", "Next smaller", "Previous greater", "Previous smaller", "Histogram"] },
      { num: 12, name: "Monotonic Queue", subs: ["Sliding maximum", "Sliding minimum"] },
      { num: 13, name: "Heap / Priority Queue", subs: ["Top K", "Kth element", "K closest", "Merge K", "Scheduling"] },
      { num: 14, name: "Two Heaps", subs: ["Median", "Dynamic ranking"] }
    ]
  },
  {
    id: "t3", emoji: "\ud83d\udfe1", title: "Tier 3 \u2014 Linked Lists",
    subtitle: null, color: "amber",
    patterns: [
      { num: 15, name: "Fast & Slow Pointer", subs: ["Cycle", "Middle", "Palindrome"] },
      { num: 16, name: "Linked List Reversal / Manipulation", subs: ["Reverse", "Reverse K", "Merge", "Reconnect"] }
    ]
  },
  {
    id: "t4", emoji: "\ud83d\udfe1", title: "Tier 4 \u2014 Trees",
    subtitle: null, color: "amber",
    patterns: [
      { num: 17, name: "Tree DFS", subs: ["Path problems", "Return-value DFS", "Tree DP"] },
      { num: 18, name: "Tree BFS", subs: ["Level order", "Views", "Distance/levels"] },
      { num: 19, name: "BST", subs: ["Search", "Insertion", "Kth smallest", "BST property"] },
      { num: 20, name: "Tree Path", subs: ["Root-to-leaf", "Any-to-any", "Path sum", "Diameter", "Prefix sum + HashMap"] },
      { num: 21, name: "LCA", subs: ["Binary tree", "BST"] },
      { num: 22, name: "Tree DP", subs: ["Single-state", "Choose/Don't choose", "Global answer", "Rerooting"] }
    ]
  },
  {
    id: "t5", emoji: "\ud83d\udfe1", title: "Tier 5 \u2014 Graphs",
    subtitle: null, color: "amber",
    patterns: [
      { num: 23, name: "Graph DFS", subs: ["Components", "Connectivity", "Cycle detection"] },
      { num: 24, name: "Graph BFS", subs: ["Shortest unweighted path", "Levels"] },
      { num: 25, name: "Grid DFS/BFS", subs: ["Number of Islands", "Flood Fill", "Multi-source grid BFS", "Grid + State"] },
      { num: 26, name: "Multi-Source BFS", subs: ["Nearest source", "Simultaneous expansion"] },
      { num: 27, name: "Topological Sort", subs: ["Dependencies", "Prerequisites", "Ordering"] },
      { num: 28, name: "Union Find / DSU", subs: ["Connectivity", "Component merging", "Dynamic connectivity"] },
      { num: 29, name: "Shortest Path", subs: ["BFS", "0-1 BFS", "Dijkstra", "Bellman-Ford"] },
      { num: 30, name: "Floyd-Warshall", subs: ["All-pairs shortest path", "Graph DP", "Negative cycle detection", "Transitive closure"] },
      { num: 31, name: "Minimum Spanning Tree", subs: ["Kruskal", "Prim"] },
      { num: 32, name: "Bipartite Graph", subs: ["2-coloring", "BFS/DFS coloring", "Odd cycle detection", "Grid parity"] },
      { num: 33, name: "Strongly Connected Components", subs: ["Kosaraju", "Tarjan", "Condensation graph"] },
      { num: 34, name: "DAG DP", subs: ["Shortest path in DAG", "Longest path in DAG", "Number of paths", "Critical path"] }
    ]
  },
  {
    id: "t6", emoji: "\ud83d\udfe1", title: "Tier 6 \u2014 Trie & Backtracking",
    subtitle: null, color: "amber",
    patterns: [
      { num: 35, name: "Trie", subs: ["Prefix lookup", "Autocomplete", "Word search"] },
      { num: 36, name: "Trie + Prefix Search", subs: ["Autocomplete", "Top-K / Trie+Heap", "Shortest unique prefix", "Prefix frequency", "Word Break + Trie"] },
      { num: 37, name: "Trie + DFS", subs: ["Lexicographical order", "Wildcard search", "Word Search II", "Trie + Backtracking"] },
      { num: 38, name: "Trie + Backtracking", subs: ["Word Search II", "Word Squares", "Crossword placement", "Phone T9 / word generation", "Dynamic Trie pruning"] },
      { num: 39, name: "Trie + Wildcard", subs: ["Add and Search Word", "Wildcard prefix", "Regex-like matching", "Wildcard + Top-K"] },
      { num: 40, name: "Trie + Frequency", subs: ["prefixCount vs wordCount", "Most frequent with prefix", "Top-K at each node", "Read-heavy precomputation"] },
      { num: 41, name: "Backtracking", subs: ["Subsets", "Permutations", "Combinations", "Partitioning", "N-Queens", "Sudoku"] },
      { num: 42, name: "Subsets", subs: ["Take/Skip", "Loop + startIndex", "Subsets with duplicates", "Subsets with bitmask"] },
      { num: 43, name: "Permutations", subs: ["visited[] template", "Unique permutations", "K-th permutation", "Next permutation", "Permutation + bitmask"] },
      { num: 44, name: "Combinations", subs: ["startIndex template", "Capacity pruning", "Combinations with duplicates", "Combination vs Combination Sum"] },
      { num: 45, name: "Combination Sum", subs: ["Reuse allowed (CS I)", "No reuse + duplicates (CS II)", "Fixed K (CS III)", "Order matters -> DP (CS IV)", "Bound pruning"] },
      { num: 46, name: "Partitioning", subs: ["Palindrome Partitioning", "Restore IP Addresses", "Word Break", "Palindrome Partitioning II -> DP", "Expression Add Operators"] },
      { num: 47, name: "Grid Backtracking", subs: ["Word Search", "Word Search II (Trie + Grid)", "Maze / path finding", "Hamiltonian path", "Grid DP vs Grid Backtracking"] },
      { num: 48, name: "Constraint Backtracking", subs: ["N-Queens", "Sudoku", "Graph coloring", "MRV / constraint propagation", "State design"] },
      { num: 49, name: "Backtracking + Trie", subs: ["Word Search II", "Word Squares", "Boggle", "Dead-branch pruning", "Trie vs HashSet vs Aho-Corasick"] },
      { num: 50, name: "Backtracking + Bitmask", subs: ["Permutations with bitmask", "Hamiltonian Path", "TSP -> Bitmask DP", "N-Queens + bitmask", "State compression"] },
      { num: 51, name: "Pruning", subs: ["Bound pruning (cut when remaining can't beat best)", "Constraint pruning (invalid state, stop early)", "Duplicate pruning (sort + skip same value)", "Memoization as pruning", "MRV / most-constrained-first ordering"],
        note: "Not really a separate algorithm \u2014 it's a technique used to make backtracking efficient." }
    ]
  },
  {
    id: "t7", emoji: "\ud83d\udd34", title: "Tier 7 \u2014 Dynamic Programming",
    subtitle: "DP deserves its own curriculum", color: "rose",
    patterns: [
      { num: 52, name: "1D DP", subs: ["dp[i] state definition", "4 recurrence shapes", "Top-down vs Bottom-up", "Space optimization", "Optimization vs Counting vs Feasibility"] },
      { num: 53, name: "Take / Skip DP", subs: ["House Robber recurrence", "Forward vs Backward DP", "nextIndex(i) generalization", "Circular array split", "Weighted Interval Scheduling"] },
      { num: 54, name: "Linear DP", subs: ["dp[i] combines earlier/nearby states", "Decode Ways, Min Cost, Maximum Subarray", "Forward vs Backward direction", "Linear DP vs Greedy vs Sliding Window vs Prefix Sum"] },
      { num: 55, name: "Prefix DP", subs: ["dp[i] tries every previous split j", "Word Break recurrence", "Boolean / Minimum / Maximum / Counting variants", "Last-Segment Principle", "Prefix DP vs Interval DP vs 2D DP"] },
      { num: 56, name: "2D / Grid DP", subs: ["dp[row][col] state definition", "Unique Paths, Minimum/Maximum Path Sum", "Obstacles as transition constraints", "Row compression to 1D space", "Grid DP vs BFS vs Dijkstra vs DFS+Memo"] },
      { num: 57, name: "Grid Path DP", subs: ["Merging paths into one dp[r][c] state", "Counting / Min / Max / Feasibility variants", "Path constraints -> dp[r][c][sum/k/mask]", "Path reconstruction with parent pointers", "Grid Path DP vs BFS vs Dijkstra vs DFS+Memo"] },
      { num: 58, name: "Constraint Grid DP", subs: ["Golden rule: different futures -> different states", "dp[r][c][k/sum/mask/energy/time] modeling", "Dominance pruning (more resource is never worse)", "State compression: parity, modulo, bitmask", "Constraint Grid DP vs BFS+State vs Dijkstra+State"] },
      { num: 59, name: "0/1 Knapsack", subs: ["dp[i][capacity] state definition", "SKIP vs TAKE with the i-1 rule", "Backward iteration for 1D space compression", "Subset Sum, Partition, Target Sum reductions", "Forward (unbounded) vs backward (0/1) iteration rule"] },
      { num: 60, name: "Unbounded Knapsack", subs: ["dp[c] with unlimited item reuse", "Forward iteration -- the deep dependency reason", "Coin Change: minimum coins vs number of combinations", "Combinations vs permutations loop-order rule", "Rod Cutting and the 'final piece' mental model"] },
      { num: 61, name: "Subset Sum", subs: ["Subset vs Subarray vs Subsequence distinction", "dp[s] feasibility -- backward, once per element", "Count subsets, closest sum, minimum difference", "Equal Partition & Target Sum reductions", "Negative numbers, pseudo-polynomial cost, bitset/meet-in-the-middle"] },
      { num: 62, name: "Partition DP", subs: ["Set Partition (Subset Sum) vs Array Partition (this pattern)", "dp[i][k]: first i elements split into k contiguous groups", "Last-segment recurrence: dp[j][k-1] + cost(j,i)", "min(max(...)) for minimizing the largest segment", "Partition DP vs Binary Search + Greedy vs Prefix DP vs Interval DP"] },
      { num: 63, name: "Target Sum", subs: ["+/- assignment as a reduction, not a new algorithm", "P - N = target, P + N = total -> P = (total+target)/2", "Count-subset DP after the algebraic transform", "Zeroes double the ways: dp[s] += dp[s]", "General difference formula: two groups differing by D"] },
      { num: 64, name: "Coin Change", subs: ["Application of Unbounded Knapsack, not a new core pattern", "Coin Change I: minimum coins via dp[a]=min(dp[a],dp[a-coin]+1)", "Coin Change II: combinations via dp[a]+=dp[a-coin]", "Why coin-outer/amount-inner counts combinations, not permutations", "Coin Change vs Subset Sum vs Target Sum vs Partition DP"] },
      { num: 65, name: "LCS", subs: ["dp[i][j]: two sequences, two positions -- a new DP family", "Match -> diagonal + 1; mismatch -> max(up, left)", "LCS reconstruction by walking the DP table backward", "LCS vs Longest Common Substring vs LIS vs Edit Distance", "Reductions: Shortest Common Supersequence, min deletions, Uncrossed Lines"] },
      { num: 66, name: "Longest Common Substring", subs: ["A contiguity constraint, not a new core pattern", "dp[i][j] = length ending exactly at i,j (not 'best so far')", "Match -> diagonal + 1; mismatch -> 0 (continuity breaks)", "Answer = max over the whole table, not dp[m][n]", "Substring vs Subsequence vs Subset -- the three-way recognition rule"] },
      { num: 67, name: "Edit Distance", subs: ["dp[i][j] = min operations to transform prefix i into prefix j", "Match -> diagonal (no cost); mismatch -> 1 + min(up, left, diagonal)", "UP=delete from A, LEFT=insert into B, DIAGONAL=replace", "Weighted operations, insert/delete-only, and LCS-based reductions", "Edit Distance vs LCS vs Longest Common Substring -- same state, different objective"] },
      { num: 68, name: "Shortest Common Supersequence", subs: ["A reduction, not a new core pattern: SCS -> LCS", "SCS length = m + n - LCS(A,B) via maximum overlap", "Reconstruction: match -> diagonal; mismatch -> follow larger LCS direction", "m+n-L (merge, share once) vs m+n-2L (equalize, delete both sides)", "Recognition drill across LCS / Substring / SCS / Edit Distance phrasing"] },
      { num: 69, name: "Distinct Subsequences", subs: ["dp[i][j] = ways to form first j of t from first i of s", "Match -> use + skip: dp[i-1][j-1] + dp[i-1][j] (ADD, not max)", "Mismatch -> skip source only: dp[i-1][j] (no dp[i][j-1])", "Base case dp[i][0]=1 -- one way to form empty target: choose nothing", "Counting DP: backward 1D iteration mirrors 0/1 Knapsack's take-once rule"] },
      { num: 70, name: "Interleaving String", subs: ["dp[i][j] = can first i of s1 + first j of s2 form first i+j of s3?", "Key state-compression insight: k = i+j is derived, never stored separately", "Transition: (s1[i-1]==s3[k] AND dp[i-1][j]) OR (s2[j-1]==s3[k] AND dp[i][j-1])", "Boolean DP -- existence uses OR, counting the number of ways would use +", "Why greedy fails when both sources offer the same next character"] },
      { num: 71, name: "LIS", subs: ["A major pattern: dp[i] = best answer ending exactly at i (one sequence)", "O(n^2): for j<i, if nums[j]<nums[i], dp[i]=max(dp[i], dp[j]+1)", "O(n log n): tails[k] = smallest ending value for length k+1, via binary search", "Strictly increasing vs non-decreasing -- lower_bound vs upper_bound", "Generic Chain DP template: sort + compatible(j,i) -- Russian Doll Envelopes, Longest Chain"] },
      { num: 72, name: "Palindrome DP", subs: ["New shape: dp[l][r] over a RANGE, not two sequences or one position", "LPS: match -> dp[l+1][r-1]+2; mismatch -> max(dp[l+1][r], dp[l][r-1])", "Beautiful reduction: LPS(s) = LCS(s, reverse(s)); min insertions = n - LPS", "Longest Palindromic Substring: boolean dp[l][r], or O(1)-space center expansion", "Interval DP family: Matrix Chain, Burst Balloons, Merge Stones, Palindrome Partitioning"] },
      { num: 73, name: "Knapsack DP", subs: ["0/1", "Unbounded", "Subset Sum", "Partition"] },
      { num: 74, name: "Subsequence DP", subs: ["LIS", "LCS"] },
      { num: 75, name: "String DP", subs: ["Edit Distance", "Word Break", "Palindrome"] },
      { num: 76, name: "Interval DP", subs: ["dp[l][r] over a range/interval", "Matrix Chain Multiplication (split point k)", "Burst Balloons (choose last, not first)", "Merge Stones / Merge Intervals cost", "Palindrome Partitioning II"] },
      { num: 77, name: "State Machine DP", subs: ["Stock problems"] },
      { num: 78, name: "Bitmask DP", subs: ["dp[mask] / dp[i][mask] state", "Traveling Salesman Problem", "Assign tasks to workers", "Visit-all-nodes shortest path", "Subset enumeration inside DP"] },
      { num: 79, name: "DP + Binary Search", subs: ["LIS in O(n log n) via tails[] array", "Weighted Interval Scheduling with binary search", "Binary search on the DP answer itself", "Patience sorting mental model"] }
    ]
  },
  {
    id: "t8", emoji: "\ud83d\udd34", title: "Tier 8 \u2014 Advanced",
    subtitle: "Later, not now", color: "rose",
    patterns: [
      { num: 80, name: "Fenwick Tree", subs: ["Point update + prefix sum query", "Range update + point query (diff-array Fenwick)", "Range update + range query (two Fenwicks)", "Count inversions / order statistics"] },
      { num: 81, name: "Segment Tree", subs: ["Range sum / min / max query", "Point update", "Range update + lazy propagation", "Merge-sort tree / persistent segment tree"] },
      { num: 82, name: "Sweep Line", subs: ["Event sorting (start/end)", "Interval overlap counting", "Skyline problem", "Closest pair of points"] },
      { num: 83, name: "Coordinate Compression", subs: ["Map large sparse values to dense indices", "Combine with Fenwick/Segment Tree for range queries", "Rank-based binary search"] },
      { num: 84, name: "Difference Array", subs: ["Range increment in O(1)", "Rebuild via prefix sum at the end", "2D difference array for grid range updates"] },
      { num: 85, name: "Advanced Bit Manipulation", subs: ["Bitmask subset iteration (submask enumeration)", "Gray code", "Bit DP transitions", "Fast XOR basis / linear basis"] },
      { num: 86, name: "Math / Number Theory", subs: ["GCD", "LCM", "Sieve", "Modular arithmetic", "Combinatorics"] }
    ]
  },
  {
    id: "t9", emoji: "\ud83d\udd35", title: "Tier 9 \u2014 Greedy",
    subtitle: "Sort/observe, then commit to the locally-best choice", color: "amber",
    patterns: [
      { num: 87, name: "Activity Selection", subs: ["Sort by finish time", "Pick earliest-finishing compatible activity"] },
      { num: 88, name: "Interval Scheduling", subs: ["Maximum non-overlapping intervals", "Minimum removals to make non-overlapping"] },
      { num: 89, name: "Jump Game", subs: ["Maintain farthest reachable index", "Minimum jumps via BFS-like greedy levels"] },
      { num: 90, name: "Gas Station", subs: ["Reset start point when tank goes negative", "Total sum >= 0 implies a solution exists"] },
      { num: 91, name: "Two City / Cost Greedy", subs: ["Sort by cost difference", "Split into two equal halves"] },
      { num: 92, name: "Task Scheduling", subs: ["Frequency + cooldown", "Max heap of remaining counts"] },
      { num: 93, name: "Greedy + Heap", subs: ["Always take best available candidate", "Reconstruct queue by height"] },
      { num: 94, name: "Greedy + Sorting", subs: ["Sort to expose the exchange argument", "Prove greedy via exchange/contradiction"] },
      { num: 95, name: "Minimum Platforms / Resources", subs: ["Sweep start/end events", "Track concurrent overlap count"] },
      { num: 96, name: "Huffman / Optimal Merge", subs: ["Repeatedly combine two smallest", "Min-heap driven merge cost"] }
    ]
  },
  {
    id: "t10", emoji: "\ud83d\udd35", title: "Tier 10 \u2014 Advanced String Algorithms",
    subtitle: "Pattern matching at scale", color: "amber",
    patterns: [
      { num: 97, name: "KMP", subs: ["Prefix function / failure links", "Linear-time substring search"] },
      { num: 98, name: "Z Algorithm", subs: ["Z-array = longest match with prefix", "Pattern matching via concatenation"] },
      { num: 99, name: "Rabin-Karp", subs: ["Rolling hash comparison", "Multiple pattern search"] },
      { num: 100, name: "Rolling Hash", subs: ["O(1) substring hash comparison", "Double hashing to avoid collisions"] },
      { num: 101, name: "Manacher", subs: ["All palindromic substrings in O(n)", "Odd/even length unification trick"] },
      { num: 102, name: "String Hashing", subs: ["Compare substrings efficiently", "Detect duplicate substrings"] },
      { num: 103, name: "Suffix Array", subs: ["Sort all suffixes", "LCP array for substring queries"] },
      { num: 104, name: "Suffix Automaton", subs: ["Compact representation of all substrings", "Count distinct substrings"] }
    ]
  },
  {
    id: "t11", emoji: "\ud83d\udd35", title: "Tier 11 \u2014 Interview Combination Patterns",
    subtitle: "Real interviews rarely fit one box -- these are the common pairings", color: "amber",
    patterns: [
      { num: 105, name: "HashMap + Sliding Window", subs: ["Longest substring without repeat"] },
      { num: 106, name: "Sorting + Two Pointers", subs: ["Pair/triplet sum problems"] },
      { num: 107, name: "Prefix Sum + HashMap", subs: ["Subarray sum equals K"] },
      { num: 108, name: "Binary Search + Greedy", subs: ["Minimum feasible answer"] },
      { num: 109, name: "Heap + Greedy", subs: ["Task/CPU scheduling"] },
      { num: 110, name: "BFS + HashSet", subs: ["State-space search / word ladder"] },
      { num: 111, name: "DFS + Backtracking", subs: ["Word Search"] },
      { num: 112, name: "Trie + Backtracking", subs: ["Word Search II"] },
      { num: 113, name: "Graph + Union-Find", subs: ["Connectivity queries"] },
      { num: 114, name: "Graph + Heap", subs: ["Dijkstra's algorithm"] },
      { num: 115, name: "Graph + DP", subs: ["DAG shortest/longest path"] },
      { num: 116, name: "Sorting + LIS", subs: ["Russian Doll Envelopes"] },
      { num: 117, name: "LCS + DP", subs: ["Shortest Common Supersequence"] },
      { num: 118, name: "Palindrome + Partition DP", subs: ["Palindrome Partitioning II"] },
      { num: 119, name: "DP + Binary Search", subs: ["Optimized sequence DP"] },
      { num: 120, name: "Heap + HashMap", subs: ["Top-K frequent elements"] },
      { num: 121, name: "Monotonic Stack + Array", subs: ["Largest Rectangle in Histogram"] },
      { num: 122, name: "Bitmask + DP", subs: ["Traveling Salesman Problem"] }
    ]
  }
];

// Page-level framing content (the "why this page looks like this" narrative).
const PATTERN_META = {
  countSummary: {
    core: "\u2248 30 core patterns",
    variations: "\u2248 40\u201350 variations",
    problems: "\u2248 150\u2013200 interview problems"
  },
  priorityOrder: [
    "HashMap", "Two Pointers", "Sliding Window", "Prefix Sum", "Binary Search",
    "Sorting + Scanning", "Intervals", "Kadane", "Bit/Math techniques", "\u2192 then Dynamic Programming"
  ],
  priorityNote: "You said DS-related problems feel comfortable, but Arrays/Strings/DP feel like a struggle \u2014 so this is the order we tackle Tier 1 in before moving to DP.",
  phases: [
    {
      title: "Phase 1 \u2014 Pattern Academy",
      desc: "Learn each pattern before touching problems.",
      steps: ["What is it?", "Why does it exist?", "When do I use it?", "Recognition triggers", "When NOT to use it", "Mental model", "Generic algorithm", "Variations", "Tiny examples"]
    },
    {
      title: "Phase 2 \u2014 Pattern Recognition",
      desc: "Mixed problems, no coding yet \u2014 just identify the pattern and justify why.",
      steps: ["Problem", "Which pattern?", "Why?"]
    },
    {
      title: "Phase 3 \u2014 Problem Solving",
      desc: "Now actually solve, ramping difficulty per pattern.",
      steps: ["Pattern", "Easy", "Medium", "Hard", "Unseen", "Company-style"]
    }
  ]
};
