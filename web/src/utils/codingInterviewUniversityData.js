/**
 * Coding Interview University (jwasham/coding-interview-university)
 * Complete Computer Science & DSA Study Plan Dataset
 */

export const CIU_MODULES = [
  {
    id: 'ciu-big-o',
    title: '1. Algorithmic Complexity / Big-O Analysis',
    icon: 'Binary',
    color: '#6366f1',
    description: 'Master time and space complexity, asymptotic notation (O, Ω, Θ), amortized analysis, and common complexity classes.',
    keyConcepts: [
      'Big-O (Upper bound), Big-Omega (Lower bound), Big-Theta (Tight bound)',
      'O(1) Constant < O(log n) Logarithmic < O(n) Linear < O(n log n) Linearithmic < O(n²) Quadratic < O(2ⁿ) Exponential < O(n!) Factorial',
      'Space complexity: auxiliary memory + call stack depth in recursion',
      'Amortized analysis: dynamic array doubling where n inserts take O(n) total => O(1) average'
    ],
    videoResource: {
      title: 'Big-O Notation in 100 Seconds',
      videoId: 'g2o22C3CRfU',
      author: 'Fireship'
    }
  },
  {
    id: 'ciu-arrays',
    title: '2. Arrays & Dynamic Array Implementation',
    icon: 'Layers',
    color: '#38bdf8',
    description: 'Contiguous memory allocation, static arrays, dynamic resizing (Vector/ArrayList), pointer arithmetic, and insertion/deletion trade-offs.',
    keyConcepts: [
      'Contiguous memory address formula: Address(i) = BaseAddress + (i * elementSize)',
      'Dynamic array doubling: when capacity is full, allocate 2x memory and copy elements (amortized O(1) append)',
      'Insert/Delete at arbitrary index: O(n) due to right/left shifting of elements'
    ],
    videoResource: {
      title: 'Dynamic Array Implementation & Amortized Analysis',
      videoId: 'qTb1sZX74K0',
      author: 'NeetCode'
    }
  },
  {
    id: 'ciu-linked-lists',
    title: '3. Linked Lists (Singly, Doubly & Circular)',
    icon: 'Split',
    color: '#10b981',
    description: 'Pointer manipulation, singly linked list, doubly linked list with head & tail pointers, Sentinel dummy nodes, Floyd’s cycle-finding.',
    keyConcepts: [
      'Singly Linked List: Node { value, next } — O(1) prepend, O(n) access',
      'Doubly Linked List: Node { value, next, prev } — O(1) append & delete with tail pointer',
      'Sentinel Dummy Head: Eliminates edge-case null checks during insertion/deletion',
      "Floyd's Tortoise and Hare: Fast (2x) and slow (1x) pointers for cycle detection"
    ],
    videoResource: {
      title: 'Linked List Data Structure Masterclass',
      videoId: 'F8AbOfQwl1c',
      author: 'freeCodeCamp'
    }
  },
  {
    id: 'ciu-stacks-queues',
    title: '4. Stacks, Queues & Monotonic Data Structures',
    icon: 'Box',
    color: '#f59e0b',
    description: 'LIFO stack semantics, FIFO queue semantics, circular array buffer implementation, double-ended queue (Deque), and monotonic stacks.',
    keyConcepts: [
      'Stack (LIFO): Push, Pop, Peek in O(1) time. Used in call stacks, undo buffers, bracket parsing',
      'Queue (FIFO): Enqueue, Dequeue in O(1) using circular buffer `(tail + 1) % capacity`',
      'Monotonic Stack: Maintaining elements in strictly increasing/decreasing order for Next Greater Element in O(n)'
    ],
    videoResource: {
      title: 'Stacks and Queues Explained with Code',
      videoId: 'wjI1WNcIntg',
      author: 'CS Dojo'
    }
  },
  {
    id: 'ciu-hash-tables',
    title: '5. Hash Tables, Hash Functions & Collisions',
    icon: 'Database',
    color: '#ec4899',
    description: 'Hash functions, bucket indexing via modulo, collision resolution (Separate Chaining vs Open Addressing Linear/Quadratic probing), Load Factor.',
    keyConcepts: [
      'Hash Function: Maps arbitrary key into an integer bucket index: `hash(key) % capacity`',
      'Separate Chaining: Array of linked lists or balanced BSTs (Java 8+ Red-Black tree)',
      'Open Addressing: Probing for next empty slot via Linear Probing `(h + i) % m` or Quadratic Probing',
      'Load Factor: Ratio `n / capacity`. When > 0.75, table rehashes into 2x capacity'
    ],
    videoResource: {
      title: 'How Hash Tables Work Internally',
      videoId: 'shs0KM3wKv8',
      author: 'Computerphile'
    }
  },
  {
    id: 'ciu-binary-search',
    title: '6. Binary Search & Lower/Upper Bounds',
    icon: 'Search',
    color: '#06b6d4',
    description: 'Divide and conquer on sorted arrays, middle calculation without overflow `left + (right - left) // 2`, search in rotated arrays.',
    keyConcepts: [
      'Invariant loop condition: `while left <= right:` with `mid = left + (right - left) // 2`',
      'Lower Bound (First index where element >= target) & Upper Bound (First index where element > target)',
      'Binary Search on Answer Range (e.g. Koko Eating Bananas, Capacity to Ship Packages)'
    ],
    videoResource: {
      title: 'Binary Search Algorithm & Templates',
      videoId: 's4DPM8ct1pI',
      author: 'NeetCode'
    }
  },
  {
    id: 'ciu-bitwise',
    title: '7. Bitwise Operations & Bit Manipulation',
    icon: 'Cpu',
    color: '#a855f7',
    description: 'Bitwise AND (&), OR (|), XOR (^), NOT (~), Left Shift (<<), Right Shift (>>), Brian Kernighan bit count, power-of-two tricks.',
    keyConcepts: [
      'Check if power of 2: `(n > 0) and (n & (n - 1) == 0)`',
      "Brian Kernighan's Algorithm: `n = n & (n - 1)` clears the lowest set bit in O(number of set bits)",
      'XOR properties: `x ^ x = 0` and `x ^ 0 = x`. Used to find single non-duplicate element in O(n) time and O(1) space'
    ],
    videoResource: {
      title: 'Bit Manipulation Tricks for Coding Interviews',
      videoId: 'NLKQEOgBAnw',
      author: 'freeCodeCamp'
    }
  },
  {
    id: 'ciu-trees-bst',
    title: '8. Trees, Binary Search Trees & Self-Balancing Trees',
    icon: 'GitBranch',
    color: '#10b981',
    description: 'Binary trees, BST invariants, traversals (In-order, Pre-order, Post-order, BFS Level-order), BST deletion (3 cases), AVL & Red-Black trees.',
    keyConcepts: [
      'In-Order Traversal of BST visits nodes in strictly ascending sorted order',
      'BST Deletion 3 cases: Node is leaf, Node has 1 child, Node has 2 children (replace with In-order Successor)',
      'Height-balanced property: `|height(left) - height(right)| <= 1`. Maintained via Left/Right Rotations in AVL/Red-Black trees'
    ],
    videoResource: {
      title: 'Binary Tree Algorithms for Technical Interviews',
      videoId: 'fAAZ23Xd6DA',
      author: 'freeCodeCamp'
    }
  },
  {
    id: 'ciu-heaps',
    title: '9. Heaps, Priority Queues & HeapSort',
    icon: 'Layers',
    color: '#f59e0b',
    description: 'Binary Min-Heap and Max-Heap array indexing, Sift-Up (Heapify-Up), Sift-Down (Heapify-Down), O(n) Build-Heap algorithm, HeapSort.',
    keyConcepts: [
      'Array indexing: Left child = `2i + 1`, Right child = `2i + 2`, Parent = `(i - 1) // 2`',
      'Insert: append to end and Sift-Up in O(log n). Extract Min/Max: swap root with last element and Sift-Down in O(log n)',
      'Build Heap from array in O(n) time by sifting down from `n//2 - 1` down to 0'
    ],
    videoResource: {
      title: 'Heaps and Priority Queues Complete Guide',
      videoId: 't0Cq6tVNRBA',
      author: 'William Fiset'
    }
  },
  {
    id: 'ciu-graphs',
    title: '10. Graphs, BFS, DFS, Topological Sort & Dijkstra',
    icon: 'Network',
    color: '#818cf8',
    description: 'Graph representations (Adjacency list vs matrix), BFS with Queue, DFS with recursion/stack, Cycle detection, Kahn’s Topological Sort, Dijkstra shortest path.',
    keyConcepts: [
      'BFS: Level-by-level exploration using a Queue. Finds shortest unweighted path',
      'DFS: Explores branch depth using Recursion/Stack. Used in backtracking and connected components',
      'Topological Sort: Linear ordering of vertices in a DAG (Directed Acyclic Graph) via Kahn’s in-degree algorithm',
      "Dijkstra's Algorithm: Shortest path in weighted graph using Min-Heap priority queue in O((V + E) log V)"
    ],
    videoResource: {
      title: 'Graph Algorithms for Technical Interviews',
      videoId: 'tWVWeAqZ0WU',
      author: 'freeCodeCamp'
    }
  },
  {
    id: 'ciu-sorting',
    title: '11. Sorting Algorithms (MergeSort, QuickSort, HeapSort)',
    icon: 'Compass',
    color: '#ec4899',
    description: 'Comparison sorts (MergeSort, QuickSort, HeapSort) vs Non-comparison sorts (Counting Sort, Radix Sort), stability, in-place partitioning.',
    keyConcepts: [
      'MergeSort: Divide & Conquer, guaranteed O(n log n) time, stable, requires O(n) auxiliary space',
      'QuickSort: Partitioning around a pivot (Lomuto/Hoare), average O(n log n), in-place O(log n) space, worst case O(n²)',
      'Counting/Radix Sort: Non-comparison integer sort in O(n + k) linear time'
    ],
    videoResource: {
      title: 'Sorting Algorithms Masterclass',
      videoId: 'kPRA0W1kECg',
      author: 'CS50'
    }
  },
  {
    id: 'ciu-dp',
    title: '12. Dynamic Programming & Memoization Patterns',
    icon: 'Zap',
    color: '#34d399',
    description: 'Overlapping subproblems, optimal substructure, 1D/2D DP state transitions, 0/1 Knapsack, Longest Common Subsequence, Edit Distance.',
    keyConcepts: [
      'Top-Down with Memoization: Recursion tree with hash map cache',
      'Bottom-Up Tabulation: Iteratively populating a 1D/2D table with state transitions',
      'Space Optimization: Reducing 2D DP table to two rows or 1D array when state only depends on previous row'
    ],
    videoResource: {
      title: 'Dynamic Programming - Learn to Solve Any DP Problem',
      videoId: 'oBt53YbR9Kk',
      author: 'freeCodeCamp'
    }
  },
  {
    id: 'ciu-trie',
    title: '13. Trie (Prefix Tree) & Fast String Autocomplete',
    icon: 'FileCode2',
    color: '#f43f5e',
    description: 'N-ary tree for string retrieval, character children maps/arrays, word termination flags, O(length of word) prefix searches.',
    keyConcepts: [
      'TrieNode: `{ children: Map<char, TrieNode>, isEndOfWord: boolean }`',
      'Insert, Search, and StartsWith operations in O(L) time where L is string length, independent of dictionary size'
    ],
    videoResource: {
      title: 'Trie Data Structure Implementation',
      videoId: 'o6563IIjp5E',
      author: 'NeetCode'
    }
  },
  {
    id: 'ciu-system-arch',
    title: '14. System Design & Core Computer Architecture',
    icon: 'Building2',
    color: '#a855f7',
    description: 'CPU caching (L1/L2/L3), memory hierarchy, virtual memory, paging, thrashing, Little-Endian vs Big-Endian, and distributed scalability.',
    keyConcepts: [
      'Memory Hierarchy: CPU Registers (1 cycle) < L1/L2/L3 Cache (4-40 cycles) < RAM (100-200 cycles) < SSD/Disk (millions of cycles)',
      'Virtual Memory & Paging: Mapping virtual page tables to physical frames via MMU and TLB (Translation Lookaside Buffer)',
      'CAP Theorem: Consistency, Availability, Partition Tolerance trade-offs in distributed systems'
    ],
    videoResource: {
      title: 'System Design Interview Crash Course',
      videoId: 'i53Gi_K3o7I',
      author: 'ByteByteGo'
    }
  }
];

