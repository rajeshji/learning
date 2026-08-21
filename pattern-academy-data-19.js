// Tier 9 -- Greedy pattern lessons, following the HashMap-depth lesson template
// (what/why -> mental model -> variants/algorithm -> decision diagram -> pitfall
// callout -> summary diagram -> next lesson). Keyed by slugify(pattern.name).
const PATTERN_ACADEMY_19 = {
  "activity-selection": {
    title: "Pattern 50 \u2014 Activity Selection",
    sections: [
      { type: "text", heading: "The core question",
        body: "Given a set of activities, each with a start and end time, and only one resource (one room, one person, one machine), what is the maximum number of non-overlapping activities you can perform? The greedy insight: always pick the activity that finishes earliest among the remaining compatible ones." },
      { type: "text", heading: "Why finish time, not start time?",
        body: "Sorting by start time is tempting but wrong -- a long activity that starts early can block many short ones. Sorting by FINISH time and greedily picking the earliest-finishing compatible activity leaves the maximum remaining time for everything else. This is provable via an exchange argument: any optimal solution can be transformed to start with the earliest-finishing activity without losing count.",
        diagram: "Activities:  A[1,4]  B[2,3]  C[3,5]\nSort by finish: B(3) -> A(4) -> C(5)\nPick B[2,3] -> next must start >= 3 -> C[3,5] fits, A[1,4] does not\nResult: {B, C} -- 2 activities" },
      { type: "diagram", heading: "Algorithm template", dark: true,
        body: "sort activities by end time\nlastEnd = -infinity\ncount = 0\nfor each activity (s, e) in sorted order:\n  if s >= lastEnd:\n    count++\n    lastEnd = e" },
      { type: "callout", heading: "Common mistake", tone: "red",
        body: "Sorting by start time or by duration both fail to guarantee optimality. Only sorting by END time gives the greedy-choice property that makes this work.",
        conclusion: "Recognition trigger: \u201cmaximum non-overlapping intervals, one resource\u201d -> sort by finish time, greedy pick." },
      { type: "nextLesson", pattern: "Interval Scheduling",
        points: ["The generalized version of Activity Selection", "Minimum removals to make a set non-overlapping", "How this connects to Merge Intervals and Meeting Rooms"] }
    ]
  },

  "interval-scheduling": {
    title: "Pattern 51 \u2014 Interval Scheduling",
    sections: [
      { type: "text", heading: "The core question",
        body: "Interval Scheduling generalizes Activity Selection: instead of just counting the maximum compatible set, you're often asked \u201chow many intervals must I remove to make the rest non-overlapping?\u201d The two questions are complements of each other." },
      { type: "text", heading: "The complement trick",
        body: "If N total intervals exist and the maximum non-overlapping subset has size K (found via the Activity Selection greedy), then the minimum number of removals is N - K. You don't need a separate algorithm -- solve Activity Selection first.",
        diagram: "N = 5 intervals\nMax non-overlapping subset (greedy, sort by end) = 3\nMinimum removals = 5 - 3 = 2" },
      { type: "diagram", heading: "Recognition decision tree", dark: true,
        body: "\u201cmaximum overlapping-free set\u201d       -> Activity Selection greedy\n\u201cminimum removals to eliminate overlap\u201d -> N - (Activity Selection answer)\n\u201cmerge all overlapping into groups\u201d      -> Merge Intervals (sort by START, not end)" },
      { type: "callout", heading: "Don't confuse with Merge Intervals", tone: "gold",
        body: "Merge Intervals asks a completely different question -- \u201ccombine overlapping ranges into contiguous blocks\u201d -- and sorts by START time, not end time. Interval Scheduling asks \u201chow many can coexist,\u201d and sorts by END time.",
        conclusion: "Same-looking input (a list of intervals), different questions, different sort keys -- always re-derive from the actual question asked." },
      { type: "nextLesson", pattern: "Jump Game",
        points: ["Greedy reachability instead of interval counting", "Maintaining the farthest reachable index", "Why this is NOT a BFS/DP problem once you see the greedy insight"] }
    ]
  },

  "jump-game": {
    title: "Pattern 52 \u2014 Jump Game",
    sections: [
      { type: "text", heading: "The core question",
        body: "Given an array where nums[i] is the maximum jump length from index i, can you reach the last index? Or: what is the minimum number of jumps needed? Both are solved greedily by tracking the farthest index reachable so far -- no need for DP or BFS." },
      { type: "text", heading: "The greedy insight",
        body: "As you scan left to right, maintain farthest = max(farthest, i + nums[i]). If at any point i > farthest, you're stuck -- that index is unreachable. For minimum jumps, additionally track the boundary of the current jump; when i reaches that boundary, you're forced to take another jump.",
        diagram: "nums = [2,3,1,1,4]\ni=0: farthest = max(0, 0+2) = 2\ni=1: farthest = max(2, 1+3) = 4  (already reaches the end)\nreachable -- true" },
      { type: "diagram", heading: "Minimum jumps template", dark: true,
        body: "jumps = 0, curEnd = 0, farthest = 0\nfor i in 0..n-2:\n  farthest = max(farthest, i + nums[i])\n  if i == curEnd:\n    jumps++\n    curEnd = farthest" },
      { type: "callout", heading: "Why not DP here?", tone: "gold",
        body: "A DP solution (dp[i] = min jumps to reach i) works but costs O(n^2) in the naive form. The greedy farthest-reach approach is O(n) because it never revisits a decision -- once we know a farther index is reachable, earlier weaker options are irrelevant.",
        conclusion: "Recognition trigger: \u201creachability or minimum steps through jump lengths\u201d -> try greedy farthest-reach before reaching for DP." },
      { type: "nextLesson", pattern: "Gas Station",
        points: ["A circular greedy reachability problem", "Why the total-sum check guarantees a solution exists", "The reset-on-negative trick"] }
    ]
  },

  "gas-station": {
    title: "Pattern 53 \u2014 Gas Station",
    sections: [
      { type: "text", heading: "The core question",
        body: "N gas stations arranged in a circle, each with gas[i] fuel and cost[i] to reach the next station. Find the starting station that lets you complete the full circuit, or determine none exists." },
      { type: "text", heading: "Two greedy insights combined",
        body: "1) If total gas >= total cost, a valid starting point is guaranteed to exist (fuel conservation argument). 2) If you run out of fuel (tank < 0) at station i while starting from start, then NO station between start and i can be a valid start either -- so jump straight past i and reset the tank.",
        diagram: "tank = 0, total = 0, start = 0\nfor i in 0..n-1:\n  diff = gas[i] - cost[i]\n  tank += diff; total += diff\n  if tank < 0:\n    start = i + 1\n    tank = 0\nreturn total >= 0 ? start : -1" },
      { type: "callout", heading: "Why skipping intermediate stations is safe", tone: "gold",
        body: "If you start at S and go negative at station i, then for any station M between S and i, the sum from S to M was non-negative (otherwise you'd have failed earlier). Starting at M would only have LESS accumulated fuel by the time it reaches i, since it misses the positive contribution from S to M.",
        conclusion: "That's the exchange argument that makes the O(n) single pass correct instead of needing O(n^2) brute force." },
      { type: "nextLesson", pattern: "Two City / Cost Greedy",
        points: ["Greedy by cost difference, not absolute cost", "Splitting a group into two equal halves optimally", "Sorting to expose the correct greedy order"] }
    ]
  },

  "two-city-cost-greedy": {
    title: "Pattern 54 \u2014 Two City / Cost Greedy",
    sections: [
      { type: "text", heading: "The core question",
        body: "2N people must be split into two equal groups (N to city A, N to city B), each person having a different cost for each city. Minimize total cost. The greedy trick: sort by the DIFFERENCE between the two costs, not by either cost alone." },
      { type: "text", heading: "Why difference, not raw cost?",
        body: "Send everyone to their cheaper city first, ignoring the 50/50 constraint. Then sort everyone by (costA - costB). The people with the most negative difference benefit most from going to A relative to B, so flip the N people whose difference makes them 'want' to switch the least in order to rebalance the groups.",
        diagram: "costA - costB sorted ascending:\n[-30, -10, 5, 20]\nSend first half (most negative) to A, second half to B\n-> minimizes total switching cost" },
      { type: "diagram", heading: "Algorithm template", dark: true,
        body: "sort people by (costA[i] - costB[i]) ascending\nfor first N people: send to city A\nfor last N people: send to city B\nsum the corresponding costs" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "Whenever you see \u201csplit into two equal groups to minimize total cost, each item has two costs,\u201d think: sort by cost difference, not by either cost independently.",
        conclusion: "This same difference-sorting idea generalizes to any 2-option allocation problem with a fixed group-size constraint." },
      { type: "nextLesson", pattern: "Task Scheduling",
        points: ["Greedy with a cooldown constraint", "Why max-heap of remaining counts works", "Formula-based shortcut vs simulation"] }
    ]
  },

  "task-scheduling": {
    title: "Pattern 55 \u2014 Task Scheduling",
    sections: [
      { type: "text", heading: "The core question",
        body: "Given tasks with a cooldown period N between two executions of the same task type, find the minimum total time (including idle slots) to finish all tasks. The greedy idea: always schedule the most frequent remaining task first, using a max-heap." },
      { type: "text", heading: "Two ways to solve it",
        body: "Simulation: use a max-heap of remaining counts, process in rounds of size (N+1), refilling from a cooldown queue. Formula: let maxFreq be the highest task frequency and maxCount the number of tasks sharing that frequency; answer = max(tasks.length, (maxFreq-1) * (N+1) + maxCount).",
        diagram: "tasks = [A,A,A,B,B,B], N = 2\nmaxFreq = 3 (A and B both appear 3 times) -> maxCount = 2\nanswer = max(6, (3-1)*(2+1) + 2) = max(6, 8) = 8" },
      { type: "callout", heading: "Why the formula works", tone: "gold",
        body: "The most frequent task creates (maxFreq - 1) full cooldown 'blocks' of size (N+1). Every other task with the same max frequency adds one extra slot at the end. If there are enough OTHER tasks to fill every idle slot, the answer collapses back to just tasks.length.",
        conclusion: "Recognition trigger: \u201ccooldown between repeats, minimize total time\u201d -> max-heap simulation or the maxFreq/maxCount formula." },
      { type: "nextLesson", pattern: "Greedy + Heap",
        points: ["The general pattern behind Task Scheduling and many others", "Always taking the best available candidate from a heap", "Where this differs from plain sorting-based greedy"] }
    ]
  },

  "greedy-heap": {
    title: "Pattern 56 \u2014 Greedy + Heap",
    sections: [
      { type: "text", heading: "The core question",
        body: "Some greedy problems can't be solved by a single sort because the 'best choice' changes dynamically as you make decisions. When the best remaining option depends on state that updates every step, a heap replaces a fixed sort order." },
      { type: "text", heading: "Why heap instead of sort?",
        body: "Sorting fixes an order up-front. But in problems like Task Scheduling or Reconstruct Queue, the 'best next item' depends on what you've already chosen (remaining counts, remaining capacity). A heap lets you always pop the current best in O(log n), re-inserting updated candidates as state changes.",
        diagram: "Sort-based greedy:   fixed order, one pass\nHeap-based greedy:   dynamic order, re-evaluated after every choice" },
      { type: "diagram", heading: "Generic template", dark: true,
        body: "heap = build max/min heap of candidates\nwhile heap not empty:\n  best = heap.pop()\n  process(best)\n  if best still has remaining work:\n    heap.push(updated(best))" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "If the phrase \u201calways pick the current best, but 'best' can change after each decision\u201d applies, reach for a heap instead of a static sort.",
        conclusion: "Classic examples: Task Scheduling, Reconstruct Queue by Height, Meeting Rooms II, IPO/Maximize Capital." },
      { type: "nextLesson", pattern: "Greedy + Sorting",
        points: ["The other half of the greedy family -- static order, single pass", "Proving correctness via the exchange argument", "When sorting alone is enough vs when you need a heap too"] }
    ]
  },

  "greedy-sorting": {
    title: "Pattern 57 \u2014 Greedy + Sorting",
    sections: [
      { type: "text", heading: "The core question",
        body: "The most common greedy shape: sort the input by some key that exposes the correct decision order, then make one pass making locally optimal choices. The hard part isn't the code -- it's finding and proving the right sort key." },
      { type: "text", heading: "The exchange argument",
        body: "To prove a greedy sort key is correct, assume an optimal solution that does NOT follow your proposed order. Show that swapping two adjacent out-of-order elements never makes the solution worse. If that holds for any adjacent pair, by induction the fully sorted order is optimal.",
        diagram: "Optimal solution: ... X Y ...  (out of your proposed order)\nSwap to: ... Y X ...\nIf total cost/value is unchanged or improved -> sort key is valid" },
      { type: "diagram", heading: "Common sort keys across problems", dark: true,
        body: "Activity Selection      -> sort by end time\nMerge Intervals         -> sort by start time\nTwo City Cost           -> sort by cost difference\nJob Sequencing/Deadline -> sort by profit descending, deadline constraint\nHuffman-style problems  -> sort by frequency (via heap)" },
      { type: "callout", heading: "When sorting alone is NOT enough", tone: "red",
        body: "If the correct choice changes dynamically based on decisions already made (not just the static input), a single sort won't capture it -- you need Greedy + Heap instead.",
        conclusion: "Rule of thumb: static comparison key -> sort once; dynamically changing 'best' -> heap." },
      { type: "nextLesson", pattern: "Minimum Platforms / Resources",
        points: ["A sweep-line variant of interval-based greedy", "Tracking concurrent overlap with two sorted event streams", "How this connects to Meeting Rooms II"] }
    ]
  },

  "minimum-platforms-resources": {
    title: "Pattern 58 \u2014 Minimum Platforms / Resources",
    sections: [
      { type: "text", heading: "The core question",
        body: "Given arrival and departure times for trains (or meetings), find the minimum number of platforms (or rooms) needed so no two overlapping events share one. This is the maximum number of events active at the same time." },
      { type: "text", heading: "The sweep-line approach",
        body: "Sort all arrival times and all departure times independently. Walk through both sorted lists with two pointers: on an arrival, increment the concurrent-count and platform-need; on a departure, decrement. Track the running maximum -- that's the answer.",
        diagram: "arrivals:   [900, 940, 950, 1100, 1500, 1800]\ndepartures: [910, 1200, 1120, 1130, 1900, 2000]\nSweep both sorted lists, +1 on arrival <= next departure, else -1\nTrack max concurrent count seen -> minimum platforms" },
      { type: "diagram", heading: "Algorithm template", dark: true,
        body: "sort(arrivals); sort(departures)\ni = 0, j = 0, count = 0, maxCount = 0\nwhile i < n:\n  if arrivals[i] <= departures[j]:\n    count++; i++\n    maxCount = max(maxCount, count)\n  else:\n    count--; j++" },
      { type: "callout", heading: "Same idea as Meeting Rooms II", tone: "gold",
        body: "This is functionally identical to \u201cminimum meeting rooms\u201d -- both ask for the maximum number of simultaneously active intervals. A min-heap of end times is an equally valid alternative implementation.",
        conclusion: "Recognition trigger: \u201cminimum resources/rooms/platforms for overlapping intervals\u201d -> sweep line or heap of end times, both O(n log n)." },
      { type: "nextLesson", pattern: "Huffman / Optimal Merge",
        points: ["Repeatedly combining the two smallest items -- a different greedy shape", "Why this minimizes total weighted cost", "Connection to optimal merge and prefix-free encoding"] }
    ]
  },

  "huffman-optimal-merge": {
    title: "Pattern 59 \u2014 Huffman / Optimal Merge",
    sections: [
      { type: "text", heading: "The core question",
        body: "Given a set of weights/frequencies, repeatedly combine the two smallest into one (cost = their sum), until one remains. Minimize the total cost of all combinations. This exact greedy shape builds Huffman encoding trees and solves \u201coptimal file merge\u201d problems." },
      { type: "text", heading: "Why always combine the two smallest?",
        body: "Every combination step \u201ccharges\u201d both operands' full weight again at every level above them in the resulting tree. Combining the two smallest first keeps them shallow when they recombine again, but more importantly ensures no cheaper alternative combination could reduce the total accumulated cost -- provable by exchange argument on the final merge tree.",
        diagram: "weights = [2, 3, 4, 5]\nCombine 2+3=5 -> [5,4,5]\nCombine 4+5=9 -> [5,9] (using the smallest surviving 5, then next smallest 4)\nCombine 5+9=14\nTotal cost = 5 + 9 + 14 = 28" },
      { type: "diagram", heading: "Algorithm template", dark: true,
        body: "minHeap = build min-heap of all weights\ntotalCost = 0\nwhile heap.size() > 1:\n  a = heap.pop(); b = heap.pop()\n  merged = a + b\n  totalCost += merged\n  heap.push(merged)" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cRepeatedly combine two smallest, minimize total combination cost\u201d is a distinctive shape -- always a min-heap, always greedy, never needs DP.",
        conclusion: "This closes out the Greedy tier: sort-based (single pass), heap-based (dynamic best), and merge-based (Huffman) cover the overwhelming majority of greedy interview problems." }
    ]
  }
};
