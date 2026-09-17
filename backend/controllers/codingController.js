const CodingProblem = require("../models/CodingProblem");
const UserProgress = require("../models/UserCodingProgress");

// Judge0 CE public community endpoint (Piston went whitelist-only in Feb 2026)
const JUDGE0_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

const LANGUAGE_MAP = {
  python: 71, // Python 3
  java: 62,   // Java (OpenJDK 13)
  c: 50,      // C (GCC)
  cpp: 54,    // C++ (GCC)
};

const normalize = (s) =>
  String(s === undefined || s === null ? "" : s)
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n+$/g, "")
    .trim();

// GET /api/v1/coding
const listProblems = async (req, res) => {
  try {
    const { difficulty, category } = req.query;
    const filter = {};
    if (difficulty && difficulty !== "All") filter.difficulty = difficulty;
    if (category && category !== "All") filter.category = category;
    const problems = await CodingProblem.find(filter)
      .select("-levels -starterCode -testCases")
      .sort({ difficulty: 1, title: 1 })
      .lean();
    res.json({ success: true, data: problems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/coding/:id
const getProblem = async (req, res) => {
  try {
    const { expandLevels } = req.query;
    const problem = await CodingProblem.findById(req.params.id).lean();
    if (!problem) return res.status(404).json({ success: false, message: "Problem not found" });

    // Get user progress for this problem
    const userProgress = await UserProgress.findOne({
      user: req.user.userId,
      problem: req.params.id,
    }).lean();

    const completedLevels = userProgress?.completedLevels || [];
    const unlockedLevelIndex = userProgress?.unlockedLevelIndex ?? 0;

    const levels = (problem.levels || []).map((lv, idx) => ({
      _id: lv._id,
      stage: lv.stage,
      title: lv.title,
      index: lv.index,
      statement: lv.statement,
      approach: lv.approach,
      explanation: lv.explanation,
      starterCode: lv.starterCode,
      testCases: expandLevels ? lv.testCases : undefined,
      solution: lv.solution,
      isCompleted: completedLevels.includes(idx),
      isUnlocked: idx <= unlockedLevelIndex,
    }));
    res.json({ success: true, data: { ...problem, levels, userProgress: { completedLevels, unlockedLevelIndex } } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Resolve which test cases to use for a given problem + optional level.
function resolveTestCases(problem, levelIndex) {
  if (Array.isArray(problem.levels) && problem.levels[levelIndex] && Array.isArray(problem.levels[levelIndex].testCases)) {
    return { testCases: problem.levels[levelIndex].testCases, level: problem.levels[levelIndex] };
  }
  return { testCases: problem.testCases || [], level: problem.levels && problem.levels[0] };
}

// POST /api/v1/coding/run  { problemId, language, code, levelIndex? }
const runCode = async (req, res) => {
  try {
    const { problemId, language, code, levelIndex } = req.body || {};
    if (!problemId || !code || !LANGUAGE_MAP[language]) {
      return res.status(400).json({ success: false, message: "problemId, language (python|java|c|cpp) and code are required" });
    }
    const problem = await CodingProblem.findById(problemId).lean();
    if (!problem) return res.status(404).json({ success: false, message: "Problem not found" });

    const levelIdx = typeof levelIndex === "number" ? levelIndex : 0;
    const { testCases, level } = resolveTestCases(problem, levelIdx);
    const lang = LANGUAGE_MAP[language];
    const results = [];
    let passed = 0;
    let compileError = "";

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      let stdout = "";
      let stderr = "";
      let status = "Succeeded";
      try {
        const r = await fetch(JUDGE0_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language_id: lang,
            source_code: String(code),
            stdin: `${String(tc.input || "")}\n`,
          }),
          signal: AbortSignal.timeout(25000),
        });
        if (!r.ok) throw new Error(`Judge returned ${r.status}`);
        const data = await r.json();
        stdout = data.stdout || "";
        stderr = data.stderr || "";
        const compileOutput = data.compile_output || "";
        const statusId = data.status && data.status.id;
        const statusDesc = (data.status && data.status.description) || "";
        if (statusId === 6) {
          compileError = compileOutput || stderr || "Compilation error";
          status = "Compilation Error";
          results.push({
            index: i + 1,
            input: tc.input,
            expected: tc.output,
            actual: "",
            stderr: compileError.slice(0, 2000),
            status,
            passed: false,
          });
          break;
        }
        if (statusId !== 3) {
          status = statusDesc || `Exit code ${statusId}`;
          if (statusId === 5) status = "Time Limit Exceeded";
        }
      } catch (e) {
        status = "Judge Unavailable";
        stderr = e.message;
      }

      const actual = normalize(stdout);
      const expected = normalize(tc.output);
      const passedThis = status === "Succeeded" && actual === expected;
      if (passedThis) passed += 1;
      results.push({
        index: i + 1,
        input: tc.input,
        expected: tc.output,
        actual: stdout.slice(0, 2000),
        stderr: (stderr || "").slice(0, 2000),
        status,
        passed: passedThis,
      });
    }

    const total = results.length;
    const allPassed = total > 0 && passed === total && !compileError;

    // Update user progress if all tests passed
    let updatedProgress = null;
    if (allPassed) {
      updatedProgress = await UserProgress.findOneAndUpdate(
        { user: req.user.userId, problem: problemId },
        {
          $addToSet: { completedLevels: levelIdx },
          $max: { unlockedLevelIndex: levelIdx + 1 },
        },
        { upsert: true, new: true }
      ).lean();
    }

    const nextLevelUnlocked = allPassed && levelIdx + 1 < (problem.levels || []).length;
    const completedLevels = updatedProgress?.completedLevels || (await UserProgress.findOne({ user: req.user.userId, problem: problemId }).select("completedLevels").lean())?.completedLevels || [];

    res.json({
      success: true,
      data: {
        levelIndex: levelIdx,
        isUnlocked: !!level,
        approach: level && level.approach,
        explanation: level && level.explanation,
        solution: level && level.solution,
        results,
        passed,
        total,
        allPassed,
        nextLevelUnlocked,
        completedLevels,
        summary: compileError ? "Compilation failed — fix the errors and try again" : allPassed ? `All ${total} test cases passed — level complete!` : `${passed}/${total} test cases passed`,
        compileError: compileError || undefined,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { listProblems, getProblem, runCode };