export const CIU_CODING_CHALLENGES = [
  {
    id: 101,
    title: 'Dynamic Array Implementation with Auto-Resizing',
    category: 'Arrays',
    track: 'Coding Interview University',
    difficulty: 'Medium',
    acceptance: '79%',
    videoId: 'qTb1sZX74K0',
    videoChannel: 'NeetCode',
    videoTitle: 'Design Dynamic Array - LeetCode Solution',
    description: 'Implement a dynamic array (like std::vector or ArrayList) with capacity doubling when full, indexing O(1), append O(1) amortized, and pop O(1).',
    starter_code: {
      python: "class DynamicArray:\n    def __init__(self, capacity: int = 2):\n        self.capacity = capacity\n        self.size = 0\n        self.arr = [None] * capacity\n\n    def append(self, val: int) -> None:\n        if self.size == self.capacity:\n            self._resize(2 * self.capacity)\n        self.arr[self.size] = val\n        self.size += 1\n\n    def _resize(self, new_cap: int) -> None:\n        new_arr = [None] * new_cap\n        for i in range(self.size):\n            new_arr[i] = self.arr[i]\n        self.arr = new_arr\n        self.capacity = new_cap\n\n    def get(self, index: int) -> int:\n        if index < 0 or index >= self.size:\n            raise IndexError('Out of bounds')\n        return self.arr[index]\n\nda = DynamicArray(2)\nda.append(10)\nda.append(20)\nda.append(30) # Triggers doubling to capacity 4\nprint('Size:', da.size, '| Capacity:', da.capacity, '| Element at 2:', da.get(2))",
      javascript: "class DynamicArray {\n    constructor(capacity = 2) {\n        this.capacity = capacity;\n        this.size = 0;\n        this.arr = new Array(capacity);\n    }\n    append(val) {\n        if (this.size === this.capacity) this._resize(this.capacity * 2);\n        this.arr[this.size] = val;\n        this.size++;\n    }\n    _resize(newCap) {\n        const newArr = new Array(newCap);\n        for (let i = 0; i < this.size; i++) newArr[i] = this.arr[i];\n        this.arr = newArr;\n        this.capacity = newCap;\n    }\n    get(index) {\n        if (index < 0 || index >= this.size) throw new Error('Out of bounds');\n        return this.arr[index];\n    }\n}\nconst da = new DynamicArray(2);\nda.append(10); da.append(20); da.append(30);\nconsole.log(`Size: ${da.size}, Cap: ${da.capacity}, Element at 2: ${da.get(2)}`);"
    },
    test_cases: [
      { input: 'Append 10, 20, 30 with initial cap 2', expected: 'Size: 3, Capacity: 4, Element at 2: 30' }
    ],
    hint: "When size reaches capacity, allocate an array of double size, copy all elements over, and reassign the internal buffer pointer."
  },
  {
    id: 102,
    title: 'Bit Manipulation: Count Set Bits (Brian Kernighan)',
    category: 'Bit Manipulation',
    track: 'Coding Interview University',
    difficulty: 'Easy',
    acceptance: '89%',
    videoId: 'NLKQEOgBAnw',
    videoChannel: 'freeCodeCamp',
    videoTitle: 'Brian Kernighan Bit Counting Algorithm',
    description: "Write a function that takes an unsigned integer and returns the number of '1' bits it has (Hamming weight) in O(number of set bits) using bitwise operations.",
    starter_code: {
      python: "def countSetBits(n: int) -> int:\n    count = 0\n    while n > 0:\n        n = n & (n - 1) # Clears the lowest set bit\n        count += 1\n    return count\n\nprint('Set bits in 29 (11101 binary):', countSetBits(29))",
      javascript: "function countSetBits(n) {\n    let count = 0;\n    while (n > 0) {\n        n = n & (n - 1);\n        count++;\n    }\n    return count;\n}\nconsole.log('Set bits in 29:', countSetBits(29));"
    },
    test_cases: [
      { input: 'n = 29 (binary 11101)', expected: '4' },
      { input: 'n = 128 (binary 10000000)', expected: '1' }
    ],
    hint: "Executing `n & (n - 1)` flips the least significant set bit to 0 in each iteration."
  },
  {
    id: 103,
    title: 'Trie (Prefix Tree) Implementation with Search & StartsWith',
    category: 'Trie / Trees',
    track: 'Coding Interview University',
    difficulty: 'Medium',
    acceptance: '74%',
    videoId: 'o6563IIjp5E',
    videoChannel: 'NeetCode',
    videoTitle: 'Implement Trie Prefix Tree - LeetCode 208',
    description: 'Implement a Trie with `insert(word)`, `search(word)`, and `startsWith(prefix)` methods. A core data structure from Coding Interview University for autocomplete.',
    starter_code: {
      python: "class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_end = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word: str) -> None:\n        curr = self.root\n        for char in word:\n            if char not in curr.children:\n                curr.children[char] = TrieNode()\n            curr = curr.children[char]\n        curr.is_end = True\n\n    def search(self, word: str) -> bool:\n        curr = self.root\n        for char in word:\n            if char not in curr.children: return False\n            curr = curr.children[char]\n        return curr.is_end\n\n    def startsWith(self, prefix: str) -> bool:\n        curr = self.root\n        for char in prefix:\n            if char not in curr.children: return False\n            curr = curr.children[char]\n        return True\n\ntrie = Trie()\ntrie.insert('apple')\nprint('Search apple:', trie.search('apple'))\nprint('Search app:', trie.search('app'))\nprint('StartsWith app:', trie.startsWith('app'))",
      javascript: "class TrieNode {\n    constructor() {\n        this.children = new Map();\n        this.isEnd = false;\n    }\n}\nclass Trie {\n    constructor() { this.root = new TrieNode(); }\n    insert(word) {\n        let curr = this.root;\n        for (let c of word) {\n            if (!curr.children.has(c)) curr.children.set(c, new TrieNode());\n            curr = curr.children.get(c);\n        }\n        curr.isEnd = true;\n    }\n    search(word) {\n        let curr = this.root;\n        for (let c of word) {\n            if (!curr.children.has(c)) return false;\n            curr = curr.children.get(c);\n        }\n        return curr.isEnd;\n    }\n    startsWith(prefix) {\n        let curr = this.root;\n        for (let c of prefix) {\n            if (!curr.children.has(c)) return false;\n            curr = curr.children.get(c);\n        }\n        return true;\n    }\n}\nconst t = new Trie(); t.insert('apple');\nconsole.log('Search apple:', t.search('apple'), '| StartsWith app:', t.startsWith('app'));"
    },
    test_cases: [
      { input: "insert('apple'), search('apple'), startsWith('app')", expected: 'true, true' }
    ],
    hint: "Each node holds a dictionary or map of character children. Mark `is_end = True` only at the final node of an inserted word."
  },
  {
    id: 104,
    title: 'Topological Sort (Kahn’s In-Degree Algorithm)',
    category: 'Graphs',
    track: 'Coding Interview University',
    difficulty: 'Medium',
    acceptance: '67%',
    videoId: 'cIBFEhD77b4',
    videoChannel: 'take U forward',
    videoTitle: 'Topological Sort BFS - Kahn Algorithm',
    description: 'Given a Directed Acyclic Graph (DAG), find a linear ordering of its vertices such that for every directed edge u -> v, vertex u comes before v.',
    starter_code: {
      python: "from collections import deque, defaultdict\ndef topologicalSort(num_nodes, edges):\n    adj = defaultdict(list)\n    in_degree = [0] * num_nodes\n    for u, v in edges:\n        adj[u].append(v)\n        in_degree[v] += 1\n    queue = deque([i for i in range(num_nodes) if in_degree[i] == 0])\n    order = []\n    while queue:\n        node = queue.popleft()\n        order.append(node)\n        for neighbor in adj[node]:\n            in_degree[neighbor] -= 1\n            if in_degree[neighbor] == 0:\n                queue.append(neighbor)\n    return order if len(order) == num_nodes else []\n\nprint('Topological Order:', topologicalSort(6, [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)]))",
      javascript: "function topologicalSort(numNodes, edges) {\n    const adj = Array.from({ length: numNodes }, () => []);\n    const inDegree = new Array(numNodes).fill(0);\n    for (let [u, v] of edges) {\n        adj[u].push(v);\n        inDegree[v]++;\n    }\n    const queue = [];\n    for (let i = 0; i < numNodes; i++) if (inDegree[i] === 0) queue.push(i);\n    const order = [];\n    while (queue.length) {\n        const node = queue.shift();\n        order.push(node);\n        for (let nbr of adj[node]) {\n            inDegree[nbr]--;\n            if (inDegree[nbr] === 0) queue.push(nbr);\n        }\n    }\n    return order.length === numNodes ? order : [];\n}\nconsole.log('Topological Order:', topologicalSort(6, [[5, 2], [5, 0], [4, 0], [4, 1], [2, 3], [3, 1]]));"
    },
    test_cases: [
      { input: '6 vertices DAG with dependency edges', expected: '[4, 5, 2, 0, 3, 1] (or valid topological sort)' }
    ],
    hint: "Compute in-degrees for all vertices. Push all 0 in-degree vertices into a queue; as each is popped, decrement neighbors' in-degrees."
  },
  {
    id: 105,
    title: 'MergeSort Divide & Conquer Implementation',
    category: 'Sorting Algorithms',
    track: 'Coding Interview University',
    difficulty: 'Medium',
    acceptance: '82%',
    videoId: 'kPRA0W1kECg',
    videoChannel: 'freeCodeCamp',
    videoTitle: 'Merge Sort Algorithm in Python and JavaScript',
    description: 'Implement MergeSort in O(n log n) guaranteed time complexity using divide and conquer recursion and two-pointer array merging.',
    starter_code: {
      python: "def mergeSort(arr):\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    left = mergeSort(arr[:mid])\n    right = mergeSort(arr[mid:])\n    # Merge two sorted halves\n    merged, i, j = [], 0, 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            merged.append(left[i]); i += 1\n        else:\n            merged.append(right[j]); j += 1\n    merged.extend(left[i:])\n    merged.extend(right[j:])\n    return merged\n\nprint('Sorted:', mergeSort([38, 27, 43, 3, 9, 82, 10]))",
      javascript: "function mergeSort(arr) {\n    if (arr.length <= 1) return arr;\n    const mid = Math.floor(arr.length / 2);\n    const left = mergeSort(arr.slice(0, mid));\n    const right = mergeSort(arr.slice(mid));\n    const merged = [];\n    let i = 0, j = 0;\n    while (i < left.length && j < right.length) {\n        if (left[i] <= right[j]) merged.push(left[i++]);\n        else merged.push(right[j++]);\n    }\n    return [...merged, ...left.slice(i), ...right.slice(j)];\n}\nconsole.log('Sorted:', mergeSort([38, 27, 43, 3, 9, 82, 10]));"
    },
    test_cases: [
      { input: '[38, 27, 43, 3, 9, 82, 10]', expected: '[3, 9, 10, 27, 38, 43, 82]' }
    ],
    hint: "Recursively divide the array in half until base case size <= 1, then merge two sorted halves using two pointers in O(n)."
  }
];
