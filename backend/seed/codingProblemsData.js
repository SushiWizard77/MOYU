// Seed coding problems for the MOYU Coding Lab.
// Each problem has 3 levels (Easy warm-up / Medium edge cases / Hard challenge).
// Every level carries real test cases plus verified solutions in Python, Java, C and C++.

// PART1
const STARTER = {
  python: "def solve():\n    import sys\n    data = sys.stdin.read()\n    # TODO: implement the solution\n    print(data)\n\nsolve()\n",
  java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // TODO: implement the solution\n    }\n}\n",
  c: "#include <stdio.h>\n\nint main(void) {\n    // TODO: implement the solution\n    return 0;\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // TODO: implement the solution\n    return 0;\n}\n",
};

function buildLevels(title, base, solution, defs) {
  return defs.map((l, i) => ({
    stage: l.stage,
    title: "Level " + (i + 1) + ": " + l.levelTitle + " - " + title,
    index: i,
    statement: base.statement + " " + l.focus,
    approach: base.approach + (l.approachTip ? " " + l.approachTip : ""),
    explanation: base.explanation + (l.explainTip ? " " + l.explainTip : ""),
    starterCode: { ...STARTER },
    testCases: l.testCases,
    solution: { ...solution },
  }));
}

const SUM_SOLUTION = {
  python: "import sys\n\ndef solve():\n    data = sys.stdin.read().strip().split()\n    if not data:\n        print(0)\n        return\n    print(sum(map(int, data)))\n\nsolve()\n",
  java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long sum = 0;\n        boolean any = false;\n        while (sc.hasNextLong()) { sum += sc.nextLong(); any = true; }\n        System.out.println(any ? sum : 0);\n    }\n}\n",
  c: "#include <stdio.h>\n\nint main(void) {\n    long long x, sum = 0;\n    int any = 0;\n    while (scanf(\"%lld\", &x) == 1) { sum += x; any = 1; }\n    printf(\"%lld\\n\", any ? sum : 0);\n    return 0;\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    long long x, sum = 0;\n    bool any = false;\n    while (cin >> x) { sum += x; any = true; }\n    cout << (any ? sum : 0) << \"\\n\";\n    return 0;\n}\n",
};

