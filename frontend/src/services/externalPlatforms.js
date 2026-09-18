// Curated external coding platforms. Clicking a card opens the official site.
// Logos are drawn as inline brand marks (no external image dependency).
export const EXTERNAL_PLATFORMS = [
  {
    id: "leetcode",
    name: "LeetCode",
    tagline: "DSA interview problems",
    url: "https://leetcode.com/problemset/",
    accent: "from-amber-400 to-orange-600",
    mark: "LC",
  },
  {
    id: "gfg",
    name: "GeeksforGeeks",
    tagline: "DSA + interview prep",
    url: "https://www.geeksforgeeks.org/explore",
    accent: "from-emerald-500 to-green-700",
    mark: "GfG",
  },
  {
    id: "w3schools",
    name: "W3Schools",
    tagline: "Learn web tech fast",
    url: "https://www.w3schools.com/",
    accent: "from-lime-400 to-emerald-600",
    mark: "W3",
  },
  {
    id: "prepinsta",
    name: "PrepInsta",
    tagline: "Placement papers & drills",
    url: "https://prepinsta.com/",
    accent: "from-sky-400 to-blue-700",
    mark: "PI",
  },
];

// Daily LeetCode spotlight — rotates through the week so dashboard always
// has one "touch to open on LeetCode" problem next to the MCQs.
export const LEETCODE_DAILY = [
  { day: "Monday", title: "Two Sum", slug: "two-sum", difficulty: "Easy" },
  { day: "Tuesday", title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "Easy" },
  { day: "Wednesday", title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", difficulty: "Easy" },
  { day: "Thursday", title: "Add Two Numbers", slug: "add-two-numbers", difficulty: "Medium" },
  { day: "Friday", title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", difficulty: "Medium" },
  { day: "Saturday", title: "Merge Intervals", slug: "merge-intervals", difficulty: "Medium" },
  { day: "Sunday", title: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays", difficulty: "Hard" },
];

export const leetcodeUrl = (slug) => "https://leetcode.com/problems/" + slug + "/";