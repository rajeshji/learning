// Tier 11 -- Interview Combination Patterns, part 2 of 2 (final 7 combos).
const PATTERN_ACADEMY_22 = {
  "graph-heap": {
    title: "Combo \u2014 Graph + Heap",
    sections: [
      { type: "text", heading: "Why these two combine",
        body: "This is Dijkstra's algorithm framed as a combination: BFS-like exploration, but a min-heap replaces the plain queue so the NEXT node processed is always the one with the smallest known distance so far -- required once edges have different weights." },
      { type: "diagram", heading: "Mental model", dark: true,
        body: "minHeap = [(0, start)]\ndist = {start: 0}\nwhile heap not empty:\n  (d, u) = heap.pop()\n  if d > dist[u]: continue   // stale entry\n  for (v, w) in neighbors(u):\n    if dist[u]+w < dist.get(v, inf):\n      dist[v] = dist[u]+w\n      heap.push((dist[v], v))" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cShortest path with non-negative weighted edges\u201d is the canonical signal. If weights are all equal, plain BFS (no heap) is sufficient and faster.",
        conclusion: "Examples: Network Delay Time, Path With Minimum Effort, Cheapest Flights Within K Stops (with a modification for the stop limit)." }
    ]
  },

  "graph-dp": {
    title: "Combo \u2014 Graph + DP",
    sections: [
      { type: "text", heading: "Why these two combine",
        body: "When a graph has no cycles (a DAG), you can process nodes in topological order and treat each node's best answer as a DP state depending only on already-resolved predecessors/successors -- this is DAG DP, one of the cleanest applications of combining graph structure with dynamic programming." },
      { type: "diagram", heading: "Mental model", dark: true,
        body: "topoOrder = topological sort of the DAG\ndp[node] = base case for sources (or leaves, depending on direction)\nfor node in topoOrder:\n  for neighbor in edges(node):\n    dp[neighbor] = combine(dp[neighbor], dp[node] + edgeWeight)" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cLongest/shortest path in a DAG,\u201d \u201ccount paths between nodes,\u201d or \u201ccritical path scheduling\u201d -> topological sort + DP, never plain Dijkstra/Bellman-Ford (those are for general graphs, and DAG DP is faster).",
        conclusion: "Examples: Longest Path in a DAG, Course Schedule III, Parallel Courses, Critical Path Method." }
    ]
  },

  "sorting-lis": {
    title: "Combo \u2014 Sorting + LIS",
    sections: [
      { type: "text", heading: "Why these two combine",
        body: "Some problems look 2-dimensional (pairs, envelopes, intervals) but reduce to LIS once you sort by one dimension and then find the longest increasing subsequence on the other. Sorting removes one axis of freedom; LIS handles the rest." },
      { type: "diagram", heading: "Mental model -- Russian Doll Envelopes", dark: true,
        body: "envelopes sorted by width ascending\n  (ties broken by height DESCENDING to avoid same-width nesting)\nRun LIS on the heights array -> answer" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cChain/nest 2D items where each dimension must strictly increase\u201d -> sort by one dimension (careful with tie-breaking direction), then LIS on the remaining dimension.",
        conclusion: "Examples: Russian Doll Envelopes, Maximum Length of Pair Chain, Box Stacking." }
    ]
  },

  "lcs-dp": {
    title: "Combo \u2014 LCS + DP",
    sections: [
      { type: "text", heading: "Why these two combine",
        body: "LCS IS a DP pattern already (dp[i][j] over two sequences) -- this combo card exists because many derived problems are described as 'apply DP on top of an LCS-like alignment' (e.g. Shortest Common Supersequence, Minimum Deletions to make two strings equal, Uncrossed Lines) rather than naming LCS directly." },
      { type: "diagram", heading: "Mental model", dark: true,
        body: "dp[i][j] = LCS(A[0..i), B[0..j))\nMany reductions build on this same table:\n  SCS length      = |A| + |B| - LCS\n  Min deletions   = |A| + |B| - 2*LCS\n  Uncrossed Lines = literally LCS renamed" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "If a problem mentions two sequences and asks for a MINIMUM edit/deletion count or a MAXIMUM alignment/matching, check whether it reduces to LCS before designing a new recurrence from scratch.",
        conclusion: "See the full LCS lesson in Tier 7 for the underlying recurrence -- this card is the 'spot the reduction' recognition layer on top of it." }
    ]
  },

  "palindrome-partition-dp": {
    title: "Combo \u2014 Palindrome + Partition DP",
    sections: [
      { type: "text", heading: "Why these two combine",
        body: "Palindrome Partitioning asks: split a string into the minimum number of palindromic substrings. This needs BOTH a way to check 'is s[i..j] a palindrome?' (precomputed via Palindrome DP, dp[l][r]) AND a way to try every split point (Partition DP, dp[i] = min over j of dp[j] + 1 if s[j..i] is a palindrome)." },
      { type: "diagram", heading: "Mental model", dark: true,
        body: "isPalin[l][r] = precomputed via Palindrome DP (O(n^2) table)\ncuts[i] = min cuts needed for s[0..i]\ncuts[i] = min over j<=i where isPalin[j][i]:\n            (j == 0) ? 0 : cuts[j-1] + 1" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cMinimum cuts/partitions such that every piece is a palindrome\u201d is the exact signal -- always precompute the palindrome table FIRST (O(n^2)), then run the O(n^2) partition DP on top of it. Don't recompute palindrome checks inside the partition loop.",
        conclusion: "Example: Palindrome Partitioning II. Contrast with Palindrome Partitioning I, which is pure backtracking (enumerate ALL partitions, no minimization)." }
    ]
  },

  "heap-hashmap": {
    title: "Combo \u2014 Heap + HashMap",
    sections: [
      { type: "text", heading: "Why these two combine",
        body: "HashMap counts frequency; Heap extracts the top-K by that frequency. Neither alone answers 'top K frequent elements' efficiently -- you need the count first, then a heap to avoid a full O(n log n) sort when K is small." },
      { type: "diagram", heading: "Mental model", dark: true,
        body: "freq = HashMap of value -> count   (O(n))\nminHeap of size K, ordered by count\nfor each (value, count) in freq:\n  push to heap; if heap.size() > K: pop smallest\nresult = heap contents  (O(n log K), better than O(n log n) when K << n)" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cTop K frequent elements/words,\u201d \u201cK most common,\u201d or \u201csort by frequency\u201d with a small K relative to n -> HashMap for counting, heap for the top-K extraction.",
        conclusion: "Examples: Top K Frequent Elements, Top K Frequent Words, Sort Characters By Frequency." }
    ]
  },

  "monotonic-stack-array": {
    title: "Combo \u2014 Monotonic Stack + Array",
    sections: [
      { type: "text", heading: "Why these two combine",
        body: "This names the standalone Monotonic Stack pattern (Tier 2) explicitly in its most common application context: array problems asking for the next/previous greater or smaller element, or a boundary-based computation like histogram area, framed as an 'array + stack' combination for discoverability." },
      { type: "diagram", heading: "Mental model", dark: true,
        body: "stack = []  // indices, kept monotonic (increasing or decreasing values)\nfor i, val in enumerate(array):\n  while stack not empty and array[stack.top()] < val:  // condition depends on the question\n    resolved = stack.pop()\n    answer[resolved] = i  // val is the 'next greater' for resolved\n  stack.push(i)" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "See the full derivation in Tier 2's 'Monotonic Stack' lesson -- this combo card exists purely for discoverability under the array-problem framing interviewers often use.",
        conclusion: "Examples: Largest Rectangle in Histogram, Daily Temperatures, Trapping Rain Water (stack-based variant)." }
    ]
  }
};
