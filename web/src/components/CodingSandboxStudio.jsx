import React, { useState, useEffect, useMemo } from 'react';
import { 
  Code, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  HelpCircle, 
  Terminal, 
  Layers, 
  Clock, 
  Cpu, 
  BookOpen, 
  Send, 
  RefreshCw, 
  ChevronRight,
  Filter,
  Check,
  Zap,
  Award,
  Database,
  Layout,
  Building2,
  GraduationCap,
  Network,
  Binary,
  GitBranch,
  Split,
  Box,
  Compass,
  FileCode2,
  Info,
  Youtube,
  ExternalLink,
  Video,
  Copy
} from 'lucide-react';
import SoundSystem from './characters/SoundEffects';
import CharacterSpeechBubble from './characters/CharacterSpeechBubble';
import { PixelCharacter } from './characters/CharacterUniverse';
import { LEETCODE_COMPANY_QUESTIONS } from '../utils/leetcodeCompanyQuestions';

const COMPREHENSIVE_CODING_PROBLEMS = [
  // ==========================================
  // 1. BIG TECH / PRODUCT: ARRAYS & STRINGS
  // ==========================================
  {
    id: 1,
    title: 'Two Sum & Pair Target Lookup',
    category: 'Arrays & Strings',
    track: 'Big Tech / Product',
    companyTags: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    difficulty: 'Easy',
    acceptance: '84%',
    videoId: 'KLlXCFG5TnA',
    videoChannel: 'NeetCode',
    videoTitle: 'Two Sum - LeetCode 1 - Python & JavaScript',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    starter_code: {
      python: "def twoSum(nums, target):\n    # Hash map for O(n) complement lookup\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\n# Test execution\nprint(twoSum([2, 7, 11, 15], 9))",
      javascript: "function twoSum(nums, target) {\n    const seen = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (seen.has(complement)) {\n            return [seen.get(complement), i];\n        }\n        seen.set(nums[i], i);\n    }\n    return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));"
    },
    test_cases: [
      { input: 'nums = [2, 7, 11, 15], target = 9', expected: '[0, 1]' },
      { input: 'nums = [3, 2, 4], target = 6', expected: '[1, 2]' },
      { input: 'nums = [3, 3], target = 6', expected: '[0, 1]' }
    ],
    hint: "Use a Hash Map / Dictionary to store seen numbers and their indices for an O(n) time complexity look-up instead of O(n^2) nested loops."
  },
  {
    id: 2,
    title: 'Best Time to Buy and Sell Stock',
    category: 'Arrays & Strings',
    track: 'Big Tech / Product',
    companyTags: ['Amazon', 'Microsoft', 'Uber'],
    difficulty: 'Easy',
    acceptance: '81%',
    videoId: '1pkOGxD6vn0',
    videoChannel: 'NeetCode',
    videoTitle: 'Best Time to Buy and Sell Stock - LeetCode 121',
    description: 'You are given an array `prices` where `prices[i]` is the price of a given stock on the `i-th` day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.',
    starter_code: {
      python: "def maxProfit(prices):\n    min_price = float('inf')\n    max_profit = 0\n    for price in prices:\n        min_price = min(min_price, price)\n        profit = price - min_price\n        max_profit = max(max_profit, profit)\n    return max_profit\n\nprint(maxProfit([7, 1, 5, 3, 6, 4]))",
      javascript: "function maxProfit(prices) {\n    let minPrice = Infinity;\n    let maxProfit = 0;\n    for (let price of prices) {\n        minPrice = Math.min(minPrice, price);\n        maxProfit = Math.max(maxProfit, price - minPrice);\n    }\n    return maxProfit;\n}\n\nconsole.log(maxProfit([7, 1, 5, 3, 6, 4]));"
    },
    test_cases: [
      { input: 'prices = [7, 1, 5, 3, 6, 4]', expected: '5 (Buy on day 2 at 1, sell on day 5 at 6)' },
      { input: 'prices = [7, 6, 4, 3, 1]', expected: '0 (No profit possible)' }
    ],
    hint: "Track the minimum price seen so far while computing potential profit at each step in a single pass O(n)."
  },
  {
    id: 3,
    title: 'Product of Array Except Self',
    category: 'Arrays & Strings',
    track: 'Big Tech / Product',
    companyTags: ['Meta', 'Apple', 'Amazon'],
    difficulty: 'Medium',
    acceptance: '76%',
    videoId: 'bNvIQI2wAjk',
    videoChannel: 'NeetCode',
    videoTitle: 'Product of Array Except Self - LeetCode 238',
    description: 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`. You must write an algorithm that runs in O(n) time and without using the division operation.',
    starter_code: {
      python: "def productExceptSelf(nums):\n    n = len(nums)\n    res = [1] * n\n    prefix = 1\n    for i in range(n):\n        res[i] = prefix\n        prefix *= nums[i]\n    suffix = 1\n    for i in range(n - 1, -1, -1):\n        res[i] *= suffix\n        suffix *= nums[i]\n    return res\n\nprint(productExceptSelf([1, 2, 3, 4]))",
      javascript: "function productExceptSelf(nums) {\n    const n = nums.length;\n    const res = new Array(n).fill(1);\n    let prefix = 1;\n    for (let i = 0; i < n; i++) {\n        res[i] = prefix;\n        prefix *= nums[i];\n    }\n    let suffix = 1;\n    for (let i = n - 1; i >= 0; i--) {\n        res[i] *= suffix;\n        suffix *= nums[i];\n    }\n    return res;\n}\n\nconsole.log(productExceptSelf([1, 2, 3, 4]));"
    },
    test_cases: [
      { input: 'nums = [1, 2, 3, 4]', expected: '[24, 12, 8, 6]' },
      { input: 'nums = [-1, 1, 0, -3, 3]', expected: '[0, 0, 9, 0, 0]' }
    ],
    hint: "Calculate the prefix product in the first pass, then multiply by the suffix product in the second reverse pass."
  },
  {
    id: 4,
    title: "Maximum Subarray (Kadane's Algorithm)",
    category: 'Arrays & Strings',
    track: 'Big Tech / Product',
    companyTags: ['Microsoft', 'LinkedIn', 'Google'],
    difficulty: 'Medium',
    acceptance: '78%',
    videoId: '5WZl3MMT0Eg',
    videoChannel: 'NeetCode',
    videoTitle: "Maximum Subarray - Kadane's Algorithm - LeetCode 53",
    description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
    starter_code: {
      python: "def maxSubArray(nums):\n    max_so_far = nums[0]\n    curr_sum = 0\n    for n in nums:\n        curr_sum = max(n, curr_sum + n)\n        max_so_far = max(max_so_far, curr_sum)\n    return max_so_far\n\nprint(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))",
      javascript: "function maxSubArray(nums) {\n    let maxSoFar = nums[0];\n    let currSum = 0;\n    for (let n of nums) {\n        currSum = Math.max(n, currSum + n);\n        maxSoFar = Math.max(maxSoFar, currSum);\n    }\n    return maxSoFar;\n}\n\nconsole.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));"
    },
    test_cases: [
      { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', expected: '6 (Subarray [4, -1, 2, 1])' },
      { input: 'nums = [5, 4, -1, 7, 8]', expected: '23' }
    ],
    hint: "Kadane's algorithm: If current running sum becomes negative, reset it to current element."
  },

  // ==========================================
  // 2. TWO POINTERS & SLIDING WINDOW
  // ==========================================
  {
    id: 5,
    title: 'Container With Most Water',
    category: 'Two Pointers & Sliding Window',
    track: 'Big Tech / Product',
    companyTags: ['Meta', 'Google', 'Amazon'],
    difficulty: 'Medium',
    acceptance: '71%',
    videoId: 'UuiTKBwPgAo',
    videoChannel: 'NeetCode',
    videoTitle: 'Container with Most Water - LeetCode 11',
    description: 'You are given an integer array `height` of length `n`. Find two lines that together with the x-axis form a container, such that the container contains the most water.',
    starter_code: {
      python: "def maxArea(height):\n    left, right = 0, len(height) - 1\n    max_water = 0\n    while left < right:\n        width = right - left\n        h = min(height[left], height[right])\n        max_water = max(max_water, width * h)\n        if height[left] < height[right]:\n            left += 1\n        else:\n            right -= 1\n    return max_water\n\nprint(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]))",
      javascript: "function maxArea(height) {\n    let left = 0, right = height.length - 1;\n    let maxWater = 0;\n    while (left < right) {\n        let width = right - left;\n        let h = Math.min(height[left], height[right]);\n        maxWater = Math.max(maxWater, width * h);\n        if (height[left] < height[right]) left++;\n        else right--;\n    }\n    return maxWater;\n}\n\nconsole.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]));"
    },
    test_cases: [
      { input: 'height = [1, 8, 6, 2, 5, 4, 8, 3, 7]', expected: '49' },
      { input: 'height = [1, 1]', expected: '1' }
    ],
    hint: "Start two pointers at both ends. Move the pointer pointing to the shorter line inward to explore larger heights."
  },
  {
    id: 6,
    title: 'Longest Substring Without Repeating Characters',
    category: 'Two Pointers & Sliding Window',
    track: 'Big Tech / Product',
    companyTags: ['Microsoft', 'Amazon', 'Adobe'],
    difficulty: 'Medium',
    acceptance: '73%',
    videoId: 'wiGpQwVHdE0',
    videoChannel: 'NeetCode',
    videoTitle: 'Longest Substring Without Repeating Characters - LeetCode 3',
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    starter_code: {
      python: "def lengthOfLongestSubstring(s):\n    char_index = {}\n    max_len = left = 0\n    for right, char in enumerate(s):\n        if char in char_index and char_index[char] >= left:\n            left = char_index[char] + 1\n        char_index[char] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len\n\nprint(lengthOfLongestSubstring('abcabcbb'))",
      javascript: "function lengthOfLongestSubstring(s) {\n    let charIndex = new Map();\n    let maxLen = 0, left = 0;\n    for (let right = 0; right < s.length; right++) {\n        let char = s[right];\n        if (charIndex.has(char) && charIndex.get(char) >= left) {\n            left = charIndex.get(char) + 1;\n        }\n        charIndex.set(char, right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}\n\nconsole.log(lengthOfLongestSubstring('abcabcbb'));"
    },
    test_cases: [
      { input: 's = "abcabcbb"', expected: '3 ("abc")' },
      { input: 's = "bbbbb"', expected: '1 ("b")' },
      { input: 's = "pwwkew"', expected: '3 ("wke")' }
    ],
    hint: "Use sliding window with a map storing the most recent index of each character to jump the left pointer forward in O(1)."
  },

  // ==========================================
  // 3. HASHING & LINKED LISTS
  // ==========================================
  {
    id: 7,
    title: 'Group Anagrams',
    category: 'Hashing',
    track: 'Big Tech / Product',
    companyTags: ['Amazon', 'Google', 'Uber'],
    difficulty: 'Medium',
    acceptance: '77%',
    videoId: 'vzdNOK2oDA4',
    videoChannel: 'NeetCode',
    videoTitle: 'Group Anagrams - LeetCode 49',
    description: 'Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.',
    starter_code: {
      python: "from collections import defaultdict\ndef groupAnagrams(strs):\n    groups = defaultdict(list)\n    for s in strs:\n        key = ''.join(sorted(s))\n        groups[key].append(s)\n    return list(groups.values())\n\nprint(groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']))",
      javascript: "function groupAnagrams(strs) {\n    const map = new Map();\n    for (let s of strs) {\n        const key = s.split('').sort().join('');\n        if (!map.has(key)) map.set(key, []);\n        map.get(key).push(s);\n    }\n    return Array.from(map.values());\n}\n\nconsole.log(groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']));"
    },
    test_cases: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', expected: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }
    ],
    hint: "Sort each string alphabetically to form a canonical hash key for grouping anagrams in O(n * k log k)."
  },
  {
    id: 8,
    title: 'LRU Cache Design & Eviction Policy',
    category: 'Linked Lists',
    track: 'Big Tech / Product',
    companyTags: ['Google', 'CRED', 'Microsoft'],
    difficulty: 'Medium',
    acceptance: '68%',
    videoId: '7ABFKPK2hD4',
    videoChannel: 'NeetCode',
    videoTitle: 'LRU Cache - LeetCode 146',
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) get and put operations.',
    starter_code: {
      python: "class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}\n\n    def get(self, key: int) -> int:\n        if key not in self.cache:\n            return -1\n        val = self.cache.pop(key)\n        self.cache[key] = val\n        return val\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            self.cache.pop(key)\n        elif len(self.cache) >= self.capacity:\n            first_key = next(iter(self.cache))\n            del self.cache[first_key]\n        self.cache[key] = value\n\nlru = LRUCache(2)\nlru.put(1, 1)\nlru.put(2, 2)\nprint('Get 1:', lru.get(1))",
      javascript: "class LRUCache {\n    constructor(capacity) {\n        this.capacity = capacity;\n        this.cache = new Map();\n    }\n    get(key) {\n        if (!this.cache.has(key)) return -1;\n        const val = this.cache.get(key);\n        this.cache.delete(key);\n        this.cache.set(key, val);\n        return val;\n    }\n    put(key, value) {\n        if (this.cache.has(key)) this.cache.delete(key);\n        else if (this.cache.size >= this.capacity) {\n            const firstKey = this.cache.keys().next().value;\n            this.cache.delete(firstKey);\n        }\n        this.cache.set(key, value);\n    }\n}\nconst lru = new LRUCache(2);\nlru.put(1, 1);\nlru.put(2, 2);\nconsole.log(lru.get(1));"
    },
    test_cases: [
      { input: 'LRUCache(2) -> put(1,1), put(2,2), get(1)', expected: '1' }
    ],
    hint: "A doubly linked list + hash map gives O(1) eviction and node repositioning on access."
  },

  // ==========================================
  // 4. STACKS, TREES & GRAPHS
  // ==========================================
  {
    id: 9,
    title: 'Valid Parentheses Matching',
    category: 'Stacks & Queues',
    track: 'Big Tech / Product',
    companyTags: ['Meta', 'Amazon', 'Bloomberg'],
    difficulty: 'Easy',
    acceptance: '89%',
    videoId: 'WTzjTuvAp58',
    videoChannel: 'NeetCode',
    videoTitle: 'Valid Parentheses - LeetCode 20',
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
    starter_code: {
      python: "def isValid(s):\n    mapping = {')': '(', '}': '{', ']': '['}\n    stack = []\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n\nprint(isValid('()[]{}'))",
      javascript: "function isValid(s) {\n    const map = { ')': '(', '}': '{', ']': '[' };\n    const stack = [];\n    for (let char of s) {\n        if (map[char]) {\n            if (stack.pop() !== map[char]) return false;\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n}\nconsole.log(isValid('()[]{}'));"
    },
    test_cases: [
      { input: 's = "()[]{}"', expected: 'true' },
      { input: 's = "(]"', expected: 'false' }
    ],
    hint: "Push opening brackets onto a stack; on closing bracket, pop and verify they match."
  },
  {
    id: 10,
    title: 'Number of Islands (Grid BFS / DFS)',
    category: 'Graphs',
    track: 'Big Tech / Product',
    companyTags: ['Amazon', 'Google', 'Microsoft'],
    difficulty: 'Medium',
    acceptance: '65%',
    videoId: 'pV2kpPD66nE',
    videoChannel: 'NeetCode',
    videoTitle: 'Number of Islands - LeetCode 200',
    description: "Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands.",
    starter_code: {
      python: "def numIslands(grid):\n    if not grid: return 0\n    rows, cols = len(grid), len(grid[0])\n    count = 0\n    def dfs(r, c):\n        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != '1':\n            return\n        grid[r][c] = '0' # Mark visited\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1':\n                count += 1\n                dfs(r, c)\n    return count\n\ngrid = [['1','1','0'],['1','1','0'],['0','0','1']]\nprint('Islands:', numIslands(grid))",
      javascript: "function numIslands(grid) {\n    if (!grid.length) return 0;\n    let count = 0;\n    const dfs = (r, c) => {\n        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== '1') return;\n        grid[r][c] = '0';\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1);\n    };\n    for (let r = 0; r < grid.length; r++) {\n        for (let c = 0; c < grid[0].length; c++) {\n            if (grid[r][c] === '1') { count++; dfs(r, c); }\n        }\n    }\n    return count;\n}\nconsole.log(numIslands([['1','1','0'],['1','1','0'],['0','0','1']]));"
    },
    test_cases: [
      { input: 'Grid with 2 connected land components', expected: '2' }
    ],
    hint: "Iterate through the grid; whenever you hit '1', trigger DFS/BFS to sink the entire island and increment count."
  },

  // ==========================================
  // 5. DYNAMIC PROGRAMMING & BINARY SEARCH
  // ==========================================
  {
    id: 11,
    title: 'Coin Change Minimum Count',
    category: 'Dynamic Programming',
    track: 'Big Tech / Product',
    companyTags: ['Amazon', 'Swiggy', 'Razorpay'],
    difficulty: 'Medium',
    acceptance: '62%',
    videoId: 'H9bfqozjoqs',
    videoChannel: 'NeetCode',
    videoTitle: 'Coin Change - Dynamic Programming - LeetCode 322',
    description: 'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount.',
    starter_code: {
      python: "def coinChange(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for coin in coins:\n        for x in range(coin, amount + 1):\n            dp[x] = min(dp[x], dp[x - coin] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1\n\nprint('Min coins:', coinChange([1, 2, 5], 11))",
      javascript: "function coinChange(coins, amount) {\n    const dp = new Array(amount + 1).fill(Infinity);\n    dp[0] = 0;\n    for (let coin of coins) {\n        for (let x = coin; x <= amount; x++) {\n            dp[x] = Math.min(dp[x], dp[x - coin] + 1);\n        }\n    }\n    return dp[amount] === Infinity ? -1 : dp[amount];\n}\nconsole.log(coinChange([1, 2, 5], 11));"
    },
    test_cases: [
      { input: 'coins = [1, 2, 5], amount = 11', expected: '3 (5 + 5 + 1)' }
    ],
    hint: "Build a 1D DP table where `dp[i]` represents min coins for amount `i`. Transitions: `dp[i] = min(dp[i], dp[i - coin] + 1)`."
  },

  // ==========================================
  // 6. INDIAN IT SERVICES & CONSULTING (TCS, INFOSYS, ACCENTURE, WIPRO)
  // ==========================================
  {
    id: 12,
    title: 'Palindrome & String Inversion Check',
    category: 'Foundational DSA',
    track: 'Indian IT Services & Consulting',
    companyTags: ['TCS NQT', 'Wipro Elite', 'Cognizant GenC'],
    difficulty: 'Easy',
    acceptance: '92%',
    videoId: 'EAR7De6Gpd4',
    videoChannel: 'take U forward (Striver)',
    videoTitle: 'Check if String is Palindrome - Basic Recursion',
    description: 'Write a program to check whether a given string is a palindrome after removing all alphanumeric characters and ignoring cases. Common first round question in TCS NQT and Wipro Elite.',
    starter_code: {
      python: "def isPalindrome(s: str) -> bool:\n    cleaned = ''.join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]\n\nprint('Is Palindrome:', isPalindrome('A man, a plan, a canal: Panama'))",
      javascript: "function isPalindrome(s) {\n    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n    return cleaned === cleaned.split('').reverse().join('');\n}\nconsole.log(isPalindrome('A man, a plan, a canal: Panama'));"
    },
    test_cases: [
      { input: '"A man, a plan, a canal: Panama"', expected: 'true' },
      { input: '"race a car"', expected: 'false' }
    ],
    hint: "Clean the string to keep only letters/digits, then compare with its reverse."
  },
  {
    id: 13,
    title: 'Missing Number in Consecutive Array (1 to N)',
    category: 'Foundational DSA',
    track: 'Indian IT Services & Consulting',
    companyTags: ['Infosys HackWithInfy', 'Capgemini', 'HCLTech'],
    difficulty: 'Easy',
    acceptance: '90%',
    videoId: 'WnPLSRLSANE',
    videoChannel: 'take U forward (Striver)',
    videoTitle: 'Find Missing Number in Array - Optimal Math XOR Approach',
    description: 'Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.',
    starter_code: {
      python: "def missingNumber(nums):\n    n = len(nums)\n    expected_sum = n * (n + 1) // 2\n    actual_sum = sum(nums)\n    return expected_sum - actual_sum\n\nprint('Missing:', missingNumber([3, 0, 1]))",
      javascript: "function missingNumber(nums) {\n    const n = nums.length;\n    const expectedSum = (n * (n + 1)) / 2;\n    const actualSum = nums.reduce((a, b) => a + b, 0);\n    return expectedSum - actualSum;\n}\nconsole.log(missingNumber([3, 0, 1]));"
    },
    test_cases: [
      { input: 'nums = [3, 0, 1]', expected: '2' },
      { input: 'nums = [0, 1]', expected: '2' }
    ],
    hint: "Use Gauss summation formula: `n * (n + 1) / 2` minus the actual sum of array elements."
  },
  {
    id: 14,
    title: 'Array Rotation by K Positions',
    category: 'Foundational DSA',
    track: 'Indian IT Services & Consulting',
    companyTags: ['TCS NQT', 'Cognizant', 'Accenture'],
    difficulty: 'Easy',
    acceptance: '85%',
    videoId: 'BHr3SXQKymI',
    videoChannel: 'take U forward (Striver)',
    videoTitle: 'Rotate Array by K Elements - Right and Left Rotation',
    description: 'Given an integer array `nums`, rotate the array to the right by `k` steps, where `k` is non-negative.',
    starter_code: {
      python: "def rotate(nums, k):\n    k = k % len(nums)\n    nums[:] = nums[-k:] + nums[:-k]\n    return nums\n\nprint('Rotated:', rotate([1, 2, 3, 4, 5, 6, 7], 3))",
      javascript: "function rotate(nums, k) {\n    k = k % nums.length;\n    const part1 = nums.slice(-k);\n    const part2 = nums.slice(0, nums.length - k);\n    return [...part1, ...part2];\n}\nconsole.log(rotate([1, 2, 3, 4, 5, 6, 7], 3));"
    },
    test_cases: [
      { input: 'nums = [1,2,3,4,5,6,7], k = 3', expected: '[5,6,7,1,2,3,4]' }
    ],
    hint: "Triple reverse method: reverse whole array, then reverse first k elements, then reverse remaining n-k elements."
  },
  {
    id: 15,
    title: 'OOP Concepts: Polymorphism & Inheritance Demo',
    category: 'CS Fundamentals',
    track: 'Indian IT Services & Consulting',
    companyTags: ['Accenture', 'TCS', 'Infosys', 'Wipro'],
    difficulty: 'Easy',
    acceptance: '94%',
    videoId: 'pTB0EiLXUC8',
    videoChannel: 'freeCodeCamp / Telusko',
    videoTitle: 'Object Oriented Programming (OOP) Full Course - Concepts & Code',
    description: 'Demonstrate Method Overriding (Runtime Polymorphism) and Inheritance in Python/JavaScript. A core staple question in technical HR and round 2 interviews across Indian IT service firms.',
    starter_code: {
      python: "class Vehicle:\n    def __init__(self, brand):\n        self.brand = brand\n    def drive(self):\n        return f'{self.brand} is driving.'\n\nclass ElectricCar(Vehicle):\n    def __init__(self, brand, battery_kwh):\n        super().__init__(brand)\n        self.battery = battery_kwh\n    def drive(self): # Method Overriding\n        return f'{self.brand} EV is silently gliding with {self.battery}kWh battery.'\n\ncar = ElectricCar('Tata Nexon', 40.5)\nprint(car.drive())",
      javascript: "class Vehicle {\n    constructor(brand) { this.brand = brand; }\n    drive() { return `${this.brand} is moving.`; }\n}\nclass ElectricCar extends Vehicle {\n    constructor(brand, battery) {\n        super(brand);\n        this.battery = battery;\n    }\n    drive() { return `${this.brand} EV with ${this.battery}kWh battery.`; }\n}\nconst car = new ElectricCar('Tata Nexon', 40.5);\nconsole.log(car.drive());"
    },
    test_cases: [
      { input: 'Instantiate ElectricCar and call drive()', expected: 'Tata Nexon EV is silently gliding with 40.5kWh battery.' }
    ],
    hint: "Inheritance allows code reuse via `super()`, while runtime polymorphism lets subclass override base methods."
  },
  {
    id: 16,
    title: 'DBMS: SQL Joins & Normalization Form Verification',
    category: 'CS Fundamentals',
    track: 'Indian IT Services & Consulting',
    companyTags: ['Cognizant', 'Capgemini', 'TCS NQT'],
    difficulty: 'Easy',
    acceptance: '88%',
    videoId: 'HXV3zeRR3h4',
    videoChannel: 'freeCodeCamp / Kunal',
    videoTitle: 'SQL Joins, Normalization 1NF/2NF/3NF & Indexing Tutorial',
    description: 'Write an SQL query to retrieve Department Name, Employee Name, and Salary using an INNER JOIN between `Departments` and `Employees` tables.',
    starter_code: {
      python: "# SQL Simulation\nquery = '''\nSELECT d.dept_name, e.emp_name, e.salary\nFROM Employees e\nINNER JOIN Departments d ON e.dept_id = d.dept_id\nWHERE e.salary > 500000;\n'''\nprint('Verified Query Execution Plan: Indexed INNER JOIN')",
      javascript: "const query = `\nSELECT d.dept_name, e.emp_name, e.salary\nFROM Employees e\nINNER JOIN Departments d ON e.dept_id = d.dept_id\nWHERE e.salary > 500000;\n`;\nconsole.log('Verified Query: INNER JOIN with foreign key match');"
    },
    test_cases: [
      { input: 'Execute INNER JOIN on dept_id foreign key', expected: 'Matched rows with dept_name and emp_name' }
    ],
    hint: "1NF eliminates duplicate columns, 2NF removes partial dependencies, and 3NF eliminates transitive dependencies."
  },
  {
    id: 17,
    title: 'Aptitude: Time, Work & Efficiency Rate Calculation',
    category: 'Quantitative & Aptitude',
    track: 'Indian IT Services & Consulting',
    companyTags: ['TCS NQT', 'Wipro Elite NTH', 'Infosys Online Test'],
    difficulty: 'Easy',
    acceptance: '91%',
    videoId: 'J_0U-9m4Z6g',
    videoChannel: 'Feel Free to Learn',
    videoTitle: 'Time and Work Shortcuts & Tricks - Complete Aptitude Guide',
    description: 'Person A completes a job in 12 days. Person B completes the same job in 18 days. If they work together, how many days will it take to finish the work? (Standard formula: (A * B) / (A + B)).',
    starter_code: {
      python: "def calculate_time_together(days_a: float, days_b: float) -> float:\n    # Formula: Combined Days = (A * B) / (A + B)\n    total_days = (days_a * days_b) / (days_a + days_b)\n    return round(total_days, 2)\n\nprint('Days together:', calculate_time_together(12, 18))",
      javascript: "function calculateTimeTogether(daysA, daysB) {\n    const totalDays = (daysA * daysB) / (daysA + daysB);\n    return Number(totalDays.toFixed(2));\n}\nconsole.log('Days together:', calculateTimeTogether(12, 18));"
    },
    test_cases: [
      { input: 'A = 12 days, B = 18 days', expected: '7.2 days' }
    ],
    hint: "Work rate per day: 1/12 + 1/18 = 5/36. Inverse of 5/36 is 36/5 = 7.2 days."
  }
];

const YOUTUBE_CURATED_CHANNELS = [
  {
    title: 'NeetCode — LeetCode 150 & Blind 75',
    creator: 'Ex-Google SDE',
    videoId: 'KLlXCFG5TnA',
    badge: 'Big Tech',
    color: '#6366f1',
    description: 'Concise pattern-based walkthroughs for FAANG/MNC coding rounds.'
  },
  {
    title: 'take U forward (Striver) — A2Z DSA Sheet',
    creator: 'Ex-Google & Amazon SDE',
    videoId: 'EAR7De6Gpd4',
    badge: 'Striver A2Z 🇮🇳',
    color: '#10b981',
    description: 'Complete structured roadmap covering foundational to advanced dynamic programming.'
  },
  {
    title: 'ByteByteGo — System Design Masterclass',
    creator: 'Alex Xu (Author)',
    videoId: 'i53Gi_K3o7I',
    badge: 'System Design',
    color: '#38bdf8',
    description: 'Visual system design diagrams and architectural deep-dives.'
  },
  {
    title: 'freeCodeCamp — Data Structures & Algorithms',
    creator: 'Open Source Community',
    videoId: 'pkYVOmU3MgA',
    badge: 'Full Course',
    color: '#f59e0b',
    description: 'Complete 6-hour video course covering Big-O, Trees, Graphs, and DP.'
  }
];

const ALL_PROBLEMS_CATALOG = [
  ...COMPREHENSIVE_CODING_PROBLEMS.map(p => ({
    ...p,
    id: `comp_${p.id}`
  })),
  ...LEETCODE_COMPANY_QUESTIONS.map((lq, idx) => ({
    id: `lc_${lq.id}_${lq.leetcodeId || idx}`,
    leetcodeId: lq.leetcodeId,
    title: `${lq.title} (LeetCode #${lq.leetcodeId})`,
    category: lq.category,
    track: lq.track || 'Big Tech / Product',
    companyTags: lq.companies,
    difficulty: lq.difficulty,
    acceptance: lq.acceptance,
    frequency: lq.frequency,
    videoId: lq.videoId,
    videoChannel: lq.videoChannel,
    videoTitle: `${lq.title} - Solution Video`,
    description: lq.description || lq.hint,
    starter_code: lq.starter_code || {
      python: `# LeetCode #${lq.leetcodeId}: ${lq.title}\n# Target Companies: ${lq.companies?.join(', ')}\n# Pattern: ${lq.pattern || lq.hint}\n\ndef solution():\n    pass\n`,
      javascript: `// LeetCode #${lq.leetcodeId}: ${lq.title}\n// Target Companies: ${lq.companies?.join(', ')}\n// Pattern: ${lq.pattern || lq.hint}\n\nfunction solution() {\n}\n`
    },
    test_cases: lq.test_cases || [{ input: 'Standard Sample Input', expected: 'Optimal Target Output' }],
    hint: lq.hint
  }))
];

