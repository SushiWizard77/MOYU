require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const Roadmap = require("../models/Roadmap");
const PracticeQuestion = require("../models/PracticeQuestion");
const Company = require("../models/Company");
const Resource = require("../models/Resource");
const Assessment = require("../models/Assessment");
const User = require("../models/User");
const CodingProblem = require("../models/CodingProblem");
const bcrypt = require("bcryptjs");

const { TOPIC_LINKS } = require("./learnData");
const codingProblemsData = require("./codingProblemsData");

const roadmaps = [
  {
    title: "Full Stack Developer Roadmap",
    slug: "full-stack-developer",
    description: "Become a job-ready full stack developer covering frontend, backend, and databases.",
    category: "Full Stack Developer",
    difficulty: "Intermediate",
    estimatedWeeks: 16,
    modules: [
      {
        title: "Frontend Foundations",
        topics: [
          { title: "HTML & CSS Fundamentals", estimatedHours: 6 },
          { title: "JavaScript Essentials", estimatedHours: 10 },
          { title: "React Basics", estimatedHours: 12 },
          { title: "State Management", estimatedHours: 8 },
        ],
      },
      {
        title: "Backend Foundations",
        topics: [
          { title: "Node.js & Express", estimatedHours: 10 },
          { title: "REST API Design", estimatedHours: 6 },
          { title: "Authentication & JWT", estimatedHours: 6 },
        ],
      },
      {
        title: "Databases",
        topics: [
          { title: "MongoDB & Mongoose", estimatedHours: 8 },
          { title: "SQL Fundamentals", estimatedHours: 8 },
        ],
      },
    ],
  },
  {
    title: "Software Developer Roadmap",
    slug: "software-developer",
    description: "Master core CS fundamentals and DSA for SDE interviews.",
    category: "Software Developer",
    difficulty: "Intermediate",
    estimatedWeeks: 12,
    modules: [
      {
        title: "Data Structures",
        topics: [
          { title: "Arrays & Strings", estimatedHours: 8 },
          { title: "Linked Lists", estimatedHours: 6 },
          { title: "Trees & Graphs", estimatedHours: 10 },
          { title: "Hashing", estimatedHours: 5 },
        ],
      },
      {
        title: "Algorithms",
        topics: [
          { title: "Sorting & Searching", estimatedHours: 6 },
          { title: "Dynamic Programming", estimatedHours: 10 },
          { title: "Greedy Algorithms", estimatedHours: 5 },
        ],
      },
      {
        title: "Core CS Subjects",
        topics: [
          { title: "Operating Systems", estimatedHours: 8 },
          { title: "DBMS", estimatedHours: 8 },
          { title: "Computer Networks", estimatedHours: 6 },
        ],
      },
    ],
  },
  {
    title: "Data Analyst Roadmap",
    slug: "data-analyst",
    description: "Learn data analysis, visualization, and SQL for analyst roles.",
    category: "Data Analyst",
    difficulty: "Beginner",
    estimatedWeeks: 10,
    modules: [
      {
        title: "Data Fundamentals",
        topics: [
          { title: "Excel for Analysis", estimatedHours: 5 },
          { title: "SQL for Data Analysis", estimatedHours: 8 },
          { title: "Statistics Basics", estimatedHours: 6 },
        ],
      },
      {
        title: "Visualization & Tools",
        topics: [
          { title: "Power BI / Tableau", estimatedHours: 8 },
          { title: "Python for Data Analysis", estimatedHours: 10 },
        ],
      },
    ],
  },
  {
    title: "AI/ML Roadmap",
    slug: "ai-ml",
    description: "Build a foundation in machine learning and applied AI.",
    category: "AI/ML",
    difficulty: "Advanced",
    estimatedWeeks: 18,
    modules: [
      {
        title: "Math & Python Foundations",
        topics: [
          { title: "Linear Algebra & Probability", estimatedHours: 10 },
          { title: "NumPy & Pandas", estimatedHours: 8 },
        ],
      },
      {
        title: "Machine Learning",
        topics: [
          { title: "Supervised Learning", estimatedHours: 12 },
          { title: "Unsupervised Learning", estimatedHours: 8 },
          { title: "Model Evaluation", estimatedHours: 6 },
        ],
      },
      {
        title: "Deep Learning",
        topics: [
          { title: "Neural Networks", estimatedHours: 12 },
          { title: "CNNs & RNNs", estimatedHours: 10 },
        ],
      },
    ],
  },
  {
    title: "Cloud/DevOps Roadmap",
    slug: "cloud-devops",
    description: "Learn cloud infrastructure, CI/CD, and containerization.",
    category: "Cloud/DevOps",
    difficulty: "Intermediate",
    estimatedWeeks: 12,
    modules: [
      {
        title: "Cloud Fundamentals",
        topics: [
          { title: "AWS / Azure Basics", estimatedHours: 10 },
          { title: "Networking & Security", estimatedHours: 6 },
        ],
      },
      {
        title: "DevOps Tooling",
        topics: [
          { title: "Docker & Containers", estimatedHours: 8 },
          { title: "CI/CD Pipelines", estimatedHours: 8 },
          { title: "Kubernetes Basics", estimatedHours: 10 },
        ],
      },
    ],
  },
];

