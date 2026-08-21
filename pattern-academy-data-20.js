// Tier 10 -- Advanced String Algorithms, plus two combo-tier slugs that were
// genuinely empty (dp-binary-search, bitmask-dp) -- these serve both their
// Tier 7 core-pattern card AND their Tier 11 combination-pattern card.
const PATTERN_ACADEMY_20 = {
  "kmp": {
    title: "Pattern 60 \u2014 KMP (Knuth-Morris-Pratt)",
    sections: [
      { type: "text", heading: "The core question",
        body: "Naive substring search re-checks characters it already matched whenever a mismatch occurs, costing O(n*m). KMP precomputes a 'failure function' (also called the prefix function) so that on a mismatch, it never re-examines a character it has already confirmed matches -- giving O(n+m) total." },
      { type: "text", heading: "The prefix function",
        body: "lps[i] = the length of the longest proper prefix of pattern[0..i] that is also a suffix of pattern[0..i]. When a mismatch happens at pattern index j, instead of restarting from 0, jump to lps[j-1] -- that's how much of the pattern we already know still matches.",
        diagram: "pattern = \"ABABAC\"\nlps     = [0,0,1,2,3,0]\nMismatch at j=5 -> jump to lps[4]=3, don't restart from 0" },
      { type: "diagram", heading: "Matching template", dark: true,
        body: "build lps[] for pattern (O(m))\ni = 0, j = 0\nwhile i < n:\n  if text[i] == pattern[j]: i++, j++\n  if j == m: match found at i-j; j = lps[j-1]\n  elif i < n and text[i] != pattern[j]:\n    if j != 0: j = lps[j-1]\n    else: i++" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cFind all occurrences of a pattern in a text in linear time\u201d is the classic KMP signal. Rabin-Karp and Z-Algorithm solve the same problem with different trade-offs.",
        conclusion: "KMP's real value is the prefix function itself -- it reappears in problems about the shortest repeating unit of a string and finding periods." },
      { type: "nextLesson", pattern: "Z Algorithm",
        points: ["A different linear-time string matching approach using a Z-array", "How Z[i] compares to KMP's lps[i]", "Pattern matching via string concatenation trick"] }
    ]
  },

  "z-algorithm": {
    title: "Pattern 61 \u2014 Z Algorithm",
    sections: [
      { type: "text", heading: "The core question",
        body: "The Z-array for a string S has Z[i] = the length of the longest substring starting at i that matches a prefix of S. Once built in O(n), it solves pattern matching by concatenating pattern + separator + text and reading off Z-values." },
      { type: "text", heading: "Pattern matching via concatenation",
        body: "Build combined = pattern + '#' + text (separator must not appear in either). Compute Z for combined. Any position where Z[i] == pattern.length marks a full match of the pattern in the text.",
        diagram: "pattern=\"ab\", text=\"xaby\"\ncombined = \"ab#xaby\"\nZ array marks position where Z[i]==len(pattern)=2 -> match found at that offset" },
      { type: "diagram", heading: "Z-array construction (sliding window idea)", dark: true,
        body: "maintain [L, R] = rightmost Z-box found so far\nfor i from 1 to n-1:\n  if i < R: Z[i] = min(R-i, Z[i-L])  // reuse previous computation\n  extend Z[i] by direct comparison beyond that\n  update [L, R] if window extended past R" },
      { type: "callout", heading: "Z vs KMP", tone: "gold",
        body: "Both run in O(n+m). KMP's lps[] describes self-similarity of the pattern; Z[] describes prefix-matching for every position in the combined string. Z-algorithm is often considered more intuitive to derive from scratch.",
        conclusion: "Recognition trigger: \u201clongest prefix match at every position\u201d or \u201cfind all pattern occurrences\u201d -> Z-array is a valid, often simpler alternative to KMP." },
      { type: "nextLesson", pattern: "Rabin-Karp",
        points: ["Hash-based string matching instead of prefix functions", "Rolling hash for O(1) window comparison", "Multiple pattern search in one pass"] }
    ]
  },

  "rabin-karp": {
    title: "Pattern 62 \u2014 Rabin-Karp",
    sections: [
      { type: "text", heading: "The core question",
        body: "Instead of comparing characters directly, Rabin-Karp hashes the pattern and every window of the text, comparing hashes first. A hash mismatch guarantees no match (fast rejection); a hash match still needs a character-by-character confirmation to rule out hash collisions." },
      { type: "text", heading: "Why hash makes this fast",
        body: "Computing a fresh hash for every window naively costs O(m) each, giving O(nm) overall -- no better than brute force. A ROLLING hash updates the previous window's hash in O(1) by removing the leaving character's contribution and adding the entering character's.",
        diagram: "hash(s[i+1..i+m]) = (hash(s[i..i+m-1]) - s[i]*base^(m-1)) * base + s[i+m]\n(all arithmetic under a large modulus to avoid overflow)" },
      { type: "callout", heading: "Why you still need to verify on hash match", tone: "red",
        body: "Different substrings can produce the same hash (a collision). Always do a direct character comparison when hashes match before declaring a real match -- otherwise the algorithm is wrong, not just slow.",
        conclusion: "Recognition trigger: \u201cmultiple pattern search\u201d or \u201csubstring matching with hashing\u201d -> Rabin-Karp with a rolling hash." },
      { type: "nextLesson", pattern: "Rolling Hash",
        points: ["The general technique behind Rabin-Karp, not limited to substring search", "O(1) substring comparison after O(n) preprocessing", "Double hashing to reduce collision risk"] }
    ]
  },

  "rolling-hash": {
    title: "Pattern 63 \u2014 Rolling Hash",
    sections: [
      { type: "text", heading: "The core question",
        body: "Rolling Hash is the general technique underlying Rabin-Karp: precompute prefix hashes of a string in O(n), then compare ANY two substrings in O(1) by combining prefix hashes -- no need to re-hash on every query." },
      { type: "text", heading: "Substring comparison via prefix hashes",
        body: "hash(s[l..r]) = (prefixHash[r] - prefixHash[l-1] * base^(r-l+1)) mod M. This lets you answer 'are substrings A and B equal?' in O(1) after O(n) preprocessing -- extremely useful for duplicate detection, longest repeated substring, and palindrome checks.",
        diagram: "prefixHash[i] = hash of s[0..i]\nsubstring hash s[l..r] = derived formula above, O(1) per query" },
      { type: "callout", heading: "Collision safety", tone: "red",
        body: "A single hash + modulus can collide, especially adversarially. Using two independent (base, modulus) pairs and requiring BOTH to match dramatically reduces false positives in interview-safe implementations.",
        conclusion: "Recognition trigger: \u201ccompare many substrings quickly\u201d or \u201cfind duplicate/repeated substrings\u201d -> rolling hash with prefix hash arrays." },
      { type: "nextLesson", pattern: "Manacher",
        points: ["A specialized O(n) algorithm just for palindromic substrings", "The odd/even length unification trick", "Why this beats the O(n^2) center-expansion approach"] }
    ]
  },

  "manacher": {
    title: "Pattern 64 \u2014 Manacher's Algorithm",
    sections: [
      { type: "text", heading: "The core question",
        body: "Finding the longest palindromic substring naively (center expansion at every index) costs O(n^2). Manacher's algorithm finds ALL palindromic substrings' radii in O(n) by reusing previously computed palindrome information, similar in spirit to the Z-algorithm's window reuse." },
      { type: "text", heading: "The odd/even unification trick",
        body: "Insert a separator character (e.g. '#') between every character and at both ends: \"aba\" becomes \"#a#b#a#\". This converts every palindrome -- odd or even length -- into an odd-length palindrome in the transformed string, so one algorithm handles both cases uniformly.",
        diagram: "\"aba\"  -> \"#a#b#a#\"   (odd-length palindrome center at 'b')\n\"abba\" -> \"#a#b#b#a#\" (odd-length palindrome center between the b's)" },
      { type: "diagram", heading: "Why it's O(n)", dark: true,
        body: "Maintain [center, rightBoundary] of the rightmost-reaching palindrome found.\nFor a new index i within that boundary, its palindrome radius can be\ninitialized using its mirror position's already-known radius --\navoiding re-scanning characters already covered by the current boundary." },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cLongest palindromic substring\u201d with a hard O(n) requirement (not O(n^2)) is the signal for Manacher. If O(n^2) center-expansion is acceptable, it's simpler to implement and usually sufficient in interviews.",
        conclusion: "Manacher is a specialized tool -- know it exists and what problem it solves, but center-expansion is the more commonly expected interview answer." },
      { type: "nextLesson", pattern: "String Hashing",
        points: ["General-purpose string comparison via hashing", "Detecting duplicate substrings efficiently", "How this differs from Rolling Hash's substring-comparison use case"] }
    ]
  },

  "string-hashing": {
    title: "Pattern 65 \u2014 String Hashing",
    sections: [
      { type: "text", heading: "The core question",
        body: "String Hashing is the umbrella technique of representing strings/substrings as numeric hash values for fast equality comparison, duplicate detection, and set membership -- Rolling Hash and Rabin-Karp are specific applications of this broader idea." },
      { type: "text", heading: "Common use cases",
        body: "Detecting duplicate substrings (hash every substring of a fixed length into a set, watch for collisions), checking if one string is a rotation of another (concatenate and search), and building a hash-based Suffix structure as a simpler alternative to a Suffix Array in easier problems.",
        diagram: "Longest Duplicated Substring: binary search on length L,\nhash every substring of length L, check if any hash repeats\n-> O(n log n) instead of O(n^2)" },
      { type: "callout", heading: "When to reach for hashing vs a real string algorithm", tone: "gold",
        body: "Hashing is easier to implement under interview time pressure than Suffix Arrays or Suffix Automatons, but carries collision risk and needs careful modulus/base choices. For competitive programming with adversarial inputs, true suffix structures are safer.",
        conclusion: "Recognition trigger: \u201cfast substring equality\u201d in an interview setting -> string hashing is usually the pragmatic choice." },
      { type: "nextLesson", pattern: "Suffix Array",
        points: ["A sorted structure over all suffixes of a string", "LCP array for O(1) longest-common-prefix queries between suffixes", "How this powers substring counting and pattern matching"] }
    ]
  },

  "suffix-array": {
    title: "Pattern 66 \u2014 Suffix Array",
    sections: [
      { type: "text", heading: "The core question",
        body: "A Suffix Array is the sorted list of starting indices of every suffix of a string, ordered lexicographically. Combined with the LCP (Longest Common Prefix) array between adjacent suffixes, it answers substring/pattern queries without hashing collisions." },
      { type: "text", heading: "Why sort suffixes?",
        body: "Once suffixes are sorted, any substring search becomes a binary search over the suffix array (does the pattern match a range of suffix prefixes?). The LCP array additionally enables counting distinct substrings and finding the longest repeated substring exactly.",
        diagram: "s = \"banana\"\nSuffixes sorted: a, ana, anana, banana, na, nana\nSuffix array (indices): [5, 3, 1, 0, 4, 2]\nLCP array gives shared-prefix lengths between adjacent sorted suffixes" },
      { type: "callout", heading: "Suffix Array vs Rolling Hash", tone: "gold",
        body: "Suffix Arrays give exact answers with no collision risk, support binary search for pattern matching, and enable LCP-based queries hashing can't easily do. The cost is more complex construction (O(n log n) with the standard algorithm).",
        conclusion: "Recognition trigger: \u201cmany queries about substring relationships\u201d in a setting where exactness matters (not interview time-pressure) -> Suffix Array + LCP." },
      { type: "nextLesson", pattern: "Suffix Automaton",
        points: ["An even more powerful compact representation of all substrings", "Counting distinct substrings in linear space", "When this is worth the added complexity over a Suffix Array"] }
    ]
  },

  "suffix-automaton": {
    title: "Pattern 67 \u2014 Suffix Automaton",
    sections: [
      { type: "text", heading: "The core question",
        body: "A Suffix Automaton is the smallest possible automaton (state machine) that recognizes exactly the set of all substrings of a string. Built in O(n) online (one character at a time), it compactly represents an exponential number of substrings in linear space." },
      { type: "text", heading: "What it unlocks",
        body: "Once built, it answers: number of distinct substrings, longest common substring between two strings (by feeding the second string through the automaton), and substring occurrence counts -- all without enumerating substrings explicitly.",
        diagram: "s = \"aab\"\nDistinct substrings: a, aa, aab, ab, b  (5 total)\nSuffix Automaton represents all of these in O(n) states/transitions" },
      { type: "callout", heading: "When this level of machinery is worth it", tone: "gold",
        body: "This is the deepest tool in the Advanced String Algorithms tier -- reach for it only when Suffix Arrays or hashing genuinely can't meet the complexity requirement (e.g. multiple online queries against a growing string).",
        conclusion: "In most interviews, recognizing that a Suffix Automaton EXISTS and what class of problem it solves is more valuable than being able to implement it from memory." }
    ]
  },

  "dp-binary-search": {
    title: "Pattern \u2014 DP + Binary Search",
    sections: [
      { type: "text", heading: "The core question",
        body: "Some DP recurrences have a monotonic structure that lets you replace an O(n) inner scan with an O(log n) binary search, dropping the total complexity from O(n^2) to O(n log n). This is not a new algorithm -- it's an optimization layered on top of an existing DP." },
      { type: "text", heading: "The classic example: LIS",
        body: "The naive LIS recurrence dp[i] = max(dp[j]+1) for all j<i with nums[j]<nums[i] is O(n^2). The O(n log n) version instead maintains tails[k] = smallest possible tail value for an increasing subsequence of length k+1, and binary searches for where nums[i] belongs.",
        diagram: "nums = [3,1,4,1,5]\ntails after each step: [3] -> [1] -> [1,4] -> [1,1] -> [1,1,5]\nlen(tails) = LIS length = 3" },
      { type: "diagram", heading: "General recognition shape", dark: true,
        body: "dp[i] depends on the BEST/closest qualifying dp[j] among j < i\n        AND\nthe qualifying condition or dp[] values are monotonic\n        =>\nreplace the linear scan for j with binary search over a maintained sorted structure" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "If your O(n^2) DP recurrence scans all previous states looking for the best one under a monotonic condition (increasing values, weighted interval end times, etc.), ask whether a sorted auxiliary array + binary search can replace that scan.",
        conclusion: "Other examples: Russian Doll Envelopes, Longest Chain of Pairs, Weighted Job Scheduling (binary search for the latest compatible job)." }
    ]
  },

  "bitmask-dp": {
    title: "Pattern \u2014 Bitmask DP",
    sections: [
      { type: "text", heading: "The core question",
        body: "When a problem's state includes 'which subset of a small set of items has been used/visited,' represent that subset as an integer bitmask. dp[mask] or dp[i][mask] then captures both position and history in one compact key." },
      { type: "text", heading: "Why this works",
        body: "For N items (typically N <= ~20 for feasibility), there are 2^N possible subsets. Encoding the subset as a bitmask lets you use fast bitwise operations to check membership, add an item, or remove one -- turning an otherwise exponential-looking state into an indexable array dimension.",
        diagram: "mask = 0b01011 means items 0, 1, and 3 are used (bit i set = item i used)\nAdd item 2:    mask | (1 << 2)  -> 0b01111\nCheck item 1:  mask & (1 << 1) != 0  -> true" },
      { type: "diagram", heading: "Classic template: Traveling Salesman", dark: true,
        body: "dp[mask][i] = minimum cost to have visited exactly the cities in mask,\n              currently standing at city i\ndp[mask][i] = min over j in mask, j != i:\n              dp[mask without i][j] + cost(j, i)\nAnswer = min over i of dp[fullMask][i] + cost(i, start)" },
      { type: "callout", heading: "Recognition trigger", tone: "gold",
        body: "\u201cVisit all of a small set of items/nodes,\u201d \u201cassign tasks to workers,\u201d or \u201ctrack which subset of keys/rooms/cities has been used\u201d with a small N -- these are the classic Bitmask DP signals.",
        conclusion: "This is the same core idea used in Backtracking + Bitmask, just reframed as memoized DP instead of pure exploration -- the state IS the mask, regardless of which technique explores it." }
    ]
  }
};
