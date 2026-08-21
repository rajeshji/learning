// Tier 11 -- Interview Combination Patterns, part 1 of 2. These are shorter
// lessons by design: each is a PAIRING of two already-taught core patterns,
// not a new algorithm, so the lesson focuses on WHY they combine + recognition.
const PATTERN_ACADEMY_21 = {
  "hashmap-sliding-window": {
    title: "Combo \u2014 HashMap + Sliding Window",
    sections: [
      { type: "text", heading: "Why these two combine",
        body: "Sliding Window tells you WHEN to grow/shrink a window; HashMap tells you WHAT to track inside it (character counts, last-seen index, distinct-element counts). Neither alone solves 'longest substring without repeating characters' -- the window needs a fast way to check 'have I seen this before, and where?'" },
      { type: "diagram", heading: "Mental model", dark: true,
        body: "window [L..R]\nHashMap tracks: char -> last seen index (or frequency)\nOn duplicate found inside window: L = max(L, lastSeen[char] + 1)\nExpand R every step; shrink L only when the map signals a violation" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cLongest/shortest substring/subarray satisfying a frequency or distinctness condition\u201d -> Sliding Window for the window mechanics, HashMap for the condition check.",
        conclusion: "Examples: Longest Substring Without Repeating Characters, Minimum Window Substring, Longest Substring with At Most K Distinct Characters." }
    ]
  },

  "sorting-two-pointers": {
    title: "Combo \u2014 Sorting + Two Pointers",
    sections: [
      { type: "text", heading: "Why these two combine",
        body: "Two Pointers relies on being able to safely eliminate part of the search space by moving one side inward -- that safety guarantee usually only exists once the array is sorted. Sorting costs O(n log n) up front but turns an O(n^2) or O(n^3) brute force into O(n^2) or O(n) respectively." },
      { type: "diagram", heading: "Mental model", dark: true,
        body: "sort(nums)\nfor i in 0..n-1 (fix one element):\n  L = i+1, R = n-1\n  while L < R:\n    compare sum/condition against target\n    move L or R inward based on the comparison" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cPairs/triplets summing to a target,\u201d \u201cclosest sum,\u201d or \u201ccount pairs satisfying a condition\u201d in an array where order doesn't matter for the answer -> sort first, then two pointers.",
        conclusion: "Examples: 3Sum, 3Sum Closest, 4Sum, Container With Most Water (already sorted by construction there)." }
    ]
  },

  "prefix-sum-hashmap": {
    title: "Combo \u2014 Prefix Sum + HashMap",
    sections: [
      { type: "text", heading: "Why these two combine",
        body: "Prefix Sum turns 'sum of a range' into a subtraction of two prefix values: sum(i,j) = prefix[j] - prefix[i-1]. To find how many ranges sum to exactly K without checking every pair, store how many times each prefix value has been seen in a HashMap -- turning an O(n^2) range-sum search into O(n)." },
      { type: "diagram", heading: "Mental model", dark: true,
        body: "seen = {0: 1}  // empty prefix sum occurs once\nrunningSum = 0, count = 0\nfor num in nums:\n  runningSum += num\n  count += seen.get(runningSum - K, 0)\n  seen[runningSum] = seen.get(runningSum, 0) + 1" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cCount/find a subarray whose sum equals K\u201d is the single strongest signal for this combo -- especially when the array contains negative numbers (ruling out the sliding-window approach, which needs non-negative values).",
        conclusion: "Examples: Subarray Sum Equals K, Continuous Subarray Sum, Binary Subarrays With Sum." }
    ]
  },

  "binary-search-greedy": {
    title: "Combo \u2014 Binary Search + Greedy",
    sections: [
      { type: "text", heading: "Why these two combine",
        body: "'Binary Search on the Answer' works when feasibility is monotonic (if X works, everything harder than X also works, or vice versa). The feasibility CHECK for a candidate answer is often itself a greedy simulation -- hence this pairing." },
      { type: "diagram", heading: "Mental model", dark: true,
        body: "lo = minPossible, hi = maxPossible\nwhile lo < hi:\n  mid = (lo+hi)/2\n  if greedyFeasible(mid): hi = mid       // mid works, try smaller\n  else: lo = mid + 1                    // mid fails, need larger\nreturn lo" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cMinimize the maximum X\u201d or \u201cmaximize the minimum X\u201d subject to a feasibility constraint that can be checked greedily -> binary search the answer, greedy-simulate the check.",
        conclusion: "Examples: Split Array Largest Sum, Capacity To Ship Packages Within D Days, Koko Eating Bananas." }
    ]
  },

  "heap-greedy": {
    title: "Combo \u2014 Heap + Greedy",
    sections: [
      { type: "text", heading: "Why these two combine",
        body: "This is the same idea covered in the standalone 'Greedy + Heap' Tier 9 pattern -- listed again here because interviewers frequently frame it as 'combine a greedy strategy with a priority queue' rather than naming it directly. Whenever the best next choice changes dynamically, a heap replaces a static sort." },
      { type: "diagram", heading: "Mental model", dark: true,
        body: "heap = priority queue of current candidates\nwhile heap not empty:\n  best = heap.pop()\n  act on best\n  push any newly-available or updated candidates" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "See the full derivation in Tier 9's 'Greedy + Heap' lesson -- this combo card exists for discoverability under the 'interview combination' framing.",
        conclusion: "Examples: Task Scheduler, Meeting Rooms II, IPO/Maximize Capital, Reorganize String." }
    ]
  },

  "bfs-hashset": {
    title: "Combo \u2014 BFS + HashSet",
    sections: [
      { type: "text", heading: "Why these two combine",
        body: "BFS explores states level by level to find shortest paths in unweighted graphs -- but without tracking which states have already been visited, it can revisit the same state infinitely (especially in state-space search where 'states' aren't a fixed grid). A HashSet of visited states makes BFS terminate correctly and efficiently." },
      { type: "diagram", heading: "Mental model", dark: true,
        body: "queue = [start], visited = {start}\nwhile queue not empty:\n  cur = queue.pop_front()\n  if cur == target: return steps\n  for next in neighbors(cur):\n    if next not in visited:\n      visited.add(next)\n      queue.push(next)" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cShortest transformation/sequence of steps between two states\u201d where 'states' are words, board configurations, or other non-grid structures -> BFS with a HashSet of visited states.",
        conclusion: "Examples: Word Ladder, Open the Lock, Minimum Genetic Mutation, Sliding Puzzle." }
    ]
  },

  "dfs-backtracking": {
    title: "Combo \u2014 DFS + Backtracking",
    sections: [
      { type: "text", heading: "Why these two combine",
        body: "DFS provides the traversal mechanism (go deep, then come back); Backtracking adds the 'undo the choice' discipline so the same DFS call can be reused to explore a different branch. Grid-based search problems (Word Search) are the canonical example: DFS explores a path, backtracking un-marks visited cells when a path fails." },
      { type: "diagram", heading: "Mental model", dark: true,
        body: "dfs(r, c, index):\n  if board[r][c] != word[index]: return false\n  if index == word.length-1: return true\n  mark (r,c) visited\n  result = any neighbor dfs(...) succeeds\n  unmark (r,c) visited   // the backtracking step\n  return result" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cFind a path/word in a grid\u201d or any DFS exploration where a cell/node can be revisited on a DIFFERENT path once the current path abandons it -> DFS + Backtracking (mark-explore-unmark).",
        conclusion: "Examples: Word Search, Number of Distinct Islands, Path With Maximum Gold." }
    ]
  },

  "graph-union-find": {
    title: "Combo \u2014 Graph + Union-Find",
    sections: [
      { type: "text", heading: "Why these two combine",
        body: "When a graph problem asks about CONNECTIVITY (are two nodes in the same component? how many components exist? does adding this edge create a cycle?) without needing full traversal details like path or distance, Union-Find answers these queries faster and more simply than DFS/BFS, especially with many incremental edge additions." },
      { type: "diagram", heading: "Mental model", dark: true,
        body: "for each edge (u, v):\n  if find(u) == find(v): cycle detected / redundant edge\n  else: union(u, v)   // merge components" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cDynamic connectivity,\u201d \u201ccount connected components after adding edges incrementally,\u201d or \u201cdetect a redundant/cycle-creating edge\u201d -> Union-Find is almost always simpler than repeated DFS/BFS.",
        conclusion: "Examples: Redundant Connection, Number of Provinces, Accounts Merge, Kruskal's MST." }
    ]
  }
};