const REVERSE_SOLUTION = {
  python: "import sys\n\ndef solve():\n    s = sys.stdin.read().rstrip(\"\\n\")\n    print(s[::-1])\n\nsolve()\n",
  java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        StringBuilder sb = new StringBuilder();\n        while (sc.hasNextLine()) {\n            if (sb.length() > 0) sb.append(\"\\n\");\n            sb.append(sc.nextLine());\n        }\n        System.out.println(sb.reverse().toString());\n    }\n}\n",
  c: "#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    static char s[20005];\n    if (!fgets(s, sizeof(s), stdin)) return 0;\n    size_t n = strlen(s);\n    while (n > 0 && (s[n-1] == '\\n' || s[n-1] == '\\r')) s[--n] = 0;\n    for (int i = (int)n - 1; i >= 0; i--) putchar(s[i]);\n    putchar('\\n');\n    return 0;\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    string s;\n    getline(cin, s);\n    reverse(s.begin(), s.end());\n    cout << s << \"\\n\";\n    return 0;\n}\n",
};

const PRIME_SOLUTION = {
  python: "import sys, math\n\ndef solve():\n    n = int(sys.stdin.read().strip())\n    if n < 2:\n        print('NOT PRIME')\n        return\n    if n % 2 == 0:\n        print('PRIME' if n == 2 else 'NOT PRIME')\n        return\n    r = int(math.isqrt(n))\n    for d in range(3, r + 1, 2):\n        if n % d == 0:\n            print('NOT PRIME')\n            return\n    print('PRIME')\n\nsolve()\n",
  java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long n = sc.nextLong();\n        System.out.println(isPrime(n) ? \"PRIME\" : \"NOT PRIME\");\n    }\n    static boolean isPrime(long n) {\n        if (n < 2) return false;\n        if (n % 2 == 0) return n == 2;\n        for (long d = 3; d * d <= n; d += 2) if (n % d == 0) return false;\n        return true;\n    }\n}\n",
  c: "#include <stdio.h>\n\nint main(void) {\n    long long n;\n    if (scanf(\"%lld\", &n) != 1) return 0;\n    int prime = 1;\n    if (n < 2) prime = 0;\n    else if (n % 2 == 0) prime = (n == 2);\n    else { for (long long d = 3; d * d <= n; d += 2) if (n % d == 0) { prime = 0; break; } }\n    printf(\"%s\\n\", prime ? \"PRIME\" : \"NOT PRIME\");\n    return 0;\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    long long n;\n    if (!(cin >> n)) return 0;\n    bool prime = true;\n    if (n < 2) prime = false;\n    else if (n % 2 == 0) prime = (n == 2);\n    else { for (long long d = 3; d * d <= n; d += 2) if (n % d == 0) { prime = false; break; } }\n    cout << (prime ? \"PRIME\" : \"NOT PRIME\") << \"\\n\";\n    return 0;\n}\n",
};

const FIB_SOLUTION = {
  python: "import sys\n\ndef solve():\n    n = int(sys.stdin.read().strip())\n    if n <= 1:\n        print(0)\n        return\n    if n == 2:\n        print(1)\n        return\n    a, b = 0, 1\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    print(b)\n\nsolve()\n",
  java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        if (n <= 1) { System.out.println(0); return; }\n        if (n == 2) { System.out.println(1); return; }\n        long a = 0, b = 1;\n        for (int i = 3; i <= n; i++) { long c = a + b; a = b; b = c; }\n        System.out.println(b);\n    }\n}\n",
  c: "#include <stdio.h>\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    if (n <= 1) { printf(\"0\\n\"); return 0; }\n    if (n == 2) { printf(\"1\\n\"); return 0; }\n    long long a = 0, b = 1;\n    for (int i = 3; i <= n; i++) { long long c = a + b; a = b; b = c; }\n    printf(\"%lld\\n\", b);\n    return 0;\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    if (n <= 1) { cout << 0 << \"\\n\"; return 0; }\n    if (n == 2) { cout << 1 << \"\\n\"; return 0; }\n    long long a = 0, b = 1;\n    for (int i = 3; i <= n; i++) { long long c = a + b; a = b; b = c; }\n    cout << b << \"\\n\";\n    return 0;\n}\n",
};

const TWO_SUM_SOLUTION = {
  python: "import sys\n\ndef solve():\n    data = sys.stdin.read().strip().split()\n    if len(data) < 2:\n        print('NO')\n        return\n    n, target = int(data[0]), int(data[1])\n    arr = list(map(int, data[2:2 + n]))\n    seen = set()\n    for x in arr:\n        if target - x in seen:\n            print('YES')\n            return\n        seen.add(x)\n    print('NO')\n\nsolve()\n",
  java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) { System.out.println(\"NO\"); return; }\n        int n = sc.nextInt();\n        if (!sc.hasNextInt()) { System.out.println(\"NO\"); return; }\n        int target = sc.nextInt();\n        Set<Integer> seen = new HashSet<>();\n        for (int i = 0; i < n && sc.hasNextInt(); i++) {\n            int x = sc.nextInt();\n            if (seen.contains(target - x)) { System.out.println(\"YES\"); return; }\n            seen.add(x);\n        }\n        System.out.println(\"NO\");\n    }\n}\n",
  c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n;\n    long long target;\n    if (scanf(\"%d %lld\", &n, &target) != 2) { printf(\"NO\\n\"); return 0; }\n    long long *a = malloc(sizeof(long long) * (n > 0 ? n : 1));\n    for (int i = 0; i < n; i++) scanf(\"%lld\", &a[i]);\n    for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) {\n        if (a[i] + a[j] == target) { printf(\"YES\\n\"); free(a); return 0; }\n    }\n    printf(\"NO\\n\");\n    free(a);\n    return 0;\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    long long target;\n    if (!(cin >> n >> target)) { cout << \"NO\\n\"; return 0; }\n    unordered_set<long long> seen;\n    for (int i = 0; i < n; i++) {\n        long long x;\n        cin >> x;\n        if (seen.count(target - x)) { cout << \"YES\\n\"; return 0; }\n        seen.insert(x);\n    }\n    cout << \"NO\\n\";\n    return 0;\n}\n",
};

const VOWEL_SOLUTION = {
  python: "import sys\n\ndef solve():\n    s = sys.stdin.read()\n    print(sum(1 for ch in s if ch.lower() in 'aeiou'))\n\nsolve()\n",
  java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int count = 0;\n        while (sc.hasNextLine()) {\n            String line = sc.nextLine().toLowerCase();\n            for (char ch : line.toCharArray()) if (\"aeiou\".indexOf(ch) >= 0) count++;\n        }\n        System.out.println(count);\n    }\n}\n",
  c: "#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    int ch, count = 0;\n    while ((ch = getchar()) != EOF) {\n        ch = tolower(ch);\n        if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') count++;\n    }\n    printf(\"%d\\n\", count);\n    return 0;\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    string s((istreambuf_iterator<char>(cin)), istreambuf_iterator<char>());\n    int count = 0;\n    for (char ch : s) {\n        char c = tolower((unsigned char)ch);\n        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') count++;\n    }\n    cout << count << \"\\n\";\n    return 0;\n}\n",
};

const PALIN_SOLUTION = {
  python: "import sys\n\ndef solve():\n    s = ''.join(sys.stdin.read().split())\n    print('YES' if s == s[::-1] else 'NO')\n\nsolve()\n",
  java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        StringBuilder sb = new StringBuilder();\n        while (sc.hasNext()) sb.append(sc.next());\n        String s = sb.toString();\n        String r = new StringBuilder(s).reverse().toString();\n        System.out.println(s.equals(r) ? \"YES\" : \"NO\");\n    }\n}\n",
  c: "#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\n\nint main(void) {\n    static char s[20005];\n    size_t n = 0;\n    int ch;\n    while ((ch = getchar()) != EOF) {\n        if (!isspace(ch) && n + 1 < sizeof(s)) s[n++] = ch;\n    }\n    s[n] = 0;\n    int ok = 1;\n    for (size_t i = 0; i < n / 2; i++) if (s[i] != s[n - 1 - i]) { ok = 0; break; }\n    printf(\"%s\\n\", ok ? \"YES\" : \"NO\");\n    return 0;\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    string t, s;\n    while (cin >> t) s += t;\n    string r = s;\n    reverse(r.begin(), r.end());\n    cout << (s == r ? \"YES\" : \"NO\") << \"\\n\";\n    return 0;\n}\n",
};

const FACT_SOLUTION = {
  python: "import sys\n\ndef solve():\n    n = int(sys.stdin.read().strip())\n    f = 1\n    for i in range(2, n + 1):\n        f *= i\n    print(f)\n\nsolve()\n",
  java: "import java.util.*;\nimport java.math.BigInteger;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        BigInteger f = BigInteger.ONE;\n        for (int i = 2; i <= n; i++) f = f.multiply(BigInteger.valueOf(i));\n        System.out.println(f);\n    }\n}\n",
  c: "#include <stdio.h>\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    long long f = 1;\n    for (int i = 2; i <= n; i++) f *= i;\n    printf(\"%lld\\n\", f);\n    return 0;\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    long long f = 1;\n    for (int i = 2; i <= n; i++) f *= i;\n    cout << f << \"\\n\";\n    return 0;\n}\n",
};

const MAX_SOLUTION = {
  python: "import sys\n\ndef solve():\n    data = list(map(int, sys.stdin.read().strip().split()))\n    if not data:\n        print(0)\n        return\n    n = data[0]\n    arr = data[1:1 + n] if len(data) - 1 >= n else data\n    print(max(arr))\n\nsolve()\n",
  java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Long> all = new ArrayList<>();\n        while (sc.hasNextLong()) all.add(sc.nextLong());\n        if (all.isEmpty()) { System.out.println(0); return; }\n        int n = all.get(0).intValue();\n        List<Long> arr = all.size() - 1 >= n ? all.subList(1, 1 + n) : all;\n        long mx = arr.get(0);\n        for (long x : arr) mx = Math.max(mx, x);\n        System.out.println(mx);\n    }\n}\n",
  c: "#include <stdio.h>\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) { printf(\"0\\n\"); return 0; }\n    long long x, mx = 0;\n    int first = 1;\n    for (int i = 0; i < n; i++) {\n        if (scanf(\"%lld\", &x) != 1) break;\n        if (first || x > mx) { mx = x; first = 0; }\n    }\n    printf(\"%lld\\n\", first ? 0 : mx);\n    return 0;\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    if (!(cin >> n)) { cout << 0 << \"\\n\"; return 0; }\n    long long x, mx = 0;\n    bool first = true;\n    for (int i = 0; i < n; i++) {\n        if (!(cin >> x)) break;\n        if (first || x > mx) { mx = x; first = false; }\n    }\n    cout << (first ? 0 : mx) << \"\\n\";\n    return 0;\n}\n",
};

const FIZZ_SOLUTION = {
  python: "import sys\n\ndef solve():\n    n = int(sys.stdin.read().strip())\n    out = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            out.append('FizzBuzz')\n        elif i % 3 == 0:\n            out.append('Fizz')\n        elif i % 5 == 0:\n            out.append('Buzz')\n        else:\n            out.append(str(i))\n    sys.stdout.write(' '.join(out))\n\nsolve()\n",
  java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        StringBuilder sb = new StringBuilder();\n        for (int i = 1; i <= n; i++) {\n            if (i > 1) sb.append(' ');\n            if (i % 15 == 0) sb.append(\"FizzBuzz\");\n            else if (i % 3 == 0) sb.append(\"Fizz\");\n            else if (i % 5 == 0) sb.append(\"Buzz\");\n            else sb.append(i);\n        }\n        System.out.println(sb.toString());\n    }\n}\n",
  c: "#include <stdio.h>\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    for (int i = 1; i <= n; i++) {\n        if (i > 1) putchar(' ');\n        if (i % 15 == 0) printf(\"FizzBuzz\");\n        else if (i % 3 == 0) printf(\"Fizz\");\n        else if (i % 5 == 0) printf(\"Buzz\");\n        else printf(\"%d\", i);\n    }\n    putchar('\\n');\n    return 0;\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    for (int i = 1; i <= n; i++) {\n        if (i > 1) cout << ' ';\n        if (i % 15 == 0) cout << \"FizzBuzz\";\n        else if (i % 3 == 0) cout << \"Fizz\";\n        else if (i % 5 == 0) cout << \"Buzz\";\n        else cout << i;\n    }\n    cout << \"\\n\";\n    return 0;\n}\n",
};

const codingProblems = [
  {
    title: "Sum of Array Elements",
    slug: "sum-of-array-elements",
    difficulty: "Easy",
    category: "Arrays",
    description: "Given space-separated integers, print their sum.",
    inputFormat: "Space-separated integers on one line.",
    outputFormat: "A single integer - the sum.",
    constraints: "Use a 64-bit accumulator.",
    tags: ["arrays", "math"],
    levels: buildLevels("Sum of Array Elements",
      {
        statement: "Read all integers from standard input and print their sum.",
        approach: "Read every integer until end of input, keep a running total, print it once.",
        explanation: "A single pass with O(1) extra memory is optimal.",
      },
      SUM_SOLUTION,
      [
        { stage: "Easy", levelTitle: "Warm-up", focus: "Level 1: small positive lists.", testCases: [{ input: "1 2 3 4 5", output: "15" }, { input: "10 20", output: "30" }] },
        { stage: "Medium", levelTitle: "Edge cases", focus: "Level 2: negatives, zeros and single element.", approachTip: "Zero and a single element are valid inputs.", testCases: [{ input: "10 -3 7", output: "14" }, { input: "0 0 0", output: "0" }, { input: "42", output: "42" }] },
        { stage: "Hard", levelTitle: "Full challenge", focus: "Level 3: large values needing 64-bit.", approachTip: "Use long / long long, not 32-bit int.", testCases: [{ input: "1000000 2000000 3000000", output: "6000000" }, { input: "-1000000 -2000000 3000000", output: "0" }] },
      ]),
  },
  {
    title: "Reverse a String",
    slug: "reverse-a-string",
    difficulty: "Easy",
    category: "Strings",
    description: "Read one line of text and print it reversed.",
    inputFormat: "A single line of text.",
    outputFormat: "The reversed text on one line.",
    constraints: "Length up to 10000.",
    tags: ["strings", "two-pointers"],
    levels: buildLevels("Reverse a String",
      {
        statement: "Read one line from standard input and print it reversed.",
        approach: "Read the line (keep spaces), then print characters from the end to the start.",
        explanation: "Two pointers from both ends, or a simple reverse loop, solves it in O(n).",
      },
      REVERSE_SOLUTION,
      [
        { stage: "Easy", levelTitle: "Warm-up", focus: "Level 1: simple words.", testCases: [{ input: "hello", output: "olleh" }, { input: "MOYU", output: "UYOM" }] },
        { stage: "Medium", levelTitle: "Edge cases", focus: "Level 2: sentences and palindromes.", testCases: [{ input: "hello world", output: "dlrow olleh" }, { input: "madam", output: "madam" }, { input: "a", output: "a" }] },
        { stage: "Hard", levelTitle: "Full challenge", focus: "Level 3: mixed case and digits.", testCases: [{ input: "Abc 123 XyZ", output: "ZyX 321 cbA" }, { input: "racecar 12321", output: "12321 racecar" }] },
      ]),
  },
  {
    title: "Check Prime Number",
    slug: "check-prime-number",
    difficulty: "Easy",
    category: "Math",
    description: "Read an integer n and print PRIME if prime, else NOT PRIME.",
    inputFormat: "A single integer n (1 <= n <= 10^9).",
    outputFormat: "PRIME or NOT PRIME.",
    constraints: "Use O(sqrt n) trial division.",
    tags: ["math", "number-theory"],
    levels: buildLevels("Check Prime Number",
      {
        statement: "Read integer n and print PRIME if it is prime, otherwise NOT PRIME.",
        approach: "Handle n < 2 and even numbers first, then test odd divisors up to sqrt(n).",
        explanation: "Trial division up to sqrt(n) is enough because any factor pair has one factor at or below sqrt(n).",
      },
      PRIME_SOLUTION,
      [
        { stage: "Easy", levelTitle: "Warm-up", focus: "Level 1: small numbers.", testCases: [{ input: "7", output: "PRIME" }, { input: "10", output: "NOT PRIME" }] },
        { stage: "Medium", levelTitle: "Edge cases", focus: "Level 2: 1, 2 and even numbers.", testCases: [{ input: "1", output: "NOT PRIME" }, { input: "2", output: "PRIME" }, { input: "4", output: "NOT PRIME" }] },
        { stage: "Hard", levelTitle: "Full challenge", focus: "Level 3: large primes near 10^9.", testCases: [{ input: "999999937", output: "PRIME" }, { input: "1000000000", output: "NOT PRIME" }] },
      ]),
  },
  {
    title: "Fibonacci Nth Term",
    slug: "fibonacci-nth-term",
    difficulty: "Easy",
    category: "Math",
    description: "Given n, print the nth Fibonacci number with fib(1)=0, fib(2)=1.",
    inputFormat: "A single integer n (1 <= n <= 90).",
    outputFormat: "The nth Fibonacci number.",
    constraints: "Use iteration, not recursion.",
    tags: ["math", "dp", "fibonacci"],
    levels: buildLevels("Fibonacci Nth Term",
      {
        statement: "Read n and print fib(n) where fib(1)=0, fib(2)=1, fib(n)=fib(n-1)+fib(n-2).",
        approach: "Iterate from 3 to n keeping only the last two values.",
        explanation: "Iteration is O(n) time and O(1) memory; recursion recomputes the same values exponentially.",
      },
      FIB_SOLUTION,
      [
        { stage: "Easy", levelTitle: "Warm-up", focus: "Level 1: first few terms.", testCases: [{ input: "1", output: "0" }, { input: "6", output: "5" }] },
        { stage: "Medium", levelTitle: "Edge cases", focus: "Level 2: boundaries 2 and 10.", testCases: [{ input: "2", output: "1" }, { input: "10", output: "34" }] },
        { stage: "Hard", levelTitle: "Full challenge", focus: "Level 3: n=50 fits in 64-bit.", testCases: [{ input: "50", output: "7778742049" }, { input: "20", output: "4181" }] },
      ]),
  },
  {
    title: "Two Sum Exists",
    slug: "two-sum-exists",
    difficulty: "Medium",
    category: "Arrays",
    description: "Line 1: n and target. Line 2: n integers. Print YES if any two distinct elements sum to target.",
    inputFormat: "Line 1: n target. Line 2: n integers.",
    outputFormat: "YES or NO.",
    constraints: "1 <= n <= 10^5. Aim for O(n) with a hash set.",
    tags: ["arrays", "hashing", "two-pointers"],
    levels: buildLevels("Two Sum Exists",
      {
        statement: "Read n, target and the array, then print YES if any two distinct elements sum to target, else NO.",
        approach: "For each number, check whether target minus it was seen before; store seen numbers in a set.",
        explanation: "The hash-set complement check turns the O(n^2) pair search into a single O(n) pass.",
      },
      TWO_SUM_SOLUTION,
      [
        { stage: "Easy", levelTitle: "Warm-up", focus: "Level 1: obvious pairs.", testCases: [{ input: "4 9\n2 7 11 15", output: "YES" }, { input: "3 10\n1 2 3", output: "NO" }] },
        { stage: "Medium", levelTitle: "Edge cases", focus: "Level 2: duplicates and negatives.", testCases: [{ input: "2 6\n3 3", output: "YES" }, { input: "4 0\n-1 1 2 -2", output: "YES" }, { input: "1 5\n5", output: "NO" }] },
        { stage: "Hard", levelTitle: "Full challenge", focus: "Level 3: large values, no pair.", testCases: [{ input: "5 1000000\n100000 200000 300000 400000 500000", output: "NO" }, { input: "5 900000\n100000 200000 300000 400000 500000", output: "YES" }] },
      ]),
  },
  {
    title: "Count Vowels",
    slug: "count-vowels",
    difficulty: "Easy",
    category: "Strings",
    description: "Read a line of text and print the number of vowels (case-insensitive).",
    inputFormat: "A single line of text.",
    outputFormat: "A single integer - the vowel count.",
    constraints: "Count both upper and lower case vowels.",
    tags: ["strings", "counting"],
    levels: buildLevels("Count Vowels",
      {
        statement: "Read text from standard input and print how many vowels (a, e, i, o, u) it contains, ignoring case.",
        approach: "Lowercase each character and count membership in the vowel set.",
        explanation: "One linear scan is optimal; case-folding first avoids missing uppercase vowels.",
      },
      VOWEL_SOLUTION,
      [
        { stage: "Easy", levelTitle: "Warm-up", focus: "Level 1: simple words.", testCases: [{ input: "hello", output: "2" }, { input: "MOYU", output: "2" }] },
        { stage: "Medium", levelTitle: "Edge cases", focus: "Level 2: no vowels and full sentences.", testCases: [{ input: "rhythm", output: "0" }, { input: "Hello World", output: "3" }] },
        { stage: "Hard", levelTitle: "Full challenge", focus: "Level 3: mixed case sentences.", testCases: [{ input: "AEIOU aeiou", output: "10" }, { input: "Placement Ready 2026!", output: "5" }] },
      ]),
  },
  {
    title: "Palindrome Check",
    slug: "palindrome-check",
    difficulty: "Easy",
    category: "Strings",
    description: "Read a word and print YES if it is a palindrome, else NO.",
    inputFormat: "A single word.",
    outputFormat: "YES or NO.",
    constraints: "Compare characters from both ends.",
    tags: ["strings", "two-pointers"],
    levels: buildLevels("Palindrome Check",
      {
        statement: "Read a word and print YES if it reads the same forwards and backwards, otherwise NO.",
        approach: "Compare the first and last characters moving inward, or compare the string with its reverse.",
        explanation: "A two-pointer scan is O(n) time and O(1) memory.",
      },
      PALIN_SOLUTION,
      [
        { stage: "Easy", levelTitle: "Warm-up", focus: "Level 1: clear palindromes.", testCases: [{ input: "madam", output: "YES" }, { input: "hello", output: "NO" }] },
        { stage: "Medium", levelTitle: "Edge cases", focus: "Level 2: single letters and even length.", testCases: [{ input: "a", output: "YES" }, { input: "abba", output: "YES" }, { input: "abca", output: "NO" }] },
        { stage: "Hard", levelTitle: "Full challenge", focus: "Level 3: longer words.", testCases: [{ input: "racecar", output: "YES" }, { input: "placement", output: "NO" }] },
      ]),
  },
  {
    title: "Factorial of N",
    slug: "factorial-of-n",
    difficulty: "Easy",
    category: "Math",
    description: "Read n and print n factorial.",
    inputFormat: "A single integer n (0 <= n <= 12 for C/C++/Java long; Python handles bigger).",
    outputFormat: "n! as an integer.",
    constraints: "0! = 1. Use a loop.",
    tags: ["math", "loops"],
    levels: buildLevels("Factorial of N",
      {
        statement: "Read n and print the factorial of n.",
        approach: "Multiply all integers from 2 to n; start from 1 so that 0! = 1.",
        explanation: "A loop is O(n); Python big ints handle large n while C/Java need 64-bit for n <= 20.",
      },
      FACT_SOLUTION,
      [
        { stage: "Easy", levelTitle: "Warm-up", focus: "Level 1: small n.", testCases: [{ input: "5", output: "120" }, { input: "0", output: "1" }] },
        { stage: "Medium", levelTitle: "Edge cases", focus: "Level 2: 1 and 10.", testCases: [{ input: "1", output: "1" }, { input: "10", output: "3628800" }] },
        { stage: "Hard", levelTitle: "Full challenge", focus: "Level 3: 12! fits in 64-bit.", testCases: [{ input: "12", output: "479001600" }, { input: "7", output: "5040" }] },
      ]),
  },
  {
    title: "Find Maximum Element",
    slug: "find-maximum-element",
    difficulty: "Easy",
    category: "Arrays",
    description: "First number n, then n integers. Print the maximum.",
    inputFormat: "Line 1: n. Line 2: n integers.",
    outputFormat: "The maximum value.",
    constraints: "Track the max in one pass.",
    tags: ["arrays", "loops"],
    levels: buildLevels("Find Maximum Element",
      {
        statement: "Read n followed by n integers and print the largest.",
        approach: "Keep a running maximum while reading each number.",
        explanation: "One pass is optimal: O(n) time, O(1) memory.",
      },
      MAX_SOLUTION,
      [
        { stage: "Easy", levelTitle: "Warm-up", focus: "Level 1: positive lists.", testCases: [{ input: "5\n1 5 3 9 2", output: "9" }, { input: "3\n7 7 7", output: "7" }] },
        { stage: "Medium", levelTitle: "Edge cases", focus: "Level 2: negatives and single element.", testCases: [{ input: "4\n-5 -2 -9 -1", output: "-1" }, { input: "1\n42", output: "42" }] },
        { stage: "Hard", levelTitle: "Full challenge", focus: "Level 3: large values.", testCases: [{ input: "5\n1000000 999999 1000001 500000 1000001", output: "1000001" }, { input: "6\n-100 0 50 -20 50 49", output: "50" }] },
      ]),
  },
  {
    title: "FizzBuzz Classic",
    slug: "fizzbuzz-classic",
    difficulty: "Easy",
    category: "Logic",
    description: "Read n and print 1..n with Fizz/Buzz/FizzBuzz substitutions, space-separated.",
    inputFormat: "A single integer n.",
    outputFormat: "Numbers 1..n with multiples of 3 as Fizz, 5 as Buzz, 15 as FizzBuzz.",
    constraints: "Check 15 before 3 and 5.",
    tags: ["logic", "loops", "modulo"],
    levels: buildLevels("FizzBuzz Classic",
      {
        statement: "Read n and print 1..n space-separated, replacing multiples of 3 with Fizz, 5 with Buzz, both with FizzBuzz.",
        approach: "Loop 1..n; check divisibility by 15 first, then 3, then 5.",
        explanation: "Order matters: 15 is divisible by both 3 and 5, so test it first.",
      },
      FIZZ_SOLUTION,
      [
        { stage: "Easy", levelTitle: "Warm-up", focus: "Level 1: n=5.", testCases: [{ input: "5", output: "1 2 Fizz 4 Buzz" }, { input: "3", output: "1 2 Fizz" }] },
        { stage: "Medium", levelTitle: "Edge cases", focus: "Level 2: n=1 and n=15.", testCases: [{ input: "1", output: "1" }, { input: "15", output: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz" }] },
        { stage: "Hard", levelTitle: "Full challenge", focus: "Level 3: n=20.", testCases: [{ input: "20", output: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz 16 17 Fizz 19 Buzz" }] },
      ]),
  },
// PART2
];

module.exports = codingProblems;