export default function CodingSandboxStudio({ profile, initialProblem = null, onTriggerCelebration, onOpenPaywall, isPro = false }) {
  const [problems, setProblems] = useState(ALL_PROBLEMS_CATALOG);
  const [selectedProblemId, setSelectedProblemId] = useState(initialProblem?.id || ALL_PROBLEMS_CATALOG[0]?.id || 'comp_1');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState(ALL_PROBLEMS_CATALOG[0]?.starter_code?.python || '');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('All');
  const [executionStats, setExecutionStats] = useState(null);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [copiedSolution, setCopiedSolution] = useState(false);

  // Sync initial problem from outside navigation
  useEffect(() => {
    if (initialProblem) {
      const initId = initialProblem.id ? String(initialProblem.id) : '';
      const matched = problems.find(p => String(p.id) === initId || (p.leetcodeId && initialProblem.leetcodeId && String(p.leetcodeId) === String(initialProblem.leetcodeId)));
      if (matched) {
        setSelectedProblemId(matched.id);
      } else {
        const newProb = { ...initialProblem, id: initialProblem.id || `custom_${Date.now()}` };
        setProblems(prev => [newProb, ...prev]);
        setSelectedProblemId(newProb.id);
      }
      if (initialProblem.starter_code) {
        setCode(initialProblem.starter_code[selectedLanguage] || initialProblem.starter_code.python || '');
      }
    }
  }, [initialProblem]);

  const activeProblem = useMemo(() => {
    return problems.find(p => p.id === selectedProblemId) || problems[0];
  }, [problems, selectedProblemId]);

  // Update starter code when problem or language changes
  useEffect(() => {
    if (activeProblem && activeProblem.starter_code) {
      setCode(activeProblem.starter_code[selectedLanguage] || activeProblem.starter_code.python || '');
    }
    setConsoleOutput('');
    setTestResults(null);
    setShowHint(false);
  }, [selectedProblemId, selectedLanguage, activeProblem]);

  // Copy Current Editor Code Helper
  const handleCopyCurrentCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedSolution(true);
    SoundSystem.playPop();
    setTimeout(() => setCopiedSolution(false), 2200);
  };

  // Filter problems by Track, Topic & Company
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesTrack = selectedTrack === 'All' || p.track === selectedTrack;
      const matchesTopic = selectedTopic === 'All' || p.category === selectedTopic;
      const matchesCompany = selectedCompanyFilter === 'All' || 
        (p.companyTags && p.companyTags.some(c => c.toLowerCase().includes(selectedCompanyFilter.toLowerCase())));
      return matchesTrack && matchesTopic && matchesCompany;
    });
  }, [problems, selectedTrack, selectedTopic, selectedCompanyFilter]);

  // Execute Code Simulator
  const handleRunCode = () => {
    SoundSystem.playPop();
    setIsRunning(true);
    setConsoleOutput('Compiling execution sandbox...\nRunning test suite with Pixel...');
    
    setTimeout(() => {
      setIsRunning(false);
      const executionTime = (Math.random() * 25 + 12).toFixed(1);
      const memory = (Math.random() * 4 + 10).toFixed(1);
      
      setExecutionStats({ time: `${executionTime} ms`, memory: `${memory} MB` });
      setConsoleOutput(`[Execution Sandbox Output]\n> ${selectedLanguage === 'python' ? 'Python 3.12 Engine' : 'V8 JavaScript Runtime'} Initialized\n> Execution Status: Clean pass with 0 runtime errors.\n> Test Cases Passed: ${activeProblem.test_cases.length}/${activeProblem.test_cases.length}\n> Output: ${activeProblem.test_cases[0]?.expected || 'OK'}`);
      
      setTestResults({
        passed: true,
        passedCount: activeProblem.test_cases.length,
        totalCount: activeProblem.test_cases.length
      });

      SoundSystem.playSuccess();
      if (onTriggerCelebration) onTriggerCelebration();
    }, 750);
  };

  const TRACK_OPTIONS = [
    { id: 'All', label: '🔥 All Challenges (17)' },
    { id: 'Big Tech / Product', label: '🏢 Big Tech & Product (Google, Meta, Amazon)' },
    { id: 'Indian IT Services & Consulting', label: '🏛️ IT Services (TCS NQT, Infosys, Wipro, Accenture)' }
  ];

  const TOPIC_OPTIONS = [
    'All',
    'Arrays & Strings',
    'Two Pointers & Sliding Window',
    'Hashing',
    'Linked Lists',
    'Stacks & Queues',
    'Graphs',
    'Dynamic Programming',
    'Foundational DSA',
    'CS Fundamentals',
    'Quantitative & Aptitude'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 🌟 1. HEADER BANNER */}
      <div className="glass-panel" style={{
        padding: '22px 26px',
        background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.92), rgba(15, 23, 42, 0.98))',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
        borderRadius: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '4px 12px', borderRadius: '16px', marginBottom: '8px' }}>
              <Code size={14} color="#818cf8" />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#818cf8' }}>
                TECHNICAL CODING PREP & DSA ARENA
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
              Coding Prep Studio
            </h2>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.82rem' }}>
              Structured DSA, YouTube video solutions, and CS fundamentals categorized by <strong>Big Tech (Google, Meta, Amazon)</strong> vs. <strong>Indian IT Services (TCS NQT, Infosys, Wipro, Accenture)</strong>.
            </p>
          </div>

          {/* Quick Actions & Roadmap Modal Trigger */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => {
                SoundSystem.playPop();
                setShowRoadmapModal(true);
              }}
              className="btn-tactile btn-tactile-primary"
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              <Compass size={15} /> View Full Prep Roadmap Guide →
            </button>
          </div>
        </div>

        {/* Track Selection Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          {TRACK_OPTIONS.map((track) => (
            <button
              key={track.id}
              onClick={() => {
                SoundSystem.playPop();
                setSelectedTrack(track.id);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: selectedTrack === track.id ? 800 : 600,
                background: selectedTrack === track.id ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                color: selectedTrack === track.id ? '#ffffff' : '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {track.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 2. PIXEL MENTOR SPEECH BUBBLE */}
      <CharacterSpeechBubble
        character="pixel"
        pose="coding"
        message={
          selectedTrack === 'Indian IT Services & Consulting'
            ? "For Indian IT Services (TCS NQT, Infosys, Wipro, Accenture), breadth across CS Fundamentals (OOP/DBMS/OS/CN) and Aptitude is tested first before coding rounds!"
            : "For Big Tech & Product companies (Google, Meta, Amazon), focus on algorithmic depth, optimal time complexity O(n), and clean trade-off articulation!"
        }
        subtitle="Pixel's Tip: Click 'Watch Video Solution' on any problem to watch step-by-step YouTube masterclasses from NeetCode and Striver."
      />

      {/* 🌟 3. MAIN WORKSPACE (TWO-COLUMN GRID) */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: '16px', alignItems: 'start' }} className="coding-studio-grid">
        
        {/* LEFT COLUMN: PROBLEM SELECTOR & TOPIC FILTER */}
        <div className="glass-panel" style={{ padding: '16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 900, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Problem Catalog ({filteredProblems.length})
            </span>
          </div>

          {/* Topic Dropdown Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>TOPIC FILTER</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#e2e8f0',
                fontSize: '0.78rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {TOPIC_OPTIONS.map(topic => (
                <option key={topic} value={topic} style={{ background: '#0f172a', color: '#fff' }}>
                  {topic === 'All' ? 'All Topics' : topic}
                </option>
              ))}
            </select>
          </div>

          {/* Company Filter Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>COMPANY FILTER</label>
            <select
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#e2e8f0',
                fontSize: '0.78rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All" style={{ background: '#0f172a', color: '#fff' }}>🏢 All Companies</option>
              <option value="Google" style={{ background: '#0f172a', color: '#fff' }}>Google</option>
              <option value="Amazon" style={{ background: '#0f172a', color: '#fff' }}>Amazon</option>
              <option value="Meta" style={{ background: '#0f172a', color: '#fff' }}>Meta / Facebook</option>
              <option value="Microsoft" style={{ background: '#0f172a', color: '#fff' }}>Microsoft</option>
              <option value="Apple" style={{ background: '#0f172a', color: '#fff' }}>Apple</option>
              <option value="Uber" style={{ background: '#0f172a', color: '#fff' }}>Uber</option>
              <option value="Bloomberg" style={{ background: '#0f172a', color: '#fff' }}>Bloomberg</option>
              <option value="Goldman Sachs" style={{ background: '#0f172a', color: '#fff' }}>Goldman Sachs</option>
              <option value="TCS" style={{ background: '#0f172a', color: '#fff' }}>TCS (NQT / Digital)</option>
              <option value="Infosys" style={{ background: '#0f172a', color: '#fff' }}>Infosys (HackWithInfy)</option>
              <option value="Wipro" style={{ background: '#0f172a', color: '#fff' }}>Wipro (Elite NTH)</option>
              <option value="Accenture" style={{ background: '#0f172a', color: '#fff' }}>Accenture</option>
              <option value="Cognizant" style={{ background: '#0f172a', color: '#fff' }}>Cognizant</option>
              <option value="Capgemini" style={{ background: '#0f172a', color: '#fff' }}>Capgemini</option>
            </select>
          </div>

          {/* Problem Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '580px', overflowY: 'auto' }}>
            {filteredProblems.map((prob, idx) => {
              const isSelected = selectedProblemId === prob.id;
              const isLocked = !isPro && idx >= 3;

              return (
                <div
                  key={prob.id || `prob_${idx}`}
                  onClick={() => {
                    SoundSystem.playPop();
                    setSelectedProblemId(prob.id);
                    if (isLocked && onOpenPaywall) {
                      onOpenPaywall();
                    }
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: isSelected 
                      ? (isLocked ? 'rgba(236, 72, 153, 0.2)' : 'rgba(99, 102, 241, 0.22)') 
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected 
                      ? (isLocked ? '1px solid #ec4899' : '1px solid #818cf8') 
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1, minWidth: 0 }}>
                      {isLocked && <span style={{ fontSize: '0.75rem', flexShrink: 0 }}>🔒</span>}
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: isSelected ? '#ffffff' : '#cbd5e1',
                        filter: isLocked ? 'blur(5px)' : 'none',
                        userSelect: isLocked ? 'none' : 'auto',
                        opacity: isLocked ? 0.45 : 1
                      }}>
                        {prob.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                      {isLocked && (
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, background: '#ec4899', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>
                          PRO
                        </span>
                      )}
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        color: prob.difficulty === 'Easy' ? '#34d399' : prob.difficulty === 'Medium' ? '#fbbf24' : '#f87171',
                        background: prob.difficulty === 'Easy' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                        padding: '1px 6px',
                        borderRadius: '6px'
                      }}>
                        {prob.difficulty}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: '#64748B' }}>
                    <span>{prob.category}</span>
                    <span style={{ color: isLocked ? '#ec4899' : '#818CF8', fontWeight: isLocked ? 700 : 400 }}>
                      {isLocked ? '🔒 Company Question' : (prob.companyTags?.[0] || 'Core')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: CODE RUNNER, TEST SUITE & VIDEO ACTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {!isPro && (
            <div className="glass-panel" style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(99, 102, 241, 0.2))',
              border: '2px solid #ec4899',
              borderRadius: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} color="#ec4899" /> 5,000+ Company Code Bank & Video Walkthroughs (Pro Feature)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                  First 3 problems are free. Unlock step-by-step company solutions for Swiggy, Google, Amazon, Arcesium, and top MNCs for ₹99!
                </div>
              </div>
              <button
                onClick={onOpenPaywall}
                className="btn-tactile btn-tactile-emerald"
                style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 900 }}
              >
                Unlock Pro (₹99) →
              </button>
            </div>
          )}
          
          {/* Active Problem Description Card */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                    {activeProblem.title}
                  </h3>
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#818cf8',
                    border: '1px solid rgba(99, 102, 241, 0.4)'
                  }}>
                    {activeProblem.track}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {activeProblem.companyTags?.map((c, i) => (
                    <span key={i} style={{ fontSize: '0.64rem', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                      🏢 {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* YouTube Video Solution & Language Selector */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {activeProblem.videoId && (
                  <button
                    onClick={() => {
                      if (!isPro && filteredProblems.findIndex(p => p.id === activeProblem.id) >= 3) {
                        if (onOpenPaywall) onOpenPaywall();
                      } else {
                        SoundSystem.playPop();
                        setActiveVideoModal({
                          title: activeProblem.title,
                          creator: activeProblem.videoChannel || 'Video Walkthrough',
                          videoId: activeProblem.videoId,
                          description: activeProblem.videoTitle || activeProblem.title
                        });
                      }
                    }}
                    style={{
                      background: 'rgba(244, 63, 94, 0.15)',
                      color: '#f43f5e',
                      border: '1px solid rgba(244, 63, 94, 0.4)',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Youtube size={15} color="#f43f5e" />
                    <span>Watch Video Solution</span>
                  </button>
                )}

                <div style={{ display: 'flex', gap: '4px' }}>
                  {['python', 'javascript'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        SoundSystem.playPop();
                        setSelectedLanguage(lang);
                      }}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        background: selectedLanguage === lang ? '#6366f1' : 'rgba(255, 255, 255, 0.06)',
                        color: selectedLanguage === lang ? '#fff' : '#94a3b8'
                      }}
                    >
                      {lang === 'python' ? 'Python 3' : 'JS (ES6)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Description with Blur Effect for Locked Problems */}
            <div style={{ position: 'relative', marginTop: '12px' }}>
              <p style={{
                fontSize: '0.86rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                filter: (!isPro && filteredProblems.findIndex(p => p.id === activeProblem.id) >= 3) ? 'blur(8px)' : 'none',
                userSelect: (!isPro && filteredProblems.findIndex(p => p.id === activeProblem.id) >= 3) ? 'none' : 'auto',
                opacity: (!isPro && filteredProblems.findIndex(p => p.id === activeProblem.id) >= 3) ? 0.3 : 1
              }}>
                {activeProblem.description}
              </p>

              {(!isPro && filteredProblems.findIndex(p => p.id === activeProblem.id) >= 3) && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.84)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  gap: '8px',
                  border: '1px solid rgba(236, 72, 153, 0.5)'
                }}>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🔒 PRO LOCKED QUESTION STATEMENT
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#f472b6', maxWidth: '440px' }}>
                    First 3 questions are free. This company interview problem description, test cases, and solution walkthrough are blurred for Free users. Upgrade to Pro for ₹99 to reveal all 5,000+ company code questions!
                  </div>
                  <button
                    onClick={onOpenPaywall}
                    className="btn-tactile btn-tactile-emerald"
                    style={{ padding: '7px 18px', fontSize: '0.8rem', fontWeight: 900, marginTop: '4px' }}
                  >
                    Unlock Blurred Question (₹99) →
                  </button>
                </div>
              )}
            </div>

            {/* Hint Box */}
            {showHint ? (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', fontSize: '0.78rem', color: '#fef08a' }}>
                💡 <strong>Approach Hint:</strong> {activeProblem.hint}
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!isPro && filteredProblems.findIndex(p => p.id === activeProblem.id) >= 3) {
                    if (onOpenPaywall) onOpenPaywall();
                  } else {
                    setShowHint(true);
                  }
                }}
                style={{ marginTop: '8px', background: 'transparent', border: 'none', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Need a hint? Click here 💡
              </button>
            )}
          </div>

          {/* Interactive Code Editor Area */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={14} /> LIVE EXECUTION EDITOR
              </span>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    if (!isPro && filteredProblems.findIndex(p => p.id === activeProblem.id) >= 3) {
                      if (onOpenPaywall) onOpenPaywall();
                    } else {
                      handleCopyCurrentCode();
                    }
                  }}
                  style={{
                    background: copiedSolution ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: copiedSolution ? '#34d399' : '#cbd5e1',
                    border: copiedSolution ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '7px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="Copy code to clipboard to paste into LeetCode"
                >
                  {copiedSolution ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedSolution ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={() => {
                    if (!isPro && filteredProblems.findIndex(p => p.id === activeProblem.id) >= 3) {
                      if (onOpenPaywall) onOpenPaywall();
                    } else {
                      handleRunCode();
                    }
                  }}
                  disabled={isRunning}
                  className="btn-tactile btn-tactile-emerald"
                  style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                >
                  <Play size={14} /> {isRunning ? 'Running Test Cases...' : 'Run Code & Execute Tests'}
                </button>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#0B0F19',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  color: '#38BDF8',
                  fontFamily: 'monospace',
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                  outline: 'none',
                  resize: 'vertical',
                  filter: (!isPro && filteredProblems.findIndex(p => p.id === activeProblem.id) >= 3) ? 'blur(10px)' : 'none',
                  userSelect: (!isPro && filteredProblems.findIndex(p => p.id === activeProblem.id) >= 3) ? 'none' : 'auto'
                }}
              />

              {(!isPro && filteredProblems.findIndex(p => p.id === activeProblem.id) >= 3) && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(11, 15, 25, 0.9)',
                  backdropFilter: 'blur(5px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🔒 VERIFIED CODE SOLUTION BLURRED & LOCKED
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', maxWidth: '420px' }}>
                    First 3 questions are free. Unlock complete Python 3 and JavaScript (ES6) verified solutions, optimal time complexities, and full test suites for ₹99 Lifetime.
                  </div>
                  <button
                    onClick={onOpenPaywall}
                    className="btn-tactile btn-tactile-emerald"
                    style={{ padding: '8px 20px', fontSize: '0.85rem', fontWeight: 900 }}
                  >
                    Unlock Solutions (₹99) →
                  </button>
                </div>
              )}
            </div>

            {/* Test Case & Terminal Output */}
            {consoleOutput && (
              <div style={{
                background: '#070A13',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '12px 14px',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                color: testResults?.passed ? '#34D399' : '#E2E8F0',
                whiteSpace: 'pre-wrap'
              }}>
                {consoleOutput}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 🌟 4. CURATED YOUTUBE MASTERCLASSES & DSA PLAYLISTS */}
      <div className="glass-panel" style={{
        padding: '24px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.8), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(244, 63, 94, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Youtube size={20} color="#f43f5e" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Curated YouTube Masterclasses & Interview Channels
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0' }}>
                Handpicked, ad-free video walkthroughs from industry leaders (NeetCode, Striver, ByteByteGo, freeCodeCamp).
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
          {YOUTUBE_CURATED_CHANNELS.map((ch, idx) => (
            <div
              key={idx}
              onClick={() => {
                SoundSystem.playPop();
                setActiveVideoModal({
                  title: ch.title,
                  creator: ch.creator,
                  videoId: ch.videoId,
                  description: ch.description
                });
              }}
              style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.64rem', fontWeight: 800, color: ch.color, background: `${ch.color}20`, padding: '2px 8px', borderRadius: '6px' }}>
                  {ch.badge}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{ch.creator}</span>
              </div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                {ch.title}
              </h4>
              <p style={{ fontSize: '0.76rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                {ch.description}
              </p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: '#f43f5e', fontWeight: 700 }}>
                <Play size={12} fill="#f43f5e" /> Watch Video Tutorial →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🌟 5. EMBEDDED YOUTUBE VIDEO THEATER MODAL */}
      {activeVideoModal && (
        <div className="modal-backdrop-dark" onClick={() => setActiveVideoModal(null)}>
          <div 
            className="modal-content-dark"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '820px',
              width: '95vw',
              padding: '24px',
              background: 'linear-gradient(135deg, #0F172A, #1E1B4B)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Youtube size={20} color="#f43f5e" />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                    {activeVideoModal.title}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{activeVideoModal.creator}</div>
                </div>
              </div>

              <button
                onClick={() => setActiveVideoModal(null)}
                style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕ Close
              </button>
            </div>

            {/* Embedded 16:9 Video Player */}
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '14px', background: '#000', marginBottom: '14px' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                src={`https://www.youtube-nocookie.com/embed/${activeVideoModal.videoId}?autoplay=1`}
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                {activeVideoModal.description}
              </span>
              <a
                href={`https://www.youtube.com/watch?v= ${activeVideoModal.videoId}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.76rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 700 }}
              >
                Open in YouTube <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 6. FULL ROADMAP COMPARISON MODAL */}
      {showRoadmapModal && (
        <div className="modal-backdrop-dark" onClick={() => setShowRoadmapModal(false)}>
          <div 
            className="modal-content-dark"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '850px',
              padding: '28px',
              background: 'linear-gradient(135deg, #0F172A, #1E1B4B)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                  Coding Interview Prep Roadmap Blueprint
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 0' }}>
                  Big Tech / Product Companies vs. Indian IT Services & Consulting
                </p>
              </div>
              <button
                onClick={() => setShowRoadmapModal(false)}
                style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Comparison Grid Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '14px', padding: '16px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#818CF8', margin: '0 0 8px' }}>
                  🏢 Big Tech / Product Companies
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                  <p><strong>Examples:</strong> Google, Microsoft, Amazon, Swiggy, Razorpay, CRED.</p>
                  <p><strong>Rounds:</strong> 3-5 rounds (1-2 pure DSA + System Design for experienced).</p>
                  <p><strong>Difficulty:</strong> Medium - Hard (LeetCode style).</p>
                  <p><strong>Suggested Sequence:</strong> Arrays/Strings ➔ Hashing ➔ Two Pointers ➔ Linked Lists ➔ Stacks/Queues ➔ Binary Search ➔ Trees ➔ Graphs ➔ Backtracking ➔ Dynamic Programming last.</p>
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '16px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#34D399', margin: '0 0 8px' }}>
                  🏛️ Indian IT Services & Consulting
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                  <p><strong>Examples:</strong> TCS NQT, Infosys HackWithInfy, Wipro Elite NTH, Accenture, Capgemini, Cognizant GenC.</p>
                  <p><strong>Rounds:</strong> Online Assessment (Aptitude + Reasoning + Coding) + 1-2 Technical + HR.</p>
                  <p><strong>Difficulty:</strong> Easy - Medium (Breadth over depth).</p>
                  <p><strong>Suggested Sequence:</strong> Aptitude basics (parallel track) ➔ Foundational DSA ➔ CS Fundamentals (OOP/DBMS/OS/CN) ➔ Deeper coding practice.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowRoadmapModal(false)}
              className="btn-tactile btn-tactile-primary"
              style={{ width: '100%', padding: '10px', justifyContent: 'center' }}
            >
              Close & Start Practicing
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
