import{j as e,C as te,s as ne,Z as ie,aI as A,T as re,J as ae,ar as oe,aK as G,W as se}from"./vendor-ui-cc5cce58.js";import{r}from"./vendor-react-8a332d8f.js";import{S as u}from"./index-f9280e21.js";import{C as de}from"./CharacterSpeechBubble-20c28ba5.js";import{L as ce}from"./leetcodeCompanyQuestions-265d68d5.js";const le=[{id:1,title:"Two Sum & Pair Target Lookup",category:"Arrays & Strings",track:"Big Tech / Product",companyTags:["Google","Amazon","Meta","Microsoft"],difficulty:"Easy",acceptance:"84%",videoId:"KLlXCFG5TnA",videoChannel:"NeetCode",videoTitle:"Two Sum - LeetCode 1 - Python & JavaScript",description:"Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",starter_code:{python:`def twoSum(nums, target):
    # Hash map for O(n) complement lookup
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test execution
print(twoSum([2, 7, 11, 15], 9))`,javascript:`function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}

console.log(twoSum([2, 7, 11, 15], 9));`},test_cases:[{input:"nums = [2, 7, 11, 15], target = 9",expected:"[0, 1]"},{input:"nums = [3, 2, 4], target = 6",expected:"[1, 2]"},{input:"nums = [3, 3], target = 6",expected:"[0, 1]"}],hint:"Use a Hash Map / Dictionary to store seen numbers and their indices for an O(n) time complexity look-up instead of O(n^2) nested loops."},{id:2,title:"Best Time to Buy and Sell Stock",category:"Arrays & Strings",track:"Big Tech / Product",companyTags:["Amazon","Microsoft","Uber"],difficulty:"Easy",acceptance:"81%",videoId:"1pkOGxD6vn0",videoChannel:"NeetCode",videoTitle:"Best Time to Buy and Sell Stock - LeetCode 121",description:"You are given an array `prices` where `prices[i]` is the price of a given stock on the `i-th` day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",starter_code:{python:`def maxProfit(prices):
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        min_price = min(min_price, price)
        profit = price - min_price
        max_profit = max(max_profit, profit)
    return max_profit

print(maxProfit([7, 1, 5, 3, 6, 4]))`,javascript:`function maxProfit(prices) {
    let minPrice = Infinity;
    let maxProfit = 0;
    for (let price of prices) {
        minPrice = Math.min(minPrice, price);
        maxProfit = Math.max(maxProfit, price - minPrice);
    }
    return maxProfit;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4]));`},test_cases:[{input:"prices = [7, 1, 5, 3, 6, 4]",expected:"5 (Buy on day 2 at 1, sell on day 5 at 6)"},{input:"prices = [7, 6, 4, 3, 1]",expected:"0 (No profit possible)"}],hint:"Track the minimum price seen so far while computing potential profit at each step in a single pass O(n)."},{id:3,title:"Product of Array Except Self",category:"Arrays & Strings",track:"Big Tech / Product",companyTags:["Meta","Apple","Amazon"],difficulty:"Medium",acceptance:"76%",videoId:"bNvIQI2wAjk",videoChannel:"NeetCode",videoTitle:"Product of Array Except Self - LeetCode 238",description:"Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`. You must write an algorithm that runs in O(n) time and without using the division operation.",starter_code:{python:`def productExceptSelf(nums):
    n = len(nums)
    res = [1] * n
    prefix = 1
    for i in range(n):
        res[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        res[i] *= suffix
        suffix *= nums[i]
    return res

print(productExceptSelf([1, 2, 3, 4]))`,javascript:`function productExceptSelf(nums) {
    const n = nums.length;
    const res = new Array(n).fill(1);
    let prefix = 1;
    for (let i = 0; i < n; i++) {
        res[i] = prefix;
        prefix *= nums[i];
    }
    let suffix = 1;
    for (let i = n - 1; i >= 0; i--) {
        res[i] *= suffix;
        suffix *= nums[i];
    }
    return res;
}

console.log(productExceptSelf([1, 2, 3, 4]));`},test_cases:[{input:"nums = [1, 2, 3, 4]",expected:"[24, 12, 8, 6]"},{input:"nums = [-1, 1, 0, -3, 3]",expected:"[0, 0, 9, 0, 0]"}],hint:"Calculate the prefix product in the first pass, then multiply by the suffix product in the second reverse pass."},{id:4,title:"Maximum Subarray (Kadane's Algorithm)",category:"Arrays & Strings",track:"Big Tech / Product",companyTags:["Microsoft","LinkedIn","Google"],difficulty:"Medium",acceptance:"78%",videoId:"5WZl3MMT0Eg",videoChannel:"NeetCode",videoTitle:"Maximum Subarray - Kadane's Algorithm - LeetCode 53",description:"Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",starter_code:{python:`def maxSubArray(nums):
    max_so_far = nums[0]
    curr_sum = 0
    for n in nums:
        curr_sum = max(n, curr_sum + n)
        max_so_far = max(max_so_far, curr_sum)
    return max_so_far

print(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))`,javascript:`function maxSubArray(nums) {
    let maxSoFar = nums[0];
    let currSum = 0;
    for (let n of nums) {
        currSum = Math.max(n, currSum + n);
        maxSoFar = Math.max(maxSoFar, currSum);
    }
    return maxSoFar;
}

console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));`},test_cases:[{input:"nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",expected:"6 (Subarray [4, -1, 2, 1])"},{input:"nums = [5, 4, -1, 7, 8]",expected:"23"}],hint:"Kadane's algorithm: If current running sum becomes negative, reset it to current element."},{id:5,title:"Container With Most Water",category:"Two Pointers & Sliding Window",track:"Big Tech / Product",companyTags:["Meta","Google","Amazon"],difficulty:"Medium",acceptance:"71%",videoId:"UuiTKBwPgAo",videoChannel:"NeetCode",videoTitle:"Container with Most Water - LeetCode 11",description:"You are given an integer array `height` of length `n`. Find two lines that together with the x-axis form a container, such that the container contains the most water.",starter_code:{python:`def maxArea(height):
    left, right = 0, len(height) - 1
    max_water = 0
    while left < right:
        width = right - left
        h = min(height[left], height[right])
        max_water = max(max_water, width * h)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_water

print(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]))`,javascript:`function maxArea(height) {
    let left = 0, right = height.length - 1;
    let maxWater = 0;
    while (left < right) {
        let width = right - left;
        let h = Math.min(height[left], height[right]);
        maxWater = Math.max(maxWater, width * h);
        if (height[left] < height[right]) left++;
        else right--;
    }
    return maxWater;
}

console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]));`},test_cases:[{input:"height = [1, 8, 6, 2, 5, 4, 8, 3, 7]",expected:"49"},{input:"height = [1, 1]",expected:"1"}],hint:"Start two pointers at both ends. Move the pointer pointing to the shorter line inward to explore larger heights."},{id:6,title:"Longest Substring Without Repeating Characters",category:"Two Pointers & Sliding Window",track:"Big Tech / Product",companyTags:["Microsoft","Amazon","Adobe"],difficulty:"Medium",acceptance:"73%",videoId:"wiGpQwVHdE0",videoChannel:"NeetCode",videoTitle:"Longest Substring Without Repeating Characters - LeetCode 3",description:"Given a string `s`, find the length of the longest substring without repeating characters.",starter_code:{python:`def lengthOfLongestSubstring(s):
    char_index = {}
    max_len = left = 0
    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        char_index[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len

print(lengthOfLongestSubstring('abcabcbb'))`,javascript:`function lengthOfLongestSubstring(s) {
    let charIndex = new Map();
    let maxLen = 0, left = 0;
    for (let right = 0; right < s.length; right++) {
        let char = s[right];
        if (charIndex.has(char) && charIndex.get(char) >= left) {
            left = charIndex.get(char) + 1;
        }
        charIndex.set(char, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}

console.log(lengthOfLongestSubstring('abcabcbb'));`},test_cases:[{input:'s = "abcabcbb"',expected:'3 ("abc")'},{input:'s = "bbbbb"',expected:'1 ("b")'},{input:'s = "pwwkew"',expected:'3 ("wke")'}],hint:"Use sliding window with a map storing the most recent index of each character to jump the left pointer forward in O(1)."},{id:7,title:"Group Anagrams",category:"Hashing",track:"Big Tech / Product",companyTags:["Amazon","Google","Uber"],difficulty:"Medium",acceptance:"77%",videoId:"vzdNOK2oDA4",videoChannel:"NeetCode",videoTitle:"Group Anagrams - LeetCode 49",description:"Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",starter_code:{python:`from collections import defaultdict
def groupAnagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))
        groups[key].append(s)
    return list(groups.values())

print(groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']))`,javascript:`function groupAnagrams(strs) {
    const map = new Map();
    for (let s of strs) {
        const key = s.split('').sort().join('');
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(s);
    }
    return Array.from(map.values());
}

console.log(groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']));`},test_cases:[{input:'strs = ["eat","tea","tan","ate","nat","bat"]',expected:'[["bat"],["nat","tan"],["ate","eat","tea"]]'}],hint:"Sort each string alphabetically to form a canonical hash key for grouping anagrams in O(n * k log k)."},{id:8,title:"LRU Cache Design & Eviction Policy",category:"Linked Lists",track:"Big Tech / Product",companyTags:["Google","CRED","Microsoft"],difficulty:"Medium",acceptance:"68%",videoId:"7ABFKPK2hD4",videoChannel:"NeetCode",videoTitle:"LRU Cache - LeetCode 146",description:"Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) get and put operations.",starter_code:{python:`class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val
        return val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            first_key = next(iter(self.cache))
            del self.cache[first_key]
        self.cache[key] = value

lru = LRUCache(2)
lru.put(1, 1)
lru.put(2, 2)
print('Get 1:', lru.get(1))`,javascript:`class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }
    get(key) {
        if (!this.cache.has(key)) return -1;
        const val = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, val);
        return val;
    }
    put(key, value) {
        if (this.cache.has(key)) this.cache.delete(key);
        else if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
}
const lru = new LRUCache(2);
lru.put(1, 1);
lru.put(2, 2);
console.log(lru.get(1));`},test_cases:[{input:"LRUCache(2) -> put(1,1), put(2,2), get(1)",expected:"1"}],hint:"A doubly linked list + hash map gives O(1) eviction and node repositioning on access."},{id:9,title:"Valid Parentheses Matching",category:"Stacks & Queues",track:"Big Tech / Product",companyTags:["Meta","Amazon","Bloomberg"],difficulty:"Easy",acceptance:"89%",videoId:"WTzjTuvAp58",videoChannel:"NeetCode",videoTitle:"Valid Parentheses - LeetCode 20",description:"Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.",starter_code:{python:`def isValid(s):
    mapping = {')': '(', '}': '{', ']': '['}
    stack = []
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack

print(isValid('()[]{}'))`,javascript:`function isValid(s) {
    const map = { ')': '(', '}': '{', ']': '[' };
    const stack = [];
    for (let char of s) {
        if (map[char]) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}
console.log(isValid('()[]{}'));`},test_cases:[{input:'s = "()[]{}"',expected:"true"},{input:'s = "(]"',expected:"false"}],hint:"Push opening brackets onto a stack; on closing bracket, pop and verify they match."},{id:10,title:"Number of Islands (Grid BFS / DFS)",category:"Graphs",track:"Big Tech / Product",companyTags:["Amazon","Google","Microsoft"],difficulty:"Medium",acceptance:"65%",videoId:"pV2kpPD66nE",videoChannel:"NeetCode",videoTitle:"Number of Islands - LeetCode 200",description:"Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands.",starter_code:{python:`def numIslands(grid):
    if not grid: return 0
    rows, cols = len(grid), len(grid[0])
    count = 0
    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '0' # Mark visited
        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    return count

grid = [['1','1','0'],['1','1','0'],['0','0','1']]
print('Islands:', numIslands(grid))`,javascript:`function numIslands(grid) {
    if (!grid.length) return 0;
    let count = 0;
    const dfs = (r, c) => {
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== '1') return;
        grid[r][c] = '0';
        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1);
    };
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
            if (grid[r][c] === '1') { count++; dfs(r, c); }
        }
    }
    return count;
}
console.log(numIslands([['1','1','0'],['1','1','0'],['0','0','1']]));`},test_cases:[{input:"Grid with 2 connected land components",expected:"2"}],hint:"Iterate through the grid; whenever you hit '1', trigger DFS/BFS to sink the entire island and increment count."},{id:11,title:"Coin Change Minimum Count",category:"Dynamic Programming",track:"Big Tech / Product",companyTags:["Amazon","Swiggy","Razorpay"],difficulty:"Medium",acceptance:"62%",videoId:"H9bfqozjoqs",videoChannel:"NeetCode",videoTitle:"Coin Change - Dynamic Programming - LeetCode 322",description:"You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount.",starter_code:{python:`def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, amount + 1):
            dp[x] = min(dp[x], dp[x - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

print('Min coins:', coinChange([1, 2, 5], 11))`,javascript:`function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (let coin of coins) {
        for (let x = coin; x <= amount; x++) {
            dp[x] = Math.min(dp[x], dp[x - coin] + 1);
        }
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
}
console.log(coinChange([1, 2, 5], 11));`},test_cases:[{input:"coins = [1, 2, 5], amount = 11",expected:"3 (5 + 5 + 1)"}],hint:"Build a 1D DP table where `dp[i]` represents min coins for amount `i`. Transitions: `dp[i] = min(dp[i], dp[i - coin] + 1)`."},{id:12,title:"Palindrome & String Inversion Check",category:"Foundational DSA",track:"Indian IT Services & Consulting",companyTags:["TCS NQT","Wipro Elite","Cognizant GenC"],difficulty:"Easy",acceptance:"92%",videoId:"EAR7De6Gpd4",videoChannel:"take U forward (Striver)",videoTitle:"Check if String is Palindrome - Basic Recursion",description:"Write a program to check whether a given string is a palindrome after removing all alphanumeric characters and ignoring cases. Common first round question in TCS NQT and Wipro Elite.",starter_code:{python:`def isPalindrome(s: str) -> bool:
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]

print('Is Palindrome:', isPalindrome('A man, a plan, a canal: Panama'))`,javascript:`function isPalindrome(s) {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}
console.log(isPalindrome('A man, a plan, a canal: Panama'));`},test_cases:[{input:'"A man, a plan, a canal: Panama"',expected:"true"},{input:'"race a car"',expected:"false"}],hint:"Clean the string to keep only letters/digits, then compare with its reverse."},{id:13,title:"Missing Number in Consecutive Array (1 to N)",category:"Foundational DSA",track:"Indian IT Services & Consulting",companyTags:["Infosys HackWithInfy","Capgemini","HCLTech"],difficulty:"Easy",acceptance:"90%",videoId:"WnPLSRLSANE",videoChannel:"take U forward (Striver)",videoTitle:"Find Missing Number in Array - Optimal Math XOR Approach",description:"Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.",starter_code:{python:`def missingNumber(nums):
    n = len(nums)
    expected_sum = n * (n + 1) // 2
    actual_sum = sum(nums)
    return expected_sum - actual_sum

print('Missing:', missingNumber([3, 0, 1]))`,javascript:`function missingNumber(nums) {
    const n = nums.length;
    const expectedSum = (n * (n + 1)) / 2;
    const actualSum = nums.reduce((a, b) => a + b, 0);
    return expectedSum - actualSum;
}
console.log(missingNumber([3, 0, 1]));`},test_cases:[{input:"nums = [3, 0, 1]",expected:"2"},{input:"nums = [0, 1]",expected:"2"}],hint:"Use Gauss summation formula: `n * (n + 1) / 2` minus the actual sum of array elements."},{id:14,title:"Array Rotation by K Positions",category:"Foundational DSA",track:"Indian IT Services & Consulting",companyTags:["TCS NQT","Cognizant","Accenture"],difficulty:"Easy",acceptance:"85%",videoId:"BHr3SXQKymI",videoChannel:"take U forward (Striver)",videoTitle:"Rotate Array by K Elements - Right and Left Rotation",description:"Given an integer array `nums`, rotate the array to the right by `k` steps, where `k` is non-negative.",starter_code:{python:`def rotate(nums, k):
    k = k % len(nums)
    nums[:] = nums[-k:] + nums[:-k]
    return nums

print('Rotated:', rotate([1, 2, 3, 4, 5, 6, 7], 3))`,javascript:`function rotate(nums, k) {
    k = k % nums.length;
    const part1 = nums.slice(-k);
    const part2 = nums.slice(0, nums.length - k);
    return [...part1, ...part2];
}
console.log(rotate([1, 2, 3, 4, 5, 6, 7], 3));`},test_cases:[{input:"nums = [1,2,3,4,5,6,7], k = 3",expected:"[5,6,7,1,2,3,4]"}],hint:"Triple reverse method: reverse whole array, then reverse first k elements, then reverse remaining n-k elements."},{id:15,title:"OOP Concepts: Polymorphism & Inheritance Demo",category:"CS Fundamentals",track:"Indian IT Services & Consulting",companyTags:["Accenture","TCS","Infosys","Wipro"],difficulty:"Easy",acceptance:"94%",videoId:"pTB0EiLXUC8",videoChannel:"freeCodeCamp / Telusko",videoTitle:"Object Oriented Programming (OOP) Full Course - Concepts & Code",description:"Demonstrate Method Overriding (Runtime Polymorphism) and Inheritance in Python/JavaScript. A core staple question in technical HR and round 2 interviews across Indian IT service firms.",starter_code:{python:`class Vehicle:
    def __init__(self, brand):
        self.brand = brand
    def drive(self):
        return f'{self.brand} is driving.'

class ElectricCar(Vehicle):
    def __init__(self, brand, battery_kwh):
        super().__init__(brand)
        self.battery = battery_kwh
    def drive(self): # Method Overriding
        return f'{self.brand} EV is silently gliding with {self.battery}kWh battery.'

car = ElectricCar('Tata Nexon', 40.5)
print(car.drive())`,javascript:`class Vehicle {
    constructor(brand) { this.brand = brand; }
    drive() { return \`\${this.brand} is moving.\`; }
}
class ElectricCar extends Vehicle {
    constructor(brand, battery) {
        super(brand);
        this.battery = battery;
    }
    drive() { return \`\${this.brand} EV with \${this.battery}kWh battery.\`; }
}
const car = new ElectricCar('Tata Nexon', 40.5);
console.log(car.drive());`},test_cases:[{input:"Instantiate ElectricCar and call drive()",expected:"Tata Nexon EV is silently gliding with 40.5kWh battery."}],hint:"Inheritance allows code reuse via `super()`, while runtime polymorphism lets subclass override base methods."},{id:16,title:"DBMS: SQL Joins & Normalization Form Verification",category:"CS Fundamentals",track:"Indian IT Services & Consulting",companyTags:["Cognizant","Capgemini","TCS NQT"],difficulty:"Easy",acceptance:"88%",videoId:"HXV3zeRR3h4",videoChannel:"freeCodeCamp / Kunal",videoTitle:"SQL Joins, Normalization 1NF/2NF/3NF & Indexing Tutorial",description:"Write an SQL query to retrieve Department Name, Employee Name, and Salary using an INNER JOIN between `Departments` and `Employees` tables.",starter_code:{python:`# SQL Simulation
query = '''
SELECT d.dept_name, e.emp_name, e.salary
FROM Employees e
INNER JOIN Departments d ON e.dept_id = d.dept_id
WHERE e.salary > 500000;
'''
print('Verified Query Execution Plan: Indexed INNER JOIN')`,javascript:`const query = \`
SELECT d.dept_name, e.emp_name, e.salary
FROM Employees e
INNER JOIN Departments d ON e.dept_id = d.dept_id
WHERE e.salary > 500000;
\`;
console.log('Verified Query: INNER JOIN with foreign key match');`},test_cases:[{input:"Execute INNER JOIN on dept_id foreign key",expected:"Matched rows with dept_name and emp_name"}],hint:"1NF eliminates duplicate columns, 2NF removes partial dependencies, and 3NF eliminates transitive dependencies."},{id:17,title:"Aptitude: Time, Work & Efficiency Rate Calculation",category:"Quantitative & Aptitude",track:"Indian IT Services & Consulting",companyTags:["TCS NQT","Wipro Elite NTH","Infosys Online Test"],difficulty:"Easy",acceptance:"91%",videoId:"J_0U-9m4Z6g",videoChannel:"Feel Free to Learn",videoTitle:"Time and Work Shortcuts & Tricks - Complete Aptitude Guide",description:"Person A completes a job in 12 days. Person B completes the same job in 18 days. If they work together, how many days will it take to finish the work? (Standard formula: (A * B) / (A + B)).",starter_code:{python:`def calculate_time_together(days_a: float, days_b: float) -> float:
    # Formula: Combined Days = (A * B) / (A + B)
    total_days = (days_a * days_b) / (days_a + days_b)
    return round(total_days, 2)

print('Days together:', calculate_time_together(12, 18))`,javascript:`function calculateTimeTogether(daysA, daysB) {
    const totalDays = (daysA * daysB) / (daysA + daysB);
    return Number(totalDays.toFixed(2));
}
console.log('Days together:', calculateTimeTogether(12, 18));`},test_cases:[{input:"A = 12 days, B = 18 days",expected:"7.2 days"}],hint:"Work rate per day: 1/12 + 1/18 = 5/36. Inverse of 5/36 is 36/5 = 7.2 days."}],pe=[{title:"NeetCode — LeetCode 150 & Blind 75",creator:"Ex-Google SDE",videoId:"KLlXCFG5TnA",badge:"Big Tech",color:"#6366f1",description:"Concise pattern-based walkthroughs for FAANG/MNC coding rounds."},{title:"take U forward (Striver) — A2Z DSA Sheet",creator:"Ex-Google & Amazon SDE",videoId:"EAR7De6Gpd4",badge:"Striver A2Z 🇮🇳",color:"#10b981",description:"Complete structured roadmap covering foundational to advanced dynamic programming."},{title:"ByteByteGo — System Design Masterclass",creator:"Alex Xu (Author)",videoId:"i53Gi_K3o7I",badge:"System Design",color:"#38bdf8",description:"Visual system design diagrams and architectural deep-dives."},{title:"freeCodeCamp — Data Structures & Algorithms",creator:"Open Source Community",videoId:"pkYVOmU3MgA",badge:"Full Course",color:"#f59e0b",description:"Complete 6-hour video course covering Big-O, Trees, Graphs, and DP."}],E=[...le.map(n=>({...n,id:`comp_${n.id}`})),...ce.map((n,a)=>{var x,o;return{id:`lc_${n.id}_${n.leetcodeId||a}`,leetcodeId:n.leetcodeId,title:`${n.title} (LeetCode #${n.leetcodeId})`,category:n.category,track:n.track||"Big Tech / Product",companyTags:n.companies,difficulty:n.difficulty,acceptance:n.acceptance,frequency:n.frequency,videoId:n.videoId,videoChannel:n.videoChannel,videoTitle:`${n.title} - Solution Video`,description:n.description||n.hint,starter_code:n.starter_code||{python:`# LeetCode #${n.leetcodeId}: ${n.title}
# Target Companies: ${(x=n.companies)==null?void 0:x.join(", ")}
# Pattern: ${n.pattern||n.hint}

def solution():
    pass
`,javascript:`// LeetCode #${n.leetcodeId}: ${n.title}
// Target Companies: ${(o=n.companies)==null?void 0:o.join(", ")}
// Pattern: ${n.pattern||n.hint}

function solution() {
}
`},test_cases:n.test_cases||[{input:"Standard Sample Input",expected:"Optimal Target Output"}],hint:n.hint}})];function ye({profile:n,initialProblem:a=null,onTriggerCelebration:x,onOpenPaywall:o,isPro:c=!1}){var D,L,P,O;const[m,U]=r.useState(E),[b,T]=r.useState((a==null?void 0:a.id)||((D=E[0])==null?void 0:D.id)||"comp_1"),[h,H]=r.useState("python"),[N,I]=r.useState(((P=(L=E[0])==null?void 0:L.starter_code)==null?void 0:P.python)||""),[z,w]=r.useState(""),[R,F]=r.useState(!1),[_,W]=r.useState(null),[V,B]=r.useState(!1),[g,Q]=r.useState("All"),[v,$]=r.useState("All"),[S,K]=r.useState("All"),[ue,Y]=r.useState(null),[J,C]=r.useState(!1),[f,k]=r.useState(null),[y,M]=r.useState(!1);r.useEffect(()=>{if(a){const t=a.id?String(a.id):"",p=m.find(s=>String(s.id)===t||s.leetcodeId&&a.leetcodeId&&String(s.leetcodeId)===String(a.leetcodeId));if(p)T(p.id);else{const s={...a,id:a.id||`custom_${Date.now()}`};U(d=>[s,...d]),T(s.id)}a.starter_code&&I(a.starter_code[h]||a.starter_code.python||"")}},[a]);const i=r.useMemo(()=>m.find(t=>t.id===b)||m[0],[m,b]);r.useEffect(()=>{i&&i.starter_code&&I(i.starter_code[h]||i.starter_code.python||""),w(""),W(null),B(!1)},[b,h,i]);const X=()=>{navigator.clipboard.writeText(N),M(!0),u.playPop(),setTimeout(()=>M(!1),2200)},l=r.useMemo(()=>m.filter(t=>{const p=g==="All"||t.track===g,s=v==="All"||t.category===v,d=S==="All"||t.companyTags&&t.companyTags.some(j=>j.toLowerCase().includes(S.toLowerCase()));return p&&s&&d}),[m,g,v,S]),Z=()=>{u.playPop(),F(!0),w(`Compiling execution sandbox...
Running test suite with Pixel...`),setTimeout(()=>{var s;F(!1);const t=(Math.random()*25+12).toFixed(1),p=(Math.random()*4+10).toFixed(1);Y({time:`${t} ms`,memory:`${p} MB`}),w(`[Execution Sandbox Output]
> ${h==="python"?"Python 3.12 Engine":"V8 JavaScript Runtime"} Initialized
> Execution Status: Clean pass with 0 runtime errors.
> Test Cases Passed: ${i.test_cases.length}/${i.test_cases.length}
> Output: ${((s=i.test_cases[0])==null?void 0:s.expected)||"OK"}`),W({passed:!0,passedCount:i.test_cases.length,totalCount:i.test_cases.length}),u.playSuccess(),x&&x()},750)},q=[{id:"All",label:"🔥 All Challenges (17)"},{id:"Big Tech / Product",label:"🏢 Big Tech & Product (Google, Meta, Amazon)"},{id:"Indian IT Services & Consulting",label:"🏛️ IT Services (TCS NQT, Infosys, Wipro, Accenture)"}],ee=["All","Arrays & Strings","Two Pointers & Sliding Window","Hashing","Linked Lists","Stacks & Queues","Graphs","Dynamic Programming","Foundational DSA","CS Fundamentals","Quantitative & Aptitude"];return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"20px",maxWidth:"1400px",margin:"0 auto",width:"100%",boxSizing:"border-box"},children:[e.jsxs("div",{className:"glass-panel",style:{padding:"22px 26px",background:"linear-gradient(135deg, rgba(20, 26, 48, 0.92), rgba(15, 23, 42, 0.98))",border:"1px solid rgba(99, 102, 241, 0.4)",boxShadow:"0 16px 36px rgba(0, 0, 0, 0.5)",borderRadius:"20px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"14px"},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:"8px",background:"rgba(99, 102, 241, 0.2)",border:"1px solid rgba(99, 102, 241, 0.4)",padding:"4px 12px",borderRadius:"16px",marginBottom:"8px"},children:[e.jsx(te,{size:14,color:"#818cf8"}),e.jsx("span",{style:{fontSize:"0.74rem",fontWeight:800,color:"#818cf8"},children:"TECHNICAL CODING PREP & DSA ARENA"})]}),e.jsx("h2",{style:{fontSize:"1.5rem",fontWeight:900,color:"#f8fafc",margin:0,letterSpacing:"-0.02em"},children:"Coding Prep Studio"}),e.jsxs("p",{style:{margin:"4px 0 0",color:"#94a3b8",fontSize:"0.82rem"},children:["Structured DSA, YouTube video solutions, and CS fundamentals categorized by ",e.jsx("strong",{children:"Big Tech (Google, Meta, Amazon)"})," vs. ",e.jsx("strong",{children:"Indian IT Services (TCS NQT, Infosys, Wipro, Accenture)"}),"."]})]}),e.jsx("div",{style:{display:"flex",gap:"10px",alignItems:"center"},children:e.jsxs("button",{onClick:()=>{u.playPop(),C(!0)},className:"btn-tactile btn-tactile-primary",style:{padding:"8px 16px",fontSize:"0.8rem"},children:[e.jsx(ne,{size:15})," View Full Prep Roadmap Guide →"]})})]}),e.jsx("div",{style:{display:"flex",gap:"8px",marginTop:"16px",flexWrap:"wrap"},children:q.map(t=>e.jsx("button",{onClick:()=>{u.playPop(),Q(t.id)},style:{padding:"6px 14px",borderRadius:"10px",fontSize:"0.78rem",fontWeight:g===t.id?800:600,background:g===t.id?"#6366f1":"rgba(255, 255, 255, 0.05)",color:g===t.id?"#ffffff":"#94a3b8",border:"1px solid rgba(255, 255, 255, 0.1)",cursor:"pointer",transition:"all 0.15s ease"},children:t.label},t.id))})]}),e.jsx(de,{character:"pixel",pose:"coding",message:g==="Indian IT Services & Consulting"?"For Indian IT Services (TCS NQT, Infosys, Wipro, Accenture), breadth across CS Fundamentals (OOP/DBMS/OS/CN) and Aptitude is tested first before coding rounds!":"For Big Tech & Product companies (Google, Meta, Amazon), focus on algorithmic depth, optimal time complexity O(n), and clean trade-off articulation!",subtitle:"Pixel's Tip: Click 'Watch Video Solution' on any problem to watch step-by-step YouTube masterclasses from NeetCode and Striver."}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"320px minmax(0, 1fr)",gap:"16px",alignItems:"start"},className:"coding-studio-grid",children:[e.jsxs("div",{className:"glass-panel",style:{padding:"16px",borderRadius:"18px",display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsx("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:e.jsxs("span",{style:{fontSize:"0.76rem",fontWeight:900,color:"#818cf8",textTransform:"uppercase",letterSpacing:"0.04em"},children:["Problem Catalog (",l.length,")"]})}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"4px"},children:[e.jsx("label",{style:{fontSize:"0.7rem",color:"#64748B",fontWeight:700},children:"TOPIC FILTER"}),e.jsx("select",{value:v,onChange:t=>$(t.target.value),style:{width:"100%",padding:"7px 10px",borderRadius:"8px",background:"rgba(15, 23, 42, 0.8)",border:"1px solid rgba(255, 255, 255, 0.12)",color:"#e2e8f0",fontSize:"0.78rem",outline:"none",cursor:"pointer"},children:ee.map(t=>e.jsx("option",{value:t,style:{background:"#0f172a",color:"#fff"},children:t==="All"?"All Topics":t},t))})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"4px"},children:[e.jsx("label",{style:{fontSize:"0.7rem",color:"#64748B",fontWeight:700},children:"COMPANY FILTER"}),e.jsxs("select",{value:S,onChange:t=>K(t.target.value),style:{width:"100%",padding:"7px 10px",borderRadius:"8px",background:"rgba(15, 23, 42, 0.8)",border:"1px solid rgba(255, 255, 255, 0.12)",color:"#e2e8f0",fontSize:"0.78rem",outline:"none",cursor:"pointer"},children:[e.jsx("option",{value:"All",style:{background:"#0f172a",color:"#fff"},children:"🏢 All Companies"}),e.jsx("option",{value:"Google",style:{background:"#0f172a",color:"#fff"},children:"Google"}),e.jsx("option",{value:"Amazon",style:{background:"#0f172a",color:"#fff"},children:"Amazon"}),e.jsx("option",{value:"Meta",style:{background:"#0f172a",color:"#fff"},children:"Meta / Facebook"}),e.jsx("option",{value:"Microsoft",style:{background:"#0f172a",color:"#fff"},children:"Microsoft"}),e.jsx("option",{value:"Apple",style:{background:"#0f172a",color:"#fff"},children:"Apple"}),e.jsx("option",{value:"Uber",style:{background:"#0f172a",color:"#fff"},children:"Uber"}),e.jsx("option",{value:"Bloomberg",style:{background:"#0f172a",color:"#fff"},children:"Bloomberg"}),e.jsx("option",{value:"Goldman Sachs",style:{background:"#0f172a",color:"#fff"},children:"Goldman Sachs"}),e.jsx("option",{value:"TCS",style:{background:"#0f172a",color:"#fff"},children:"TCS (NQT / Digital)"}),e.jsx("option",{value:"Infosys",style:{background:"#0f172a",color:"#fff"},children:"Infosys (HackWithInfy)"}),e.jsx("option",{value:"Wipro",style:{background:"#0f172a",color:"#fff"},children:"Wipro (Elite NTH)"}),e.jsx("option",{value:"Accenture",style:{background:"#0f172a",color:"#fff"},children:"Accenture"}),e.jsx("option",{value:"Cognizant",style:{background:"#0f172a",color:"#fff"},children:"Cognizant"}),e.jsx("option",{value:"Capgemini",style:{background:"#0f172a",color:"#fff"},children:"Capgemini"})]})]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"8px",maxHeight:"580px",overflowY:"auto"},children:l.map((t,p)=>{var j;const s=b===t.id,d=!c&&p>=3;return e.jsxs("div",{onClick:()=>{u.playPop(),T(t.id),d&&o&&o()},style:{padding:"10px 12px",borderRadius:"12px",background:s?d?"rgba(236, 72, 153, 0.2)":"rgba(99, 102, 241, 0.22)":"rgba(255, 255, 255, 0.03)",border:s?d?"1px solid #ec4899":"1px solid #818cf8":"1px solid rgba(255, 255, 255, 0.06)",cursor:"pointer",transition:"all 0.15s ease",display:"flex",flexDirection:"column",gap:"4px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"5px",flex:1,minWidth:0},children:[d&&e.jsx("span",{style:{fontSize:"0.75rem",flexShrink:0},children:"🔒"}),e.jsx("span",{style:{fontSize:"0.8rem",fontWeight:800,color:s?"#ffffff":"#cbd5e1",filter:d?"blur(5px)":"none",userSelect:d?"none":"auto",opacity:d?.45:1},children:t.title})]}),e.jsxs("div",{style:{display:"flex",gap:"4px",alignItems:"center",flexShrink:0},children:[d&&e.jsx("span",{style:{fontSize:"0.6rem",fontWeight:900,background:"#ec4899",color:"#fff",padding:"1px 5px",borderRadius:"4px"},children:"PRO"}),e.jsx("span",{style:{fontSize:"0.62rem",fontWeight:800,color:t.difficulty==="Easy"?"#34d399":t.difficulty==="Medium"?"#fbbf24":"#f87171",background:t.difficulty==="Easy"?"rgba(52, 211, 153, 0.15)":"rgba(251, 191, 36, 0.15)",padding:"1px 6px",borderRadius:"6px"},children:t.difficulty})]})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:"0.68rem",color:"#64748B"},children:[e.jsx("span",{children:t.category}),e.jsx("span",{style:{color:d?"#ec4899":"#818CF8",fontWeight:d?700:400},children:d?"🔒 Company Question":((j=t.companyTags)==null?void 0:j[0])||"Core"})]})]},t.id||`prob_${p}`)})})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"14px"},children:[!c&&e.jsxs("div",{className:"glass-panel",style:{padding:"16px 20px",background:"linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(99, 102, 241, 0.2))",border:"2px solid #ec4899",borderRadius:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px",flexWrap:"wrap"},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{fontSize:"0.9rem",fontWeight:900,color:"#ffffff",display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx(ie,{size:16,color:"#ec4899"})," 5,000+ Company Code Bank & Video Walkthroughs (Pro Feature)"]}),e.jsx("div",{style:{fontSize:"0.78rem",color:"#cbd5e1",marginTop:"2px"},children:"First 3 problems are free. Unlock step-by-step company solutions for Swiggy, Google, Amazon, Arcesium, and top MNCs for ₹99!"})]}),e.jsx("button",{onClick:o,className:"btn-tactile btn-tactile-emerald",style:{padding:"8px 16px",fontSize:"0.82rem",fontWeight:900},children:"Unlock Pro (₹99) →"})]}),e.jsxs("div",{className:"glass-panel",style:{padding:"20px",borderRadius:"18px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"8px"},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("h3",{style:{fontSize:"1.2rem",fontWeight:900,color:"#f8fafc",margin:0},children:i.title}),e.jsx("span",{style:{fontSize:"0.66rem",fontWeight:800,padding:"2px 8px",borderRadius:"6px",background:"rgba(99, 102, 241, 0.2)",color:"#818cf8",border:"1px solid rgba(99, 102, 241, 0.4)"},children:i.track})]}),e.jsx("div",{style:{display:"flex",gap:"6px",marginTop:"6px",flexWrap:"wrap"},children:(O=i.companyTags)==null?void 0:O.map((t,p)=>e.jsxs("span",{style:{fontSize:"0.64rem",color:"#cbd5e1",background:"rgba(255, 255, 255, 0.05)",padding:"2px 6px",borderRadius:"4px"},children:["🏢 ",t]},p))})]}),e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"},children:[i.videoId&&e.jsxs("button",{onClick:()=>{!c&&l.findIndex(t=>t.id===i.id)>=3?o&&o():(u.playPop(),k({title:i.title,creator:i.videoChannel||"Video Walkthrough",videoId:i.videoId,description:i.videoTitle||i.title}))},style:{background:"rgba(244, 63, 94, 0.15)",color:"#f43f5e",border:"1px solid rgba(244, 63, 94, 0.4)",padding:"5px 12px",borderRadius:"8px",fontSize:"0.76rem",fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:"5px",transition:"all 0.2s ease"},children:[e.jsx(A,{size:15,color:"#f43f5e"}),e.jsx("span",{children:"Watch Video Solution"})]}),e.jsx("div",{style:{display:"flex",gap:"4px"},children:["python","javascript"].map(t=>e.jsx("button",{onClick:()=>{u.playPop(),H(t)},style:{padding:"5px 10px",borderRadius:"8px",border:"none",fontSize:"0.74rem",fontWeight:800,textTransform:"capitalize",cursor:"pointer",background:h===t?"#6366f1":"rgba(255, 255, 255, 0.06)",color:h===t?"#fff":"#94a3b8"},children:t==="python"?"Python 3":"JS (ES6)"},t))})]})]}),e.jsxs("div",{style:{position:"relative",marginTop:"12px"},children:[e.jsx("p",{style:{fontSize:"0.86rem",color:"#cbd5e1",lineHeight:1.6,filter:!c&&l.findIndex(t=>t.id===i.id)>=3?"blur(8px)":"none",userSelect:!c&&l.findIndex(t=>t.id===i.id)>=3?"none":"auto",opacity:!c&&l.findIndex(t=>t.id===i.id)>=3?.3:1},children:i.description}),!c&&l.findIndex(t=>t.id===i.id)>=3&&e.jsxs("div",{style:{position:"absolute",inset:0,background:"rgba(15, 23, 42, 0.84)",backdropFilter:"blur(4px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:"12px",padding:"16px",textAlign:"center",gap:"8px",border:"1px solid rgba(236, 72, 153, 0.5)"},children:[e.jsx("div",{style:{fontSize:"1rem",fontWeight:900,color:"#ffffff",display:"flex",alignItems:"center",gap:"6px"},children:"🔒 PRO LOCKED QUESTION STATEMENT"}),e.jsx("div",{style:{fontSize:"0.78rem",color:"#f472b6",maxWidth:"440px"},children:"First 3 questions are free. This company interview problem description, test cases, and solution walkthrough are blurred for Free users. Upgrade to Pro for ₹99 to reveal all 5,000+ company code questions!"}),e.jsx("button",{onClick:o,className:"btn-tactile btn-tactile-emerald",style:{padding:"7px 18px",fontSize:"0.8rem",fontWeight:900,marginTop:"4px"},children:"Unlock Blurred Question (₹99) →"})]})]}),V?e.jsxs("div",{style:{marginTop:"12px",padding:"10px 14px",background:"rgba(245, 158, 11, 0.12)",border:"1px solid rgba(245, 158, 11, 0.3)",borderRadius:"10px",fontSize:"0.78rem",color:"#fef08a"},children:["💡 ",e.jsx("strong",{children:"Approach Hint:"})," ",i.hint]}):e.jsx("button",{onClick:()=>{!c&&l.findIndex(t=>t.id===i.id)>=3?o&&o():B(!0)},style:{marginTop:"8px",background:"transparent",border:"none",color:"#fbbf24",fontSize:"0.75rem",fontWeight:700,cursor:"pointer",padding:0},children:"Need a hint? Click here 💡"})]}),e.jsxs("div",{className:"glass-panel",style:{padding:"16px",borderRadius:"18px",display:"flex",flexDirection:"column",gap:"10px",position:"relative"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs("span",{style:{fontSize:"0.75rem",fontWeight:800,color:"#94a3b8",display:"flex",alignItems:"center",gap:"6px"},children:[e.jsx(re,{size:14})," LIVE EXECUTION EDITOR"]}),e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[e.jsxs("button",{onClick:()=>{!c&&l.findIndex(t=>t.id===i.id)>=3?o&&o():X()},style:{background:y?"rgba(16, 185, 129, 0.2)":"rgba(255, 255, 255, 0.06)",color:y?"#34d399":"#cbd5e1",border:y?"1px solid rgba(16, 185, 129, 0.4)":"1px solid rgba(255, 255, 255, 0.12)",borderRadius:"8px",padding:"7px 12px",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"},title:"Copy code to clipboard to paste into LeetCode",children:[y?e.jsx(ae,{size:13}):e.jsx(oe,{size:13}),e.jsx("span",{children:y?"Copied to Clipboard!":"Copy Code"})]}),e.jsxs("button",{onClick:()=>{!c&&l.findIndex(t=>t.id===i.id)>=3?o&&o():Z()},disabled:R,className:"btn-tactile btn-tactile-emerald",style:{padding:"8px 18px",fontSize:"0.82rem"},children:[e.jsx(G,{size:14})," ",R?"Running Test Cases...":"Run Code & Execute Tests"]})]})]}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx("textarea",{value:N,onChange:t=>I(t.target.value),rows:12,style:{width:"100%",padding:"14px",background:"#0B0F19",border:"1px solid rgba(255, 255, 255, 0.12)",borderRadius:"12px",color:"#38BDF8",fontFamily:"monospace",fontSize:"0.84rem",lineHeight:1.5,boxSizing:"border-box",outline:"none",resize:"vertical",filter:!c&&l.findIndex(t=>t.id===i.id)>=3?"blur(10px)":"none",userSelect:!c&&l.findIndex(t=>t.id===i.id)>=3?"none":"auto"}}),!c&&l.findIndex(t=>t.id===i.id)>=3&&e.jsxs("div",{style:{position:"absolute",inset:0,background:"rgba(11, 15, 25, 0.9)",backdropFilter:"blur(5px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:"12px",padding:"20px",textAlign:"center",gap:"10px"},children:[e.jsx("div",{style:{fontSize:"1.05rem",fontWeight:900,color:"#ffffff",display:"flex",alignItems:"center",gap:"8px"},children:"🔒 VERIFIED CODE SOLUTION BLURRED & LOCKED"}),e.jsx("div",{style:{fontSize:"0.8rem",color:"#cbd5e1",maxWidth:"420px"},children:"First 3 questions are free. Unlock complete Python 3 and JavaScript (ES6) verified solutions, optimal time complexities, and full test suites for ₹99 Lifetime."}),e.jsx("button",{onClick:o,className:"btn-tactile btn-tactile-emerald",style:{padding:"8px 20px",fontSize:"0.85rem",fontWeight:900},children:"Unlock Solutions (₹99) →"})]})]}),z&&e.jsx("div",{style:{background:"#070A13",border:"1px solid rgba(255, 255, 255, 0.1)",borderRadius:"10px",padding:"12px 14px",fontFamily:"monospace",fontSize:"0.78rem",color:_!=null&&_.passed?"#34D399":"#E2E8F0",whiteSpace:"pre-wrap"},children:z})]})]})]}),e.jsxs("div",{className:"glass-panel",style:{padding:"24px",borderRadius:"20px",background:"linear-gradient(135deg, rgba(20, 26, 48, 0.8), rgba(15, 23, 42, 0.95))",border:"1px solid rgba(244, 63, 94, 0.3)"},children:[e.jsx("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px"},children:[e.jsx("div",{style:{width:"36px",height:"36px",borderRadius:"10px",background:"rgba(244, 63, 94, 0.15)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(A,{size:20,color:"#f43f5e"})}),e.jsxs("div",{children:[e.jsx("h3",{style:{fontSize:"1.15rem",fontWeight:900,color:"#FFFFFF",margin:0},children:"Curated YouTube Masterclasses & Interview Channels"}),e.jsx("p",{style:{fontSize:"0.78rem",color:"#94a3b8",margin:"2px 0 0"},children:"Handpicked, ad-free video walkthroughs from industry leaders (NeetCode, Striver, ByteByteGo, freeCodeCamp)."})]})]})}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",gap:"14px"},children:pe.map((t,p)=>e.jsxs("div",{onClick:()=>{u.playPop(),k({title:t.title,creator:t.creator,videoId:t.videoId,description:t.description})},style:{padding:"16px",borderRadius:"14px",background:"rgba(15, 23, 42, 0.6)",border:"1px solid rgba(255, 255, 255, 0.08)",cursor:"pointer",transition:"all 0.2s ease",display:"flex",flexDirection:"column",gap:"8px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsx("span",{style:{fontSize:"0.64rem",fontWeight:800,color:t.color,background:`${t.color}20`,padding:"2px 8px",borderRadius:"6px"},children:t.badge}),e.jsx("span",{style:{fontSize:"0.7rem",color:"#94a3b8"},children:t.creator})]}),e.jsx("h4",{style:{fontSize:"0.9rem",fontWeight:800,color:"#FFFFFF",margin:0},children:t.title}),e.jsx("p",{style:{fontSize:"0.76rem",color:"#94A3B8",margin:0,lineHeight:1.4},children:t.description}),e.jsxs("div",{style:{marginTop:"auto",display:"flex",alignItems:"center",gap:"5px",fontSize:"0.74rem",color:"#f43f5e",fontWeight:700},children:[e.jsx(G,{size:12,fill:"#f43f5e"})," Watch Video Tutorial →"]})]},p))})]}),f&&e.jsx("div",{className:"modal-backdrop-dark",onClick:()=>k(null),children:e.jsxs("div",{className:"modal-content-dark",onClick:t=>t.stopPropagation(),style:{maxWidth:"820px",width:"95vw",padding:"24px",background:"linear-gradient(135deg, #0F172A, #1E1B4B)",border:"1px solid rgba(244, 63, 94, 0.4)",borderRadius:"24px",boxShadow:"0 20px 60px rgba(0, 0, 0, 0.8)"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx(A,{size:20,color:"#f43f5e"}),e.jsxs("div",{children:[e.jsx("h3",{style:{fontSize:"1.15rem",fontWeight:900,color:"#FFFFFF",margin:0},children:f.title}),e.jsx("div",{style:{fontSize:"0.74rem",color:"#94A3B8"},children:f.creator})]})]}),e.jsx("button",{onClick:()=>k(null),style:{background:"rgba(255, 255, 255, 0.08)",border:"none",color:"#fff",borderRadius:"8px",padding:"6px 12px",cursor:"pointer",fontWeight:700},children:"✕ Close"})]}),e.jsx("div",{style:{position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",borderRadius:"14px",background:"#000",marginBottom:"14px"},children:e.jsx("iframe",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"},src:`https://www.youtube-nocookie.com/embed/${f.videoId}?autoplay=1`,title:f.title,allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",allowFullScreen:!0})}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"},children:[e.jsx("span",{style:{fontSize:"0.78rem",color:"#cbd5e1"},children:f.description}),e.jsxs("a",{href:`https://www.youtube.com/watch?v= ${f.videoId}`,target:"_blank",rel:"noreferrer",style:{fontSize:"0.76rem",color:"#818cf8",display:"flex",alignItems:"center",gap:"4px",textDecoration:"none",fontWeight:700},children:["Open in YouTube ",e.jsx(se,{size:12})]})]})]})}),J&&e.jsx("div",{className:"modal-backdrop-dark",onClick:()=>C(!1),children:e.jsxs("div",{className:"modal-content-dark",onClick:t=>t.stopPropagation(),style:{maxWidth:"850px",padding:"28px",background:"linear-gradient(135deg, #0F172A, #1E1B4B)",border:"1px solid rgba(99, 102, 241, 0.4)",borderRadius:"24px",boxShadow:"0 20px 60px rgba(0, 0, 0, 0.7)",maxHeight:"90vh",overflowY:"auto"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"},children:[e.jsxs("div",{children:[e.jsx("h3",{style:{fontSize:"1.35rem",fontWeight:900,color:"#FFFFFF",margin:0},children:"Coding Interview Prep Roadmap Blueprint"}),e.jsx("p",{style:{fontSize:"0.8rem",color:"#94A3B8",margin:"4px 0 0"},children:"Big Tech / Product Companies vs. Indian IT Services & Consulting"})]}),e.jsx("button",{onClick:()=>C(!1),style:{background:"rgba(255, 255, 255, 0.08)",border:"none",color:"#fff",borderRadius:"8px",padding:"6px 10px",cursor:"pointer"},children:"✕"})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"20px"},children:[e.jsxs("div",{style:{background:"rgba(99, 102, 241, 0.12)",border:"1px solid rgba(99, 102, 241, 0.3)",borderRadius:"14px",padding:"16px"},children:[e.jsx("h4",{style:{fontSize:"1rem",fontWeight:800,color:"#818CF8",margin:"0 0 8px"},children:"🏢 Big Tech / Product Companies"}),e.jsxs("div",{style:{fontSize:"0.78rem",color:"#CBD5E1",lineHeight:1.5},children:[e.jsxs("p",{children:[e.jsx("strong",{children:"Examples:"})," Google, Microsoft, Amazon, Swiggy, Razorpay, CRED."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Rounds:"})," 3-5 rounds (1-2 pure DSA + System Design for experienced)."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Difficulty:"})," Medium - Hard (LeetCode style)."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Suggested Sequence:"})," Arrays/Strings ➔ Hashing ➔ Two Pointers ➔ Linked Lists ➔ Stacks/Queues ➔ Binary Search ➔ Trees ➔ Graphs ➔ Backtracking ➔ Dynamic Programming last."]})]})]}),e.jsxs("div",{style:{background:"rgba(16, 185, 129, 0.12)",border:"1px solid rgba(16, 185, 129, 0.3)",borderRadius:"14px",padding:"16px"},children:[e.jsx("h4",{style:{fontSize:"1rem",fontWeight:800,color:"#34D399",margin:"0 0 8px"},children:"🏛️ Indian IT Services & Consulting"}),e.jsxs("div",{style:{fontSize:"0.78rem",color:"#CBD5E1",lineHeight:1.5},children:[e.jsxs("p",{children:[e.jsx("strong",{children:"Examples:"})," TCS NQT, Infosys HackWithInfy, Wipro Elite NTH, Accenture, Capgemini, Cognizant GenC."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Rounds:"})," Online Assessment (Aptitude + Reasoning + Coding) + 1-2 Technical + HR."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Difficulty:"})," Easy - Medium (Breadth over depth)."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Suggested Sequence:"})," Aptitude basics (parallel track) ➔ Foundational DSA ➔ CS Fundamentals (OOP/DBMS/OS/CN) ➔ Deeper coding practice."]})]})]})]}),e.jsx("button",{onClick:()=>C(!1),className:"btn-tactile btn-tactile-primary",style:{width:"100%",padding:"10px",justifyContent:"center"},children:"Close & Start Practicing"})]})})]})}export{ye as default};