const practiceQuestions = [
  { title: "Reverse an Array", category: "DSA", difficulty: "Easy", prompt: "What is the time complexity of reversing an array of size n in place?", options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"], correctOptionIndex: 2, tags: ["arrays"] },
  { title: "Binary Search Complexity", category: "DSA", difficulty: "Easy", prompt: "What is the time complexity of binary search on a sorted array?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctOptionIndex: 1, tags: ["searching"] },
  { title: "SQL JOIN Types", category: "SQL", difficulty: "Medium", prompt: "Which JOIN returns all rows from both tables, with NULLs where there is no match?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], correctOptionIndex: 3, tags: ["sql"] },
  { title: "Normalization", category: "SQL", difficulty: "Medium", prompt: "Which normal form removes transitive dependency?", options: ["1NF", "2NF", "3NF", "BCNF"], correctOptionIndex: 2, tags: ["dbms"] },
  { title: "Train and Platform", category: "Aptitude", difficulty: "Easy", prompt: "A train 120m long crosses a pole in 12 seconds. What is its speed in m/s?", options: ["8 m/s", "10 m/s", "12 m/s", "15 m/s"], correctOptionIndex: 1, tags: ["speed-distance"] },
  { title: "Percentages", category: "Aptitude", difficulty: "Easy", prompt: "40% of a number is 80. What is the number?", options: ["150", "180", "200", "220"], correctOptionIndex: 2, tags: ["percentages"] },
  { title: "Time Complexity of Merge Sort", category: "Technical MCQ", difficulty: "Medium", prompt: "What is the average time complexity of Merge Sort?", options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"], correctOptionIndex: 1, tags: ["sorting"] },
  { title: "Process vs Thread", category: "Technical MCQ", difficulty: "Medium", prompt: "Which statement is true about threads compared to processes?", options: ["Threads share memory space", "Threads have separate memory space", "Threads cannot run in parallel", "A process can only have one thread"], correctOptionIndex: 0, tags: ["os"] },
  { title: "Tell Me About Yourself", category: "Interview Question", difficulty: "Easy", prompt: "What is the primary goal of the 'Tell me about yourself' interview question?", options: ["Test coding skill", "Assess communication and fit", "Test math ability", "Check punctuality"], correctOptionIndex: 1, tags: ["hr"] },
  { title: "Strength/Weakness Framing", category: "Interview Question", difficulty: "Easy", prompt: "When discussing a weakness in an interview, it is best to also mention:", options: ["Nothing else", "How you are improving on it", "That it doesn't matter", "A different strength instead"], correctOptionIndex: 1, tags: ["hr"] },
  { title: "Two Sum Approach", category: "Coding", difficulty: "Easy", prompt: "Which data structure gives the most efficient approach to the Two Sum problem?", options: ["Array", "Hash Map", "Linked List", "Stack"], correctOptionIndex: 1, tags: ["hashing"] },
  { title: "Recursion Base Case", category: "Coding", difficulty: "Easy", prompt: "What happens if a recursive function has no base case?", options: ["It runs once", "It causes a stack overflow", "It returns null", "It runs in O(1)"], correctOptionIndex: 1, tags: ["recursion"] },
  { title: "React State Update", category: "Coding", difficulty: "Easy", prompt: "In React, which hook is used to manage local component state in a functional component?", options: ["useState", "useRef", "useMemo", "useContext"], correctOptionIndex: 0, tags: ["react", "javascript"] },
  { title: "JavaScript Hoisting", category: "Coding", difficulty: "Medium", prompt: "What is the keyword used to declare a variable that cannot be reassigned in JavaScript?", options: ["let", "const", "var", "static"], correctOptionIndex: 1, tags: ["javascript"] },
  { title: "Express Route", category: "Coding", difficulty: "Easy", prompt: "In Node.js/Express, which method registers a route for the GET HTTP verb?", options: ["app.post()", "app.send()", "app.get()", "app.route(0)"], correctOptionIndex: 2, tags: ["node", "express"] },
  { title: "REST API Status", category: "Technical MCQ", difficulty: "Easy", prompt: "Which HTTP status code indicates a resource was created successfully?", options: ["200", "201", "204", "301"], correctOptionIndex: 1, tags: ["api", "rest"] },
  { title: "MongoDB Query", category: "Technical MCQ", difficulty: "Medium", prompt: "Which MongoDB method is used to find a single document matching a query?", options: ["findOne()", "findAll()", "query()", "fetch()"], correctOptionIndex: 0, tags: ["mongodb", "database"] },
  { title: "JWT Purpose", category: "Technical MCQ", difficulty: "Easy", prompt: "What is the main purpose of a JWT (JSON Web Token)?", options: ["Encrypt passwords", "Securely transmit claims between parties", "Store files", "Cache API responses"], correctOptionIndex: 1, tags: ["auth", "jwt", "security"] },
  { title: "SQL GROUP BY", category: "SQL", difficulty: "Medium", prompt: "Which clause is used with aggregate functions like COUNT and SUM to group rows?", options: ["ORDER BY", "GROUP BY", "HAVING only", "DISTINCT"], correctOptionIndex: 1, tags: ["sql"] },
  { title: "Two Pointer Pattern", category: "DSA", difficulty: "Easy", prompt: "The two-pointer technique is most useful for which type of problem?", options: ["Finding a pair in a sorted array", "Traversing a binary tree", "Recursion", "Sorting a linked list by value"], correctOptionIndex: 0, tags: ["arrays", "two-pointer"] },
  { title: "Linked List Cycle", category: "DSA", difficulty: "Medium", prompt: "Which algorithm detects a cycle in a linked list efficiently?", options: ["Bubble sort", "Floyd's Tortoise and Hare", "Binary search", "Merge sort"], correctOptionIndex: 1, tags: ["linked", "cycle"] },
  { title: "Graph BFS", category: "DSA", difficulty: "Medium", prompt: "Which data structure is used to implement BFS (Breadth-First Search) on a graph?", options: ["Stack", "Queue", "Heap", "Hash table"], correctOptionIndex: 1, tags: ["graph", "bfs"] },
  { title: "Hash Collision", category: "Coding", difficulty: "Medium", prompt: "Chaining is a technique used in hashing to handle:", options: ["Sorting", "Collisions", "Rehashing keys", "Tree rotation"], correctOptionIndex: 1, tags: ["hashing", "hash"] },
  { title: "Dynamic Programming", category: "Coding", difficulty: "Medium", prompt: "Memoization in dynamic programming helps avoid:", options: ["Memory leaks", "Recomputing the same subproblems", "Infinite loops", "Stack overflow always"], correctOptionIndex: 1, tags: ["dynamic", "programming", "dp"] },
  { title: "Greedy Approach", category: "Coding", difficulty: "Medium", prompt: "A greedy algorithm is one that:", options: ["Explores all states exhaustively", "Makes the locally optimal choice at each step", "Always finds the global optimum for every problem", "Uses divide and conquer only"], correctOptionIndex: 1, tags: ["greedy", "algorithm"] },
/*Q2*/
  { title: "Deadlock Conditions", category: "Technical MCQ", difficulty: "Hard", prompt: "Which of these is NOT one of the four necessary conditions for deadlock?", options: ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"], correctOptionIndex: 2, tags: ["os", "operating", "deadlock"] },
  { title: "DBMS Transaction", category: "Technical MCQ", difficulty: "Medium", prompt: "Which ACID property ensures that both operations in a transaction succeed or fail together?", options: ["Atomicity", "Consistency", "Isolation", "Durability"], correctOptionIndex: 0, tags: ["dbms", "transaction"] },
  { title: "TCP vs UDP", category: "Technical MCQ", difficulty: "Easy", prompt: "Which statement is TRUE about UDP compared to TCP?", options: ["UDP guarantees delivery order", "UDP is connectionless and faster", "UDP provides congestion control", "UDP ensures reliable delivery"], correctOptionIndex: 1, tags: ["network", "networking"] },
  { title: "Clear Email", category: "Communication", difficulty: "Easy", prompt: "Which email subject line is the clearest and most professional?", options: ["Hey", "Re: urgent", "Internship Application — Software Engineer (Hexaware)", "Important!"], correctOptionIndex: 2, tags: ["communication"] },
  { title: "Active Listening", category: "Communication", difficulty: "Easy", prompt: "Active listening in a team discussion means:", options: ["Talking over others to finish faster", "Pausing, summarizing, and asking clarifying questions", "Only waiting for your turn to speak", "Taking notes but ignoring the speaker"], correctOptionIndex: 1, tags: ["communication"] },
  { title: "Group Discussion", category: "Communication", difficulty: "Medium", prompt: "The best way to participate in a group discussion is to:", options: ["Speak the most number of times", "Loudly disagree with everyone", "Contribute relevant points and build on others' ideas", "Stay silent and only nod"], correctOptionIndex: 2, tags: ["communication"] },
  { title: "Synonym of 'Abundant'", category: "Verbal", difficulty: "Easy", prompt: "Choose the word closest in meaning to 'ABUNDANT':", options: ["Scarce", "Plentiful", "Bare", "Meager"], correctOptionIndex: 1, tags: ["verbal", "vocabulary"] },
  { title: "Antonym of 'Transparent'", category: "Verbal", difficulty: "Easy", prompt: "Choose the word OPPOSITE in meaning to 'TRANSPARENT':", options: ["Clear", "Opaque", "Visible", "Lucid"], correctOptionIndex: 1, tags: ["verbal", "vocabulary"] },
  { title: "Time and Work", category: "Aptitude", difficulty: "Medium", prompt: "A and B can do a job in 12 and 18 days respectively. In how many days can they finish it together?", options: ["6 days", "7.2 days", "9 days", "10 days"], correctOptionIndex: 1, tags: ["aptitude", "time-work"] },
  { title: "Ratio and Proportion", category: "Aptitude", difficulty: "Easy", prompt: "If x : y = 3 : 4 and y : z = 5 : 6, what is x : z?", options: ["3 : 6", "5 : 8", "15 : 24", "5 : 6"], correctOptionIndex: 2, tags: ["aptitude", "ratio"] },
  { title: "Profit and Loss", category: "Aptitude", difficulty: "Medium", prompt: "An article is bought for ₹400 and sold for ₹480. What is the profit percentage?", options: ["15%", "20%", "25%", "12.5%"], correctOptionIndex: 1, tags: ["aptitude", "profit-loss"] },
  { title: "Probability Basics", category: "Aptitude", difficulty: "Medium", prompt: "What is the probability of getting an even number when a fair die is rolled once?", options: ["1/2", "1/3", "1/6", "2/3"], correctOptionIndex: 0, tags: ["aptitude", "probability"] },
  { title: "HTML Tag Purpose", category: "Coding", difficulty: "Easy", prompt: "Which HTML tag is used to create a hyperlink?", options: ["<a>", "<link>", "<href>", "<url>"], correctOptionIndex: 0, tags: ["html", "css", "frontend"] },
  { title: "CSS Box Model", category: "Coding", difficulty: "Easy", prompt: "In the CSS box model, which property adds space INSIDE the element edge, before the border?", options: ["margin", "padding", "border", "outline"], correctOptionIndex: 1, tags: ["css", "html"] },
  { title: "Python List vs Tuple", category: "Coding", difficulty: "Easy", prompt: "Which Python data structure is IMMUTABLE?", options: ["list", "tuple", "dict", "set"], correctOptionIndex: 1, tags: ["python"] },
  { title: "Excel VLOOKUP", category: "Coding", difficulty: "Medium", prompt: "In Excel, which function looks up a value in the first column and returns a value in the same row from another column?", options: ["SUMIF", "VLOOKUP", "COUNTIF", "INDEX only"], correctOptionIndex: 1, tags: ["excel", "data-analysis"] },
  { title: "Mean vs Median", category: "Coding", difficulty: "Medium", prompt: "Which measure is MOST affected by extreme outliers in a dataset?", options: ["Median", "Mode", "Mean", "Range is unaffected by outliers"], correctOptionIndex: 2, tags: ["statistics", "data-analysis"] },
  { title: "Data Visualization", category: "Coding", difficulty: "Medium", prompt: "Which tool is a dedicated business intelligence and data visualization platform?", options: ["Notepad", "Power BI", "Excel only", "WinZip"], correctOptionIndex: 1, tags: ["powerbi", "tableau", "data-analysis"] },
  { title: "Git Commit", category: "Coding", difficulty: "Easy", prompt: "Which Git command records your changes to the local repository history?", options: ["git push", "git commit", "git merge", "git clone"], correctOptionIndex: 1, tags: ["git", "github"] },
  { title: "Cloud Computing", category: "Technical MCQ", difficulty: "Easy", prompt: "Which of these is a cloud computing service model?", options: ["FTP", "IaaS", "SMTP", "HTTP"], correctOptionIndex: 1, tags: ["cloud", "aws", "devops"] },
  { title: "Machine Learning", category: "Technical MCQ", difficulty: "Medium", prompt: "In supervised learning, the model is trained using:", options: ["Unlabeled data only", "Labeled input-output pairs", "Random numbers", "Only the test set"], correctOptionIndex: 1, tags: ["machine-learning", "ai", "python"] },
];

const companies = [
  {
    name: "TCS", industry: "IT Services", roles: ["Software Engineer", "Systems Engineer"],
    eligibility: "60% throughout academics, no active backlogs",
    skillsRequired: ["Java", "SQL", "DSA", "Aptitude"], difficulty: "Easy",
    interviewRounds: ["Aptitude Test", "Technical Interview", "HR Interview"],
    commonTopics: ["OOP Concepts", "SQL Queries", "Basic DSA"],
    codingExpectations: "Basic to intermediate DSA problems", aptitudeExpectations: "Quantitative + Logical reasoning",
    resources: [], logoLetter: "T", logoUrl: "https://www.google.com/s2/favicons?domain=tcs.com&sz=64",
  },
  {
    name: "Infosys", industry: "IT Services", roles: ["Systems Engineer", "Digital Specialist Engineer"],
    eligibility: "65% throughout academics", skillsRequired: ["Java", "Python", "DSA", "Aptitude", "Communication"],
    difficulty: "Easy", interviewRounds: ["Online Test", "Technical + HR Interview"],
    commonTopics: ["Pseudocode", "DSA Basics", "Communication"],
    codingExpectations: "Pseudocode-based coding", aptitudeExpectations: "Quant, verbal, logical reasoning",
    resources: [], logoLetter: "I", logoUrl: "https://www.google.com/s2/favicons?domain=infosys.com&sz=64",
  },
  {
    name: "Hexaware", industry: "IT Services & Consulting", roles: ["Software Engineer Trainee", "Graduate Engineer Trainee"],
    eligibility: "60% aggregate throughout academics, no active backlogs",
    skillsRequired: ["Java", "Python", "SQL", "DSA", "Aptitude", "Communication"],
    difficulty: "Medium", interviewRounds: ["Online Aptitude Test", "Technical Interview", "HR Interview"],
    commonTopics: ["OOP Concepts", "SQL Queries", "Basic DSA", "Aptitude"],
    codingExpectations: "Easy to medium DSA problems and basic programming", aptitudeExpectations: "Quantitative + Logical + Verbal reasoning",
    resources: [], logoLetter: "H", logoUrl: "https://www.google.com/s2/favicons?domain=hexaware.com&sz=64",
  },
  {
    name: "Wipro", industry: "IT Services", roles: ["Project Engineer"],
    eligibility: "60% throughout academics", skillsRequired: ["Aptitude", "Communication", "Basic Coding"],
    difficulty: "Easy", interviewRounds: ["Online Test", "HR Interview"],
    commonTopics: ["Aptitude", "Verbal Ability"], codingExpectations: "Simple programs",
    aptitudeExpectations: "Quant + Logical + Verbal", resources: [], logoLetter: "W", logoUrl: "https://www.google.com/s2/favicons?domain=wipro.com&sz=64",
  },
  {
    name: "Zoho", industry: "Product / SaaS", roles: ["Software Developer"],
    eligibility: "No strict CGPA cutoff, strong problem solving", skillsRequired: ["DSA", "OOP", "SQL", "Aptitude"],
    difficulty: "Hard", interviewRounds: ["Written Test", "Coding Round", "Technical Interview", "HR Interview"],
    commonTopics: ["Puzzles", "DSA", "OOP Design"], codingExpectations: "Strong DSA + puzzle solving",
    aptitudeExpectations: "Logical reasoning heavy", resources: [], logoLetter: "Z", logoUrl: "https://www.google.com/s2/favicons?domain=zoho.com&sz=64",
  },
];

const resources = [
  { title: "Striver's SDE Sheet", description: "Curated DSA problem list covering all major topics.", category: "DSA", skill: "DSA", difficulty: "Intermediate", url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/", type: "Practice", tags: ["dsa", "interview"], provider: "TakeUForward", providerLogo: "https://www.google.com/s2/favicons?domain=takeuforward.org&sz=64" },
  { title: "MDN Web Docs - JavaScript", description: "Comprehensive JavaScript reference and guide.", category: "Frontend", skill: "JavaScript", difficulty: "Beginner", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", type: "Documentation", tags: ["javascript"], provider: "Mozilla", providerLogo: "https://www.google.com/s2/favicons?domain=developer.mozilla.org&sz=64" },
  { title: "SQL for Beginners", description: "Interactive SQL practice and tutorials.", category: "Database", skill: "SQL", difficulty: "Beginner", url: "https://sqlbolt.com/", type: "Course", tags: ["sql"], provider: "SQLBolt", providerLogo: "https://www.google.com/s2/favicons?domain=sqlbolt.com&sz=64" },
  { title: "System Design Primer", description: "Learn how to design large-scale systems.", category: "System Design", skill: "System Design", difficulty: "Advanced", url: "https://github.com/donnemartin/system-design-primer", type: "Documentation", tags: ["system-design"], provider: "GitHub", providerLogo: "https://www.google.com/s2/favicons?domain=github.com&sz=64" },
  { title: "GeeksforGeeks Aptitude", description: "Aptitude questions with solutions for placements.", category: "Aptitude", skill: "Aptitude", difficulty: "Beginner", url: "https://www.geeksforgeeks.org/aptitude-questions-and-answers/", type: "Practice", tags: ["aptitude"], provider: "GeeksforGeeks", providerLogo: "https://www.google.com/s2/favicons?domain=geeksforgeeks.org&sz=64" },
  { title: "Operating System Concepts", description: "Core OS concepts explained with examples.", category: "Core Subjects", skill: "Operating Systems", difficulty: "Intermediate", url: "https://www.geeksforgeeks.org/operating-systems/", type: "Article", tags: ["os"], provider: "GeeksforGeeks", providerLogo: "https://www.google.com/s2/favicons?domain=geeksforgeeks.org&sz=64" },
  { title: "freeCodeCamp Full Stack", description: "Free full stack web development curriculum.", category: "Full Stack", skill: "Full Stack", difficulty: "Beginner", url: "https://www.freecodecamp.org/", type: "Course", tags: ["fullstack"], provider: "freeCodeCamp", providerLogo: "https://www.google.com/s2/favicons?domain=freecodecamp.org&sz=64" },
  { title: "Resume Tips for Freshers", description: "How to write a placement-ready resume.", category: "Resume", skill: "Resume", difficulty: "Beginner", url: "https://www.naukri.com/campus/resume-tips", type: "Article", tags: ["resume"], provider: "Naukri", providerLogo: "https://www.google.com/s2/favicons?domain=naukri.com&sz=64" },
  { title: "PrepInsta Aptitude Preparation", description: "Complete aptitude (Quant, Logical & Verbal) practice with video solutions — the #1 placement aptitude resource.", category: "Aptitude", skill: "Aptitude", difficulty: "Beginner", url: "https://prepinsta.com/learn-aptitude/", type: "Practice", tags: ["aptitude", "quant", "reasoning", "verbal"], provider: "PrepInsta", providerLogo: "https://www.google.com/s2/favicons?domain=prepinsta.com&sz=64" },
  { title: "PrepInsta Top 500 Codes", description: "Company-wise coding questions and solutions for placements.", category: "Coding", skill: "Coding", difficulty: "Intermediate", url: "https://prepinsta.com/top-500-codes/", type: "Practice", tags: ["coding", "programming"], provider: "PrepInsta", providerLogo: "https://www.google.com/s2/favicons?domain=prepinsta.com&sz=64" },
  { title: "PrepInsta Soft Skills & Communication", description: "Communication and soft skills training for interviews and group discussions.", category: "Communication", skill: "Communication", difficulty: "Beginner", url: "https://prepinsta.com/soft-skills/", type: "Course", tags: ["communication", "soft-skills"], provider: "PrepInsta", providerLogo: "https://www.google.com/s2/favicons?domain=prepinsta.com&sz=64" },
];

const assessments = [
  {
    title: "DSA Fundamentals Check", category: "coding", description: "Quick check on core data structures and algorithms.", durationMinutes: 10,
    questions: [
      { prompt: "What is the worst-case time complexity of QuickSort?", options: ["O(n log n)", "O(n^2)", "O(log n)", "O(n)"], correctOptionIndex: 1 },
      { prompt: "Which data structure uses LIFO order?", options: ["Queue", "Stack", "Array", "Graph"], correctOptionIndex: 1 },
      { prompt: "What is the space complexity of an in-place bubble sort?", options: ["O(n)", "O(n^2)", "O(1)", "O(log n)"], correctOptionIndex: 2 },
    ],
  },
  {
    title: "Quantitative Aptitude Check", category: "aptitude", description: "Test your quantitative and logical reasoning speed.", durationMinutes: 8,
    questions: [
      { prompt: "If a car travels 60km in 1.5 hours, what is its average speed?", options: ["30 km/h", "40 km/h", "45 km/h", "50 km/h"], correctOptionIndex: 1 },
      { prompt: "What comes next: 2, 6, 12, 20, ?", options: ["28", "30", "26", "32"], correctOptionIndex: 1 },
    ],
  },
  {
    title: "DBMS Essentials", category: "dbms", description: "Core database management concepts.", durationMinutes: 8,
    questions: [
      { prompt: "What does ACID stand for in databases?", options: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Index, Data", "Aggregate, Compute, Index, Delete", "None of the above"], correctOptionIndex: 0 },
      { prompt: "Which key uniquely identifies a row in a table?", options: ["Foreign Key", "Primary Key", "Composite Key", "Candidate Key"], correctOptionIndex: 1 },
    ],
  },
  {
    title: "HR Interview Readiness", category: "hrInterview", description: "Common HR interview scenario questions.", durationMinutes: 6,
    questions: [
      { prompt: "What is the best approach when asked about salary expectations as a fresher?", options: ["Refuse to answer", "Give a researched range and stay flexible", "Demand a very high figure", "Say you don't need money"], correctOptionIndex: 1 },
      { prompt: "How should you handle a question about a past failure?", options: ["Deny ever failing", "Explain what you learned from it", "Blame someone else", "Change the topic"], correctOptionIndex: 1 },
    ],
  },
];

const run = async () => {
  await connectDB();

  await Promise.all([
    Roadmap.deleteMany({}),
    PracticeQuestion.deleteMany({}),
    Company.deleteMany({}),
    Resource.deleteMany({}),
    Assessment.deleteMany({}),
    CodingProblem.deleteMany({}),
  ]);

  // Attach read / free / paid learning links to every roadmap topic
  let topicsLinked = 0;
  for (const r of roadmaps) {
    for (const m of r.modules || []) {
      for (const t of m.topics || []) {
        const links = TOPIC_LINKS[t.title];
        if (links) {
          t.links = links;
          topicsLinked += 1;
        }
      }
    }
  }

  await Roadmap.insertMany(roadmaps);
  await PracticeQuestion.insertMany(practiceQuestions);
  await Company.insertMany(companies);
  await Resource.insertMany(resources);
  await Assessment.insertMany(assessments);
  await CodingProblem.insertMany(codingProblemsData);

  console.log(`🔗 Topic learning links attached: ${topicsLinked}/${roadmaps.reduce((a, r) => a + r.modules.reduce((b, m) => b + m.topics.length, 0), 0)} topics`);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@moyu.dev";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "MoyuAdmin@123";
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      await existingAdmin.save();
    }
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: "MOYU Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });
  }

  console.log(`✅ Admin account ready: ${adminEmail} / ${existingAdmin ? "(existing password kept)" : adminPassword}`);
  console.log("✅ MOYU seed data inserted successfully");
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((error) => {
  console.error("SEED ERROR:", error);
  process.exit(1);
});
