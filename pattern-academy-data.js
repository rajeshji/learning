// Phase 1 "Pattern Academy" deep-dive content, sourced from coding.txt.
// Keyed by pattern slug (slugify(pattern.name)).
// Each entry: { title, sections: [...] } — sections are rendered generically
// by pattern.html so adding a new pattern never requires touching the renderer.
//
// Section types:
//   text       { heading, body, diagram? }
//   variants   { heading, items: [{ id, title, question?, use?, diagram?, typical?, recognition?, note? }] }
//   diagram    { heading, body, dark? }
//   callout    { heading, body, conclusion?, tone: "red"|"gold" }
//   comparison { heading, items: [{ label, body }], conclusion }
//   chips      { heading, intro?, items: [string] }
//   checklist  { heading, items: [string] }
//   practice   { heading, intro, items: [string], note? }
//   nextLesson { pattern, points: [string] }
const PATTERN_ACADEMY_1 = {
  "hashmap-hashset": {
    title: "Pattern 1 — HashMap / HashSet",
    sections: [
      { type: "text", heading: "The core question",
        body: "Whenever you're looking at an array/string, ask: \u201cDo I need to remember something I've already seen?\u201d If yes, hashing should be one of your first candidates." },
      { type: "variants", heading: "The sub-patterns", items: [
        { id: "1A", title: "Existence", question: "Have I seen this value before?",
          use: "Set<Integer> seen = new HashSet<>();",
          diagram: "value\n  \u2193\n\u201cSeen?\u201d\n  \u2193\nYES / NO",
          typical: ["Contains Duplicate", "Longest Consecutive Sequence", "Intersection"] },
        { id: "1B", title: "Frequency", question: "How many times does each value occur?",
          use: "Map<Integer, Integer> freq = new HashMap<>();",
          diagram: "value \u2192 count   (or, for strings: character \u2192 count)",
          typical: ["Valid Anagram", "First Unique Character", "Majority Element", "Palindrome rearrangement"] },
        { id: "1C", title: "Complement", question: "What value do I need to complete the condition?",
          use: "target = 10\ncurrent = 7\nneeded = 10 - 7 = 3",
          diagram: "current \u2192 needed   (this gives you Two Sum \u2192 HashMap)",
          note: "Don't memorize Two Sum. Remember: \u201cI need a complement \u2192 fast lookup \u2192 HashMap.\u201d" },
        { id: "1D", title: "Value \u2192 Index", question: "Have I seen this value, and where?",
          use: "store: value \u2192 index",
          diagram: "nums = [1, 2, 3, 1]\nWhen we reach the second 1: 1 \u2192 previous index\nNow we can calculate the distance.",
          typical: ["Contains Duplicate II"] },
        { id: "1E", title: "Grouping", question: "Which items belong to the same group?",
          use: "eat / tea / ate \u2192 all share the same character-frequency signature",
          diagram: "signature \u2192 list of words",
          typical: ["Group Anagrams"] }
      ]},
      { type: "diagram", heading: "The decision tree (memorize the model, not the code)",
        body: "             Need information\n" +
              "              about past?\n" +
              "                   |\n" +
              "             \u250c\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2510\n" +
              "             YES         NO\n" +
              "              |\n" +
              "       What information?\n" +
              "              |\n" +
              "   \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n" +
              "   \u2193          \u2193          \u2193\n" +
              "Existence  Frequency   Position\n" +
              "   \u2193          \u2193          \u2193\n" +
              " HashSet    HashMap    HashMap\n" +
              "                       value\u2192index\n\n" +
              "And one more:\n\n" +
              "Need missing/complement value?\n" +
              "        \u2193\n" +
              "     HashMap" },
      { type: "callout", heading: "HashMap is not always optimal", tone: "red",
        body: "Suppose [1, 2, 3, 4, 5] is sorted, and you're asked to find two numbers with a target sum. You could use a HashMap \u2014 but you should recognize: Sorted \u2192 Two Pointers \u2192 O(N) time, O(1) space.",
        conclusion: "HashMap gives you fast lookup, but always ask whether the input has a property that gives you an even better solution. That's the interview-level thinking we're building." },
      { type: "diagram", heading: "Pattern summary", dark: true,
        body: "HashMap / HashSet\n\u2502\n\u251c\u2500\u2500 Existence\n\u251c\u2500\u2500 Frequency\n\u251c\u2500\u2500 Complement\n\u251c\u2500\u2500 Value \u2192 Index\n\u2514\u2500\u2500 Grouping" },
      { type: "nextLesson", pattern: "Two Pointers",
        points: ["Why the technique works", "The 5 major Two Pointer variants", "How to recognize each one", "When HashMap is better", "When Two Pointers is better", "How sorting changes the problem"] }
    ]
  },

  "two-pointers": {
    title: "Pattern 2 — Two Pointers",
    sections: [
      { type: "text", heading: "1. What is Two Pointers?",
        body: "We use two indices to explore an array/string while avoiding unnecessary work. Instead of a nested loop checking every pair, we maintain two positions and move them intelligently. The key word is intelligently \u2014 moving two pointers randomly is not a pattern.",
        diagram: "L                    R\n\u2193                    \u2193\n[ 1  2  3  4  5  6  7 ]" },
      { type: "text", heading: "2. Why does Two Pointers exist?",
        body: "Given [1, 2, 3, 4, 6, 8], find two numbers whose sum is 10. Brute force checks every pair \u2014 O(N\u00b2). But the array is sorted. Start with L at the smallest and R at the largest: 1 + 8 = 9, too small, so we need a larger sum. Because the array is sorted, we can safely move L++ (moving R would only shrink the sum further). Now 2 + 8 = 10. Done \u2014 in O(N).",
        diagram: "L                 R\n\u2193                 \u2193\n[1  2  3  4  6  8]   \u2192  1+8=9 (too small) \u2192 move L\n\n   L              R\n   \u2193              \u2193\n[1  2  3  4  6  8]   \u2192  2+8=10 \u2713" },
      { type: "callout", heading: "3. The fundamental property", tone: "gold",
        body: "Two Pointers works when moving one pointer allows us to eliminate a portion of the search space. For the sorted two-sum example: if L + R < target, we know L must increase, because increasing R is impossible \u2014 it's already the largest value.",
        conclusion: "That's why the algorithm is safe \u2014 not because \u201ctwo pointers looks like the right shape.\u201d" },
      { type: "variants", heading: "4. The 5 major Two-Pointer patterns", items: [
        { id: "A", title: "Opposite Direction",
          diagram: "L \u2192              \u2190 R\n\n[ 1 2 3 4 5 6 7 ]",
          typical: ["Two Sum II", "Container With Most Water", "Valid Palindrome", "Reverse String", "3Sum"],
          recognition: ["Sorted array", "Pair relationship", "Compare left/right", "Need to converge", "Palindrome"] },
        { id: "B", title: "Same Direction (Read/Write)",
          diagram: "L \u2192\nR \u2192\n\n[ 1 2 3 4 5 6 7 ]",
          note: "One pointer reads, one pointer writes \u2014 e.g. [1,1,2,2,3] \u2192 [1,2,3]. Often called the Read/Write Pointer.",
          typical: ["Remove duplicates", "Remove elements", "Partitioning", "In-place array modifications"] },
        { id: "C", title: "Fast / Slow",
          diagram: "slow \u2192\nfast \u2192\u2192",
          note: "One pointer moves slowly, another explores faster. Classic: Linked List Cycle \u2014 but also appears in plain arrays.",
          typical: ["Find cycle", "Find middle", "Remove duplicates", "Detect repeated-state cycles"] },
        { id: "D", title: "Partitioning",
          diagram: "[ values < pivot | unknown | values > pivot ]",
          note: "Each pointer represents a region with a known property.",
          typical: ["Dutch National Flag", "QuickSort partition", "Move zeroes", "Separate positives/negatives", "0/1/2 sorting"] },
        { id: "E", title: "Merge / Parallel Pointers",
          diagram: "A: [1 3 5 7]\n     \u2191\n\nB: [2 4 6 8]\n     \u2191",
          note: "Mental model: two independently ordered streams, one pointer per array.",
          typical: ["Merge sorted arrays", "Intersection", "Compare sequences", "Merge intervals-like problems"] }
      ]},
      { type: "diagram", heading: "Your Two-Pointer decision tree",
        body: "Two indices useful?\n" +
              "       \u2193\n" +
              "      YES\n" +
              "       \u2193\n" +
              "Are they moving toward each other?\n" +
              "       \u2193\n" +
              "     YES \u2192 Opposite pointers\n" +
              "       |\n" +
              "       NO\n" +
              "       \u2193\n" +
              "Are they moving forward?\n" +
              "       \u2193\n" +
              "     YES\n" +
              "       \u2193\n" +
              "Same array?\n" +
              "       \u2193\n" +
              "Read/write or fast/slow\n\n" +
              "Different arrays?\n" +
              "       \u2193\n" +
              "Merge / parallel pointers" },
      { type: "callout", heading: "The critical question", tone: "gold",
        body: "Before using Two Pointers, ask: \u201cWhat allows me to safely move one pointer?\u201d That's what separates a real Two Pointer solution from guessing. Sorted two-sum: sum < target \u2192 increase L, because increasing R would only make the sum larger. Valid Palindrome: compare L\u2194R and move inward. Remove Duplicates: maintain [processed unique | unprocessed] and the pointers represent those regions.",
        conclusion: null },
      { type: "comparison", heading: "HashMap vs Two Pointers", items: [
        { label: "Unsorted: [3, 7, 2, 9, 4]", body: "Think HashMap \u2014 because we need fast complement lookup." },
        { label: "Sorted: [2, 3, 4, 7, 9]", body: "Think Two Pointers \u2014 because sorting gives us an ordering property we can exploit." }
      ], conclusion: "Same problem, different constraints, different algorithm. This is exactly the kind of thinking Google/Uber interviewers want." },
      { type: "callout", heading: "The golden rule", tone: "red",
        body: "Don't memorize \u201cSorted array \u2192 Two Pointers.\u201d That's too simplistic.",
        conclusion: "Sorted/order information allows me to eliminate part of the search space when I move a pointer. That's the real pattern." },
      { type: "practice", heading: "Tiny practice \u2014 no coding",
        intro: "For each problem, identify: Pattern / Why / Which pointers. Don't code \u2014 just reason it out.",
        items: [
          "Given a sorted array, determine whether two numbers sum to K.",
          "Given a string, determine whether it is a palindrome.",
          "Given a sorted array, remove duplicates in-place.",
          "Given two sorted arrays, find their intersection.",
          "Given an array containing 0, 1, and 2, rearrange it so equal values are together.",
          "Given an array, move all zeroes to the end while maintaining the relative order of non-zero elements.",
          "Given an unsorted array, determine whether two numbers sum to K.",
          "Given a linked list, determine whether it contains a cycle."
        ],
        note: "#7 is deliberately almost the same as #1 \u2014 notice that the constraint changed, so the preferred pattern changes too." }
    ]
  },

  "sliding-window": {
    title: "Pattern 3 \u2014 Sliding Window",
    sections: [
      { type: "text", heading: "1. What is a window?",
        body: "A window is simply a range between two pointers L and R. Everything between them belongs to the current window. We move R to expand the window and L to shrink it. When the answer involves a contiguous range, maintain that range as a window instead of repeatedly recomputing it from scratch.",
        diagram: "L           R\n\u2193           \u2193\n[1, 3, 2, 6, 4, 8, 5]" },
      { type: "text", heading: "2. Why does Sliding Window exist?",
        body: "Find the maximum sum of any subarray of size 3 in [1,3,2,6,4,8,5]. Brute force recalculates almost the same sum for every window. Instead, reuse previous work: newSum = oldSum - (element leaving) + (element entering). That reuse is the entire heart of Sliding Window.",
        diagram: "[1 3 2] 6 4 8   \u2192 sum = 6\n1 [3 2 6] 4 8   \u2192 newSum = 6 - 1 + 6 = 11" },
      { type: "variants", heading: "3. Two major types", items: [
        { id: "A", title: "Fixed Window", question: "Does the window size ever change?",
          note: "Window size never changes: R - L + 1 = K, always.",
          diagram: "L \u2192 R   (R - L + 1 = K)",
          typical: ["Maximum average subarray of size K", "Maximum sum of K consecutive elements", "First negative in every window of size K"] },
        { id: "B", title: "Variable Window \u2b50", question: "Does the window expand and contract based on a condition?",
          note: "Much more important than Fixed Window. Example: longest substring without repeating characters \u2014 expand R, and the moment a violation appears, shrink from L until valid again, then keep expanding.",
          diagram: "Expand\n  \u2193\nCondition broken?\n  \u2193\nShrink\n  \u2193\nValid?\n  \u2193\nRecord answer",
          typical: ["Longest substring without repeating characters", "Longest substring with at most K distinct characters"] }
      ]},
      { type: "chips", heading: "4. Recognition triggers",
        intro: "When you see any of these words, ask: \u201cIs the answer a contiguous range?\u201d If yes, Sliding Window is a candidate \u2014 but don't blindly use it.",
        items: ["substring", "subarray", "contiguous", "consecutive elements", "longest", "shortest", "maximum", "minimum", "at most K", "exactly K"] },
      { type: "callout", heading: "5. The most important constraint", tone: "gold",
        body: "Sliding Window works especially well when the window condition is monotonic as you expand/shrink. Example: longest substring with at most K distinct characters \u2014 if the window has K+1 distinct characters, shrink from the left until you're back to \u2264 K. This works because you're maintaining a clear validity condition.",
        conclusion: null },
      { type: "diagram", heading: "6. Sliding Window + HashMap", dark: true,
        body: "right++\nadd character\n\nwhile distinct > K:\n    remove s[left]\n    left++\n\nupdate answer" },
      { type: "comparison", heading: "7. Fixed vs Variable", items: [
        { label: "Fixed: window size = K", body: "Example: maximum sum of K consecutive elements." },
        { label: "Variable: window size changes based on validity", body: "Example: longest substring with at most K distinct characters." }
      ], conclusion: null },
      { type: "callout", heading: "8. \u201cExactly K\u201d is special", tone: "gold",
        body: "Number of subarrays with exactly K distinct values is often solved as: exactly(K) = atMost(K) - atMost(K - 1).",
        conclusion: "This is an important interview trick \u2014 don't worry about memorizing it yet, we'll practice it later." },
      { type: "comparison", heading: "9. Sliding Window vs Prefix Sum", items: [
        { label: "All positive numbers", body: "Sliding Window can often work directly." },
        { label: "Negative numbers exist", body: "Prefix Sum + HashMap is generally the better pattern." }
      ], conclusion: "\u201cSubarray\u201d alone is not enough to select Sliding Window \u2014 you need to inspect the constraints (e.g. longest subarray with sum K)." },
      { type: "diagram", heading: "10. Sliding Window decision tree",
        body: "Contiguous range?\n       \u2193\n      YES\n       \u2193\nCan I maintain a valid window\nby expanding/shrinking?\n       \u2193\n      YES\n       \u2193\nSliding Window\n       \u2502\n       \u251c\u2500\u2500 Fixed size?\n       \u2502       \u2193\n       \u2502  Fixed Window\n       \u2502\n       \u2514\u2500\u2500 Variable?\n               \u2193\n          Variable Window" },
      { type: "diagram", heading: "11. The template (memorize the model, not the code)", dark: true,
        body: "left = 0\n\nfor right = 0 \u2192 end:\n\n    add right element\n\n    while window invalid:\n\n        remove left element\n        left++\n\n    update answer" },
      { type: "callout", heading: "12. Your pattern recognition trigger", tone: "gold",
        body: "When you see: longest/shortest contiguous subarray/substring satisfying a condition \u2014 your brain should immediately consider Sliding Window.",
        conclusion: "Then ask: what makes my window invalid? That question usually reveals the implementation." },
      { type: "checklist", heading: "Your Tier 1 progress",
        items: ["HashMap / HashSet", "Two Pointers", "Sliding Window"] },
      { type: "nextLesson", pattern: "Prefix Sum",
        points: ["What Prefix Sum actually means", "Why it works", "Subarray Sum", "Prefix Sum + HashMap", "Difference Array", "2D Prefix Sum", "When Prefix Sum beats Sliding Window"] }
    ]
  },

  "prefix-sum": {
    title: "Pattern 4 \u2014 Prefix Sum",
    sections: [
      { type: "text", heading: "1. Start with a simple example",
        body: "prefix[i] = sum of everything from 0 \u2192 i. So prefix[3] = 2 + 4 + 3 + 5 = 14. The core idea: store cumulative information so that a range can be calculated using two prefix values.",
        diagram: "index:   0   1   2   3   4\narray:   2   4   3   5   1\nprefix:  2   6   9   14  15" },
      { type: "text", heading: "2. Why is this useful?",
        body: "What is the sum from index 1 to index 3? That's 4 + 3 + 5 = 12. Instead of adding again, compute prefix[3] - prefix[0] = 14 - 2 = 12. That's the fundamental trick \u2014 O(1) range sum after O(N) preprocessing." },
      { type: "diagram", heading: "3. The mental model",
        body: "0 -------------------- i\n        prefix[i]\n\n0 -------- j\n    prefix[j]\n\nj+1 -------- i\n\nsum(j+1 \u2192 i) = prefix[i] - prefix[j]\n\nWhenever you see \u201crange sum / subarray sum\u201d, think: Prefix Sum." },
      { type: "text", heading: "4. Basic Prefix Sum pattern",
        body: "prefix[0] = nums[0]; prefix[i] = prefix[i-1] + nums[i]. Then any range sum can be answered in O(1)." },
      { type: "callout", heading: "5. The real interview pattern: Prefix Sum + HashMap", tone: "gold",
        body: "This solves problems like: find the longest subarray whose sum equals K. For a subarray to have sum K: prefix[i] - prefix[j] = K. Rearranged: prefix[j] = prefix[i] - K. That's the key observation.",
        conclusion: null },
      { type: "text", heading: "6. Worked example",
        body: "nums = [1, 2, 3, -2, 5], K = 3. Running prefixes: 1, 3, 6, 4, 9. Suppose the current prefix is 6. We need 6 - 3 = 3. Have we seen prefix 3 before? Yes \u2014 so the elements between those two positions sum to exactly 3.",
        diagram: "nums:     1   2   3  -2   5\nprefix:   1   3   6   4   9\n\ncurrent prefix = 6\nneeded = 6 - 3 = 3  \u2192 seen at an earlier index \u2192 match!" },
      { type: "diagram", heading: "7. This is why HashMap appears",
        body: "We store: prefixSum \u2192 earliest index.\n\ncurrentSum\n     \u2193\ncurrentSum - K\n     \u2193\nHashMap lookup\n\nThis is one of the most important combinations in array interviews: Prefix Sum + HashMap." },
      { type: "callout", heading: "8. Why store the earliest index?", tone: "gold",
        body: "Suppose prefixSum = 5 appears at indices 2, 5, and 8. If you're looking for the longest subarray ending later, you want earliest = 2, because that gives the largest distance.",
        conclusion: "For longest-subarray problems, store the first occurrence." },
      { type: "chips", heading: "9. Prefix Sum recognition",
        intro: "When you see any of these, think Prefix Sum \u2014 then ask: do I need fast lookup of an earlier prefix? If yes: Prefix Sum + HashMap.",
        items: ["Range sum", "Subarray sum", "Sum equals K", "Count subarrays with sum K", "Longest subarray with sum K", "Shortest/range sum variants"] },
      { type: "comparison", heading: "10. Prefix Sum vs Sliding Window", items: [
        { label: "Problem A: min-length subarray, sum \u2265 K, all positive", body: "Sliding Window \u2014 the condition behaves predictably: too small \u2192 expand, large enough \u2192 shrink." },
        { label: "Problem B: longest subarray, sum = K, negatives allowed", body: "Sliding Window \u274c \u2014 adding a negative number can decrease the sum, breaking the monotonic assumption. Use Prefix Sum + HashMap instead." }
      ], conclusion: "This is a very important interview distinction \u2014 don't default to Sliding Window just because you see the word \u2018subarray\u2019." },
      { type: "text", heading: "11. Prefix Sum + Modulo",
        body: "For problems like \u2018find whether a subarray sum is divisible by K\u2019, store prefixSum % K instead of the raw prefixSum. If prefix[i] % K == prefix[j] % K, then their difference is divisible by K. So: same remainder \u2192 subarray sum divisible by K. This is the Prefix Sum + Modulo pattern." },
      { type: "text", heading: "12. Difference Array",
        body: "For many range updates (e.g. add +5 to indices 2\u21926, add +3 to indices 4\u21928), doing every update individually is expensive. Instead: difference[start] += value; difference[end + 1] -= value. Then take a prefix sum at the end.",
        diagram: "Difference Array records changes; Prefix Sum reconstructs the final values." },
      { type: "text", heading: "13. 2D Prefix Sum",
        body: "Same idea, but for matrices \u2014 you can build cumulative information so the sum of any rectangle can be calculated quickly. Used in matrix range sum, rectangle queries, grid problems. You don't need to memorize the formula yet: Prefix Sum generalizes from 1D ranges to 2D rectangles." },
      { type: "diagram", heading: "14. Prefix Sum decision tree",
        body: "Range / subarray sum?\n        \u2193\n       YES\n        \u2193\nNeed repeated range queries?\n        \u2193\n     Prefix Sum\n        |\n        \u251c\u2500\u2500 Need exact sum K?\n        \u2502       \u2193\n        \u2502  Prefix + HashMap\n        \u2502\n        \u251c\u2500\u2500 Need count?\n        \u2502       \u2193\n        \u2502  Prefix + HashMap\n        \u2502\n        \u251c\u2500\u2500 Divisible by K?\n        \u2502       \u2193\n        \u2502  Prefix + Modulo\n        \u2502\n        \u2514\u2500\u2500 Range updates?\n                \u2193\n          Difference Array" },
      { type: "comparison", heading: "15. The most important comparison so far", items: [
        { label: "Sliding Window", body: "Contiguous + window validity can be maintained (monotonic condition)." },
        { label: "Prefix Sum", body: "Need cumulative sum information for repeated range queries." },
        { label: "Prefix Sum + HashMap", body: "Need to find/count/track previous prefix sums." }
      ], conclusion: "This is exactly why we're learning patterns before throwing LeetCode problems at you \u2014 three patterns can all look like \u2018subarray questions\u2019 on the surface." },
      { type: "checklist", heading: "Your Tier 1 knowledge so far",
        items: ["HashMap / HashSet", "Two Pointers", "Sliding Window", "Prefix Sum"] },
      { type: "practice", heading: "Quick recognition test",
        intro: "Don't code. For each, give me: Pattern / Reason.",
        items: [
          "(A) Given an array of positive integers, find the smallest subarray whose sum is at least K.",
          "(B) Given an array containing positive and negative integers, find the longest subarray whose sum equals K.",
          "(C) Given an array, count how many subarrays have sum exactly K.",
          "(D) Given an array, answer 1000 queries asking for the sum between indices L and R.",
          "(E) Given a string, find the longest substring containing at most 2 distinct characters.",
          "(F) Given a sorted array, determine whether two numbers sum to K."
        ],
        note: "Don't worry if you get some wrong \u2014 this is the first real test of whether the four patterns are beginning to separate in your mind." }
    ]
  },

  "binary-search": {
    title: "Pattern 5 \u2014 Binary Search",
    sections: [
      { type: "callout", heading: "The one mistake to avoid", tone: "red",
        body: "Binary Search is NOT just \u201csearch in a sorted array\u201d \u2014 that's only the simplest version.",
        conclusion: "The real pattern: if I can divide the search space in half and safely eliminate one half, Binary Search may work." },
      { type: "text", heading: "1. The basic idea",
        body: "Find 9 in [1, 3, 5, 7, 9, 11, 15]. Look at the middle (7). Since 9 > 7, everything to the left of 7 can be eliminated. Now search [9, 11, 15]. We repeatedly eliminate half \u2014 O(log N).",
        diagram: "        \u2193\n[1  3  5  7  9  11  15]   mid=7, 9>7 \u2192 discard left\n\n[9 11 15]   search continues here" },
      { type: "diagram", heading: "2. The real mental model (not left/right/mid)",
        body: "Search Space\n\n[-------------------------]\n\n        \u2193\n\nEvaluate middle\n\n        \u2193\n\nOne half impossible\n\n        \u2193\n\nDiscard it\n\n        \u2193\n\nRepeat\n\nThe key question: what allows me to safely discard half the search space?" },
      { type: "variants", heading: "3\u20137, 10\u201312. The Binary Search families", items: [
        { id: "1", title: "Classic Binary Search", question: "Is the data sorted and do I need to find a value?",
          typical: ["Search in sorted array", "Search Insert Position", "Find first occurrence", "Find last occurrence"] },
        { id: "2", title: "Lower Bound", question: "Find the first position where value >= target.",
          diagram: "[1, 2, 4, 4, 4, 7, 9]\n         \u2191 first >= 4 \u2192 index 2\n\nFalse False True True True\n            \u2191 first True" },
        { id: "3", title: "Upper Bound", question: "Find the first position where value > target.",
          diagram: "[1, 2, 4, 4, 4, 7, 9]\n                  \u2191 first > 4\n\nFalse False False False True\n                         \u2191 first True" },
        { id: "4", title: "Rotated Sorted Array", question: "The array isn't globally sorted \u2014 now what?",
          diagram: "[4,5,6,7,0,1,2]\n[4 5 6 7] | [0 1 2]\n  sorted        sorted",
          note: "One half is always sorted. Determine which half is sorted, then whether the target belongs there \u2014 that lets you eliminate half, same as classic Binary Search." },
        { id: "5", title: "Peak / Structural Search", question: "nums[mid] < nums[mid+1]?",
          note: "You don't need a traditional sorted array. If we're going uphill at mid, a peak must exist to the right \u2014 eliminate the left half.",
          typical: ["Find Peak Element"] },
        { id: "6", title: "First/Last Occurrence (Boundary Search)", question: "Find the first or last index of a repeated value.",
          note: "Normal Binary Search may land on any matching index. For first occurrence: record answer=mid, keep searching left. For last occurrence: record answer=mid, keep searching right." }
      ]},
      { type: "callout", heading: "6. The powerful generalization: Binary Search on a Monotonic Predicate", tone: "gold",
        body: "We don't need an array of numbers at all \u2014 we need a question: \u2018is this candidate feasible?\u2019 If the answer becomes true and then stays true (F F F F T T T T), we can Binary Search on that predicate directly.",
        conclusion: null },
      { type: "text", heading: "7. Binary Search on Answer \u2b50\u2b50\u2b50",
        body: "Ship packages within D days \u2014 find the minimum ship capacity. There is no sorted array here. We're searching a monotonic answer space: for each candidate capacity, ask \u2018can we ship everything within D days?\u2019, then binary search for the first capacity where the answer flips to true.",
        diagram: "capacity: 10 11 12 13 14 15 16\npossible:   F  F  F  F  T  T  T\n                         \u2191 we want this: first T" },
      { type: "chips", heading: "8. Recognition trigger",
        intro: "When you see any of these, ask: if I increase X, does feasibility change monotonically? If yes \u2192 Binary Search on Answer.",
        items: ["Minimum possible X", "Maximum possible X", "Smallest X", "Largest X", "Minimum capacity", "Minimum speed", "Maximum distance", "Minimum time", "Can we do it within X?"] },
      { type: "text", heading: "9. Worked example \u2014 Koko eating bananas",
        body: "Find minimum eating speed to finish within H hours. At speed 1: impossible. At speed 10: possible. The key property: as speed increases, time required never increases \u2014 feasibility is monotonic (F F F F F T T T T), so Binary Search applies." },
      { type: "diagram", heading: "13. Binary Search decision tree",
        body: "                Binary Search?\n                       \u2193\n             Can I eliminate half?\n                       \u2193\n                      YES\n                       |\n        \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n        \u2193              \u2193              \u2193\n    Sorted Array   Monotonic       Special\n                   Answer Space     Structure\n        \u2193              \u2193              \u2193\n     Search        Min/Max X      Rotated\n     Boundary      Capacity       Peak\n                   Speed\n                   Time" },
      { type: "comparison", heading: "14. Binary Search vs Two Pointers", items: [
        { label: "Two Pointers", body: "Process the array, move pointers inward/forward \u2014 often O(N). Example: sorted array, find two numbers with a target \u2192 Two Pointers." },
        { label: "Binary Search", body: "Search space, discard half each step \u2014 O(log N). Example: sorted array, find whether target exists \u2192 Binary Search." }
      ], conclusion: "Same data, different objective, different algorithm." },
      { type: "comparison", heading: "15. Binary Search vs Sliding Window", items: [
        { label: "Sliding Window", body: "Maintain a contiguous range." },
        { label: "Binary Search", body: "Eliminate half of a search space." }
      ], conclusion: "Completely different mental models \u2014 don't confuse them just because both can involve arrays." },
      { type: "callout", heading: "16. The most important question", tone: "red",
        body: "Whenever you see Minimum / Maximum / Smallest / Largest, don't automatically think Binary Search. Ask: \u2018is there a monotonic feasibility condition?\u2019 Example \u2014 can capacity X finish the work: X=10\u2192No, X=11\u2192No, X=12\u2192No, X=13\u2192Yes, X=14\u2192Yes \u2014 that's Binary Search. But Maximum Subarray Sum doesn't automatically have that property \u2014 that's where you might use Kadane instead.",
        conclusion: null },
      { type: "diagram", heading: "17. Binary Search complexity",
        body: "Classic:\n  Time:  O(log N)\n  Space: O(1)\n\nBinary Search on answer:\n  O(log(range) \u00d7 feasibility-check)\n\nExample:\n  Feasibility check = O(N)\n  Binary search      = O(log M)\n  Total              = O(N log M)" },
      { type: "checklist", heading: "18. What you need to remember (6 families, not 6 implementations)",
        items: ["1. Classic Search", "2. Boundary Search (First / Last)", "3. Lower / Upper Bound", "4. Rotated Sorted Array", "5. Peak / Structural Binary Search", "6. Binary Search on Answer (Minimum feasible / Maximum feasible)"] },
      { type: "checklist", heading: "Your Tier 1 progress",
        items: [
          "HashMap / HashSet", "Two Pointers", "Sliding Window", "Prefix Sum", "Binary Search",
          { label: "Sorting + Scanning", done: false }, { label: "Intervals", done: false },
          { label: "Kadane", done: false }, { label: "Bit Manipulation", done: false }
        ]},
      { type: "diagram", heading: "The pattern map forming in your head", dark: true,
        body: "Array\n \u2502\n \u251c\u2500\u2500 Lookup \u2192 HashMap\n \u2502\n \u251c\u2500\u2500 Ordered \u2192 Two Pointers\n \u2502              Binary Search\n \u2502\n \u251c\u2500\u2500 Contiguous \u2192 Sliding Window\n \u2502                 Prefix Sum\n \u2502\n \u2514\u2500\u2500 Optimization \u2192 Kadane" },
      { type: "nextLesson", pattern: "Sorting + Scanning",
        points: ["Looks simple but is a powerful way of transforming difficult array problems into easy ones"] }
    ]
  }
};
