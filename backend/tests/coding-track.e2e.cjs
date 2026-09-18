// TEMP E2E verification for the MOYU "Coding Progress / LeetCode Tracking" module.
// Runs against a live server (http://localhost:5000) and removes every row it creates.
require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const BASE = process.env.E2E_BASE || "http://localhost:5000/api/v1";
const stamp = Date.now();
// A real, public LeetCode account used only to exercise the auto-check success
// path (public read-only data, no credentials). NETWORK-DEPENDENT.
const LC_PUBLIC_USERNAME = process.env.E2E_LC_USERNAME || "lee215";

let pass = 0;
let fail = 0;
let skipped = 0;

function check(name, ok, detail) {
  if (ok) {
    pass += 1;
    console.log("  PASS  " + name);
  } else {
    fail += 1;
    console.log("  FAIL  " + name + (detail ? "  -> " + detail : ""));
  }
}

// For assertions that need live LeetCode access. LeetCode blocks datacenter
// IPs with HTTP 403, so these SKIP (never FAIL) when auto-check is unavailable.
function skipIf(condition, name, reason) {
  if (!condition) return false;
  skipped += 1;
  console.log("  SKIP  " + name + "  -> " + reason);
  return true;
}

async function call(method, path, opts) {
  const o = opts || {};
  const headers = { "Content-Type": "application/json" };
  if (o.token) headers.Authorization = "Bearer " + o.token;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: o.body === undefined ? undefined : JSON.stringify(o.body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch (e) {
    json = null;
  }
  return { status: res.status, body: json };
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require("../models/User");
  const CodingChallenge = require("../models/CodingChallenge");
  const CodingCompletion = require("../models/CodingCompletion");
  const CodingProfile = require("../models/CodingProfile");
  const GitHubConnection = require("../models/GitHubConnection");
  const Activity = require("../models/Activity");
  const { dayKeyInTimezone, addDays } = require("../utils/codingStreak");
  const { __test } = require("../controllers/codingTrackController");

  const created = { users: [], challenges: [] };

  // Pre-clean leftovers from any earlier crashed run so counts stay honest.
  const staleUsers = await User.find({ email: /^e2e\./ }).select("_id").lean();
  if (staleUsers.length) {
    const staleIds = staleUsers.map((u) => u._id);
    await CodingCompletion.deleteMany({ user: { $in: staleIds } });
    await CodingProfile.deleteMany({ user: { $in: staleIds } });
    await GitHubConnection.deleteMany({ user: { $in: staleIds } });
    await Activity.deleteMany({ user: { $in: staleIds } });
    await User.deleteMany({ _id: { $in: staleIds } });
    console.log("pre-clean: removed " + staleIds.length + " stale e2e user(s)");
  }
  const staleChallenges = await CodingChallenge.find({
    $or: [{ slug: /^e2e-/ }, { slug: /:\/\// }],
  }).select("_id").lean();
  if (staleChallenges.length) {
    await CodingChallenge.deleteMany({ _id: { $in: staleChallenges.map((c) => c._id) } });
    console.log("pre-clean: removed " + staleChallenges.length + " stale test challenge(s)");
  }

  try {
    const admin = await User.findOne({ role: "admin" });
    if (!admin) throw new Error("No admin user in DB — cannot run admin-path tests.");
    const adminToken = jwt.sign(
      { userId: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ---- setup: two throwaway students via the real register endpoint ----
    const mkStudent = async (label) => {
      const email = "e2e." + label + "." + stamp + "@moyu.test";
      const res = await call("POST", "/auth/register", {
        body: { name: "E2E " + label, email, password: "Test1234" },
      });
      if (!res.body || !res.body.token) {
        throw new Error("register failed for " + label + ": " + JSON.stringify(res.body));
      }
      created.users.push(res.body.user.id || res.body.user._id);
      return { token: res.body.token, id: res.body.user.id || res.body.user._id, email };
    };
    const a = await mkStudent("alpha");
    const b = await mkStudent("beta");
    // A third student with no completion today, used for the "stale streak"
    // case — student A already solved something today, so A can never report a
    // broken streak.
    const c = await mkStudent("gamma");
    console.log("setup: 3 students registered\n");

    console.log("--- 1. auth guard ---");
    let r = await call("GET", "/coding-track/stats");
    check("stats without token -> 401", r.status === 401, "got " + r.status);
    r = await call("GET", "/coding-track/stats", { token: "garbage.token.here" });
    check("stats with invalid token -> 401", r.status === 401, "got " + r.status);
    r = await call("GET", "/admin/coding-challenges", { token: a.token });
    check("student hitting admin route -> 403", r.status === 403, "got " + r.status);

    console.log("\n--- 2. admin challenge validation ---");
    const goodTitle = "E2E Two Sum " + stamp;
    // e2e- slug + high dayNumber keep this run isolated from the real seeded
    // challenge set (two-sum/day-1 etc.) that production data may contain.
    r = await call("POST", "/admin/coding-challenges", {
      token: adminToken,
      body: {
        title: goodTitle,
        slugOrUrl: "https://leetcode.com/problems/e2e-two-sum/",
        difficulty: "Easy",
        dayNumber: 9001,
        category: "Arrays",
      },
    });
    check("admin creates challenge -> 201", r.status === 201, "got " + r.status + " " + JSON.stringify(r.body));
    const challenge = r.body && r.body.data ? r.body.data : null;
    if (!challenge) {
      throw new Error("challenge create failed — cannot continue: " + JSON.stringify(r.body));
    }
    created.challenges.push(challenge._id);
    check("slug parsed from URL", challenge && challenge.slug === "e2e-two-sum", challenge && challenge.slug);
    check("url normalised to leetcode", challenge && /^https:\/\/leetcode\.com\/problems\/e2e-two-sum\/$/.test(challenge.url), challenge && challenge.url);

    r = await call("POST", "/admin/coding-challenges", {
      token: adminToken,
      body: { title: "Bad", slugOrUrl: "two-sum", difficulty: "Impossible", dayNumber: 2 },
    });
    check("fake difficulty rejected -> 400", r.status === 400, "got " + r.status);

    r = await call("POST", "/admin/coding-challenges", {
      token: adminToken,
      body: { title: "Bad", slugOrUrl: "https://evil.example.com/problems/x/", difficulty: "Easy", dayNumber: 3 },
    });
    check("non-leetcode URL rejected -> 400", r.status === 400, "got " + r.status);

    r = await call("POST", "/admin/coding-challenges", {
      token: adminToken,
      body: { title: "Bad", slugOrUrl: "two-sum", difficulty: "Easy" },
    });
    check("missing dayNumber rejected -> 400", r.status === 400, "got " + r.status);

    // duplicate slug/dayNumber must be a clean 409, never a 500
    r = await call("POST", "/admin/coding-challenges", {
      token: adminToken,
      body: {
        title: "Dup",
        slugOrUrl: "https://leetcode.com/problems/e2e-two-sum/",
        difficulty: "Easy",
        dayNumber: 9001,
      },
    });
    check("duplicate challenge slug/day -> 409", r.status === 409, "got " + r.status + " " + (r.body && r.body.message));

    console.log("\n--- 3. student: daily challenge + manual completion ---");
    r = await call("GET", "/coding-track/daily", { token: a.token });
    // The DB may hold real seeded challenges, so just assert the daily slot is
    // a valid active challenge the student has not completed yet.
    check(
      "daily returns an active challenge",
      !!(r.body && r.body.data && r.body.data.challenge && r.body.data.challenge.slug && r.body.data.challenge.isActive !== false),
      JSON.stringify(r.body && r.body.data && { slug: r.body.data.challenge.slug, day: r.body.data.challenge.dayNumber })
    );
    check("daily starts uncompleted", r.body && r.body.data && r.body.data.completed === false);

    r = await call("POST", "/coding-track/complete", {
      token: a.token,
      body: { challengeId: challenge._id, submissionUrl: "https://leetcode.com/problems/two-sum/submissions/123456/" },
    });
    check("manual completion -> 201", r.status === 201, "got " + r.status + " " + JSON.stringify(r.body && r.body.message));
    check("completion difficulty comes from challenge", r.body && r.body.data && r.body.data.completion.difficulty === "Easy", JSON.stringify(r.body && r.body.data && r.body.data.completion));
    check("completion linked to challenge", r.body && r.body.data && String(r.body.data.completion.challenge) === String(challenge._id));
    check("completion stores day key", !!(r.body && r.body.data && /^\d{4}-\d{2}-\d{2}$/.test(r.body.data.completion.completedDay)));
    const completionId = r.body && r.body.data ? r.body.data.completion._id : null;

    console.log("\n--- 4. duplicate + invalid input guards ---");
    r = await call("POST", "/coding-track/complete", { token: a.token, body: { challengeId: challenge._id } });
    check("same challenge twice -> 409", r.status === 409, "got " + r.status + " " + (r.body && r.body.message));
    r = await call("POST", "/coding-track/complete", { token: a.token, body: { slugOrUrl: "https://leetcode.com/problems/e2e-two-sum/", difficulty: "Easy" } });
    check("same slug twice -> 409", r.status === 409, "got " + r.status);
    r = await call("POST", "/coding-track/complete", { token: a.token, body: { slugOrUrl: "roman-to-integer", difficulty: "Legendary" } });
    check("fake difficulty on complete -> 400", r.status === 400, "got " + r.status + " " + (r.body && r.body.message));
    r = await call("POST", "/coding-track/complete", { token: a.token, body: { challengeId: new mongoose.Types.ObjectId().toString() } });
    check("unknown challenge id -> 404", r.status === 404, "got " + r.status);
    r = await call("POST", "/coding-track/complete", { token: a.token, body: { challengeId: "not-an-id" } });
    check("malformed challenge id -> 4xx (not 500)", r.status >= 400 && r.status < 500, "got " + r.status);
    r = await call("POST", "/coding-track/complete", { token: a.token, body: { challengeId: challenge._id, submissionUrl: "https://malicious.example.com/steal" } });
    check("non-leetcode submissionUrl -> 400/409", r.status === 400 || r.status === 409, "got " + r.status);

    console.log("\n--- 5. student isolation (no cross-student leakage) ---");
    r = await call("GET", "/coding-track/stats", { token: a.token });
    check("A totalSolved = 1", r.body && r.body.data && r.body.data.totalSolved === 1, JSON.stringify(r.body && r.body.data && r.body.data.totalSolved));
    check("A easy = 1, medium = 0, hard = 0", r.body && r.body.data.easy === 1 && r.body.data.medium === 0 && r.body.data.hard === 0, JSON.stringify(r.body && r.body.data));
    r = await call("GET", "/coding-track/stats", { token: b.token });
    check("B totalSolved = 0 (isolated)", r.body && r.body.data && r.body.data.totalSolved === 0, JSON.stringify(r.body && r.body.data && r.body.data.totalSolved));
    r = await call("GET", "/coding-track/daily", { token: b.token });
    check("B daily still uncompleted", r.body && r.body.data && r.body.data.completed === false);
    r = await call("POST", "/coding-track/github/sync", { token: b.token, body: { completionId: completionId, code: "print(1)" } });
    check("B cannot sync A's completion -> 404", r.status === 404, "got " + r.status + " " + (r.body && r.body.message));

    console.log("\n--- 6. streak: distinct calendar days, not problem count ---");
    const tz = "Asia/Kolkata";
    // Streak math is driven by CodingCompletion only, so B is deliberately not
    // linked to LeetCode here (a non-existent username would be rejected anyway).
    const today = dayKeyInTimezone(new Date(), tz);
    // Student B: 3 consecutive days (today, -1, -2) + a SECOND problem on today.
    const seed = [
      { slug: "e2e-streak-d0-a", day: 0, difficulty: "Medium", title: "Streak D0 A" },
      { slug: "e2e-streak-d0-b", day: 0, difficulty: "Hard", title: "Streak D0 B" },
      { slug: "e2e-streak-d1", day: -1, difficulty: "Easy", title: "Streak D1" },
      { slug: "e2e-streak-d2", day: -2, difficulty: "Medium", title: "Streak D2" },
    ];
    for (const s of seed) {
      const when = new Date(addDays(today, s.day) + "T12:00:00Z");
      await __test.recordCompletion({
        userId: b.id,
        slug: s.slug,
        title: s.title,
        difficulty: s.difficulty,
        source: "manual",
        submissionUrl: "",
        challengeId: null,
        completedAt: when,
        timezone: tz,
      });
    }
    r = await call("GET", "/coding-track/streak", { token: b.token });
    const st = r.body && r.body.data;
    check("current streak = 3 days (4 solves)", st && st.currentStreak === 3, JSON.stringify(st));
    check("longest streak = 3", st && st.longestStreak === 3, JSON.stringify(st));
    check("lastCompletedDay = today", st && st.lastCompletedDay === today, JSON.stringify(st) + " today=" + today);
    r = await call("GET", "/coding-track/stats", { token: b.token });
    const bs = r.body && r.body.data;
    check("B totalSolved = 4 (problems counted)", bs && bs.totalSolved === 4, JSON.stringify(bs && bs.totalSolved));
    check("B easy=1 medium=2 hard=1", bs && bs.easy === 1 && bs.medium === 2 && bs.hard === 1, JSON.stringify(bs));

    // A stale streak (last solve 5 days ago, nothing since) must report
    // current = 0 but keep longest = 1. Uses student C, who has no completion
    // today — a fresh solve on a 5-day-old date is the whole history.
    await __test.recordCompletion({
      userId: c.id, slug: "e2e-stale", title: "Stale", difficulty: "Easy", source: "manual",
      submissionUrl: "", challengeId: null,
      completedAt: new Date(addDays(today, -5) + "T12:00:00Z"), timezone: tz,
    });
    r = await call("GET", "/coding-track/streak", { token: c.token });
    check("stale streak -> current 0, longest 1", r.body && r.body.data.currentStreak === 0 && r.body.data.longestStreak === 1, JSON.stringify(r.body && r.body.data));

    console.log("\n--- 7. auto-check (verify) + manual fallback ---");
    r = await call("POST", "/coding-track/verify", { token: a.token });
    check("verify without LeetCode username -> 400", r.status === 400, "got " + r.status + " " + (r.body && r.body.message));
    r = await call("PATCH", "/coding-track/link", { token: a.token, body: { leetcodeUsername: "!!!bad!!!" } });
    check("invalid LeetCode username -> 400", r.status === 400, "got " + r.status);
    r = await call("PATCH", "/coding-track/link", { token: a.token, body: { leetcodeUsername: "e2enouser" + String(stamp).slice(-6) } });
    // LeetCode answers 200 + `matchedUser: null` for unknown handles, so a
    // definitive "does not exist" is a 400. When LeetCode blocks this host
    // (HTTP 403 from datacenter IPs) the handle is stored and auto-check is
    // flagged off instead, so the manual fallback keeps working.
    const lcReachable = r.status === 400;
    if (lcReachable) {
      check(
        "nonexistent username rejected by LeetCode lookup -> 400",
        /does not exist/.test((r.body && r.body.message) || ""),
        "got " + r.status + " " + (r.body && r.body.message)
      );
    } else {
      check(
        "LeetCode unreachable -> link still stored with auto-check flagged off",
        r.status === 200 && r.body && r.body.data && r.body.data.autoCheckAvailable === false,
        "got " + r.status + " " + JSON.stringify(r.body && r.body.data)
      );
      skipIf(true, "nonexistent username rejected by LeetCode lookup -> 400", "LeetCode blocked from this host (HTTP 403)");
    }

    // Linking is validated against LeetCode itself, so an account that does not
    // exist can never be stored (this is why the earlier fake link was refused).
    // Use a real public account to exercise the success path — read-only public
    // data, no credentials involved. NETWORK-DEPENDENT.
    r = await call("PATCH", "/coding-track/link", { token: b.token, body: { leetcodeUsername: LC_PUBLIC_USERNAME, timezone: tz } });
    check("link real public username -> 200", r.status === 200, "got " + r.status + " " + (r.body && r.body.message));
    const autoOk = !!(r.body && r.body.data && r.body.data.autoCheckAvailable);
    if (!skipIf(!autoOk, "link caches LeetCode global totals (display only)", "LeetCode blocked from this host (HTTP 403)")) {
      check(
        "link caches LeetCode global totals (display only)",
        r.body.data.leetcodeStats && r.body.data.leetcodeStats.totalSolved > 0,
        JSON.stringify(r.body && r.body.data && r.body.data.leetcodeStats)
      );
    }
    r = await call("GET", "/coding-track/link", { token: b.token });
    check("link persisted + readable", r.body && r.body.data && r.body.data.leetcodeUsername === LC_PUBLIC_USERNAME, JSON.stringify(r.body && r.body.data));

    r = await call("POST", "/coding-track/verify", { token: b.token });
    if (autoOk) {
      check(
        "verify with linked username -> 200",
        r.status === 200 && r.body && r.body.data && typeof r.body.data.verified === "number",
        "got " + r.status + " " + (r.body && r.body.message)
      );
      check(
        "verify reports how many new solves it imported",
        r.body && /Verified \d+ new solve|Already up to date|No Accepted/.test(r.body.message || ""),
        r.body && r.body.message
      );
      r = await call("POST", "/coding-track/verify", { token: b.token });
      check("verify is idempotent (no duplicate imports)", r.status === 200 && r.body.data.verified === 0, JSON.stringify(r.body && r.body.data && r.body.data.verified));
    } else {
      // Auto-check is genuinely unavailable: it must degrade to a clear 503 and
      // point at the manual fallback rather than blowing up as a generic 500.
      check(
        "verify degrades to 503 when LeetCode is unreachable (not 500)",
        r.status === 503 && r.body && r.body.data && r.body.data.autoCheckAvailable === false,
        "got " + r.status + " " + (r.body && r.body.message)
      );
      check("503 message points the student at the manual fallback", /Mark as Completed/.test((r.body && r.body.message) || ""), r.body && r.body.message);
    }

    console.log("\n--- 8. GitHub (separate portfolio feature, never a completion source) ---");
    r = await call("GET", "/coding-track/github", { token: a.token });
    check("github status -> connected:false", r.body && r.body.data && r.body.data.connected === false, JSON.stringify(r.body && r.body.data));
    check("github status never returns a token", !JSON.stringify(r.body || {}).toLowerCase().includes("token"));
    r = await call("GET", "/coding-track/github/auth-url", { token: a.token });
    check("auth-url without GITHUB_CLIENT_ID -> 500 + clear message", r.status === 500 && /not configured/i.test(r.body.message || ""), "got " + r.status + " " + (r.body && r.body.message));
    r = await call("PATCH", "/coding-track/github/repo", { token: a.token, body: { repoFullName: "not-a-repo" } });
    check("bad repoFullName -> 400", r.status === 400, "got " + r.status);
    r = await call("PATCH", "/coding-track/github/repo", { token: a.token, body: { repoFullName: "owner/repo" } });
    check("repo select without connection -> 400", r.status === 400, "got " + r.status + " " + (r.body && r.body.message));
    r = await call("POST", "/coding-track/github/sync", { token: a.token, body: { completionId: completionId } });
    check("sync without GitHub connection -> 400", r.status === 400, "got " + r.status + " " + (r.body && r.body.message));
    r = await call("POST", "/coding-track/github/sync", { token: a.token, body: {} });
    check("sync without completionId -> 400", r.status === 400, "got " + r.status);
    r = await call("POST", "/coding-track/github/sync", { token: a.token, body: { completionId: "not-an-id" } });
    check("malformed completionId -> 400 (not 500)", r.status === 400, "got " + r.status);
    const tokenLeak = await GitHubConnection.find({ user: { $in: created.users } }).lean();
    check("no GitHub token stored for test users", tokenLeak.length === 0);

    console.log("\n--- 9. admin visibility ---");
    r = await call("GET", "/admin/coding-challenges", { token: adminToken });
    check("admin lists challenges incl. new one", !!(r.body && r.body.data && r.body.data.some((c) => c.slug === "e2e-two-sum")));
    r = await call("GET", "/admin/students/" + a.id + "/coding", { token: adminToken });
    check("admin sees student A coding progress", r.body && r.body.data && r.body.data.total >= 1 && r.body.data.byDifficulty.Easy >= 1, JSON.stringify(r.body && r.body.data && { total: r.body.data.total, byDifficulty: r.body.data.byDifficulty }));
    r = await call("GET", "/admin/students/not-an-id/coding", { token: adminToken });
    check("admin malformed student id -> 400 (not 500)", r.status === 400, "got " + r.status);
    r = await call("DELETE", "/admin/coding-challenges/not-an-id", { token: adminToken });
    check("admin malformed challenge id -> 400 (not 500)", r.status === 400, "got " + r.status);
    r = await call("PATCH", "/admin/coding-challenges/" + challenge._id, { token: adminToken, body: { difficulty: "Nope" } });
    check("admin update with fake difficulty -> 400", r.status === 400, "got " + r.status);

    console.log("\n--- 10. existing modules still work (regression) ---");
    const regressions = [
      ["dashboard", "/dashboard"],
      ["practice", "/practice?page=1&limit=1"],
      ["roadmaps", "/roadmaps"],
      ["companies", "/companies"],
      ["resources", "/resources"],
      ["resume", "/resume"],
      ["coding (legacy)", "/coding"],
    ];
    for (const [label, path] of regressions) {
      const rr = await call("GET", path, { token: a.token });
      check(label + " still 200", rr.status === 200, "got " + rr.status);
    }
    r = await call("GET", "/auth/me", { token: a.token });
    check("auth/me 200 + exposes leetcode/timezone fields", r.status === 200 && r.body.user && "leetcodeUsername" in r.body.user && "timezone" in r.body.user, "got " + r.status);
    r = await call("GET", "/admin/overview", { token: adminToken });
    check("admin overview still 200", r.status === 200, "got " + r.status);
    const health = await fetch(BASE.replace("/api/v1", "") + "/api/health");
    check("legacy /api/health still reachable", health.status === 200, "got " + health.status);
  } catch (err) {
    console.log("\n!! E2E_ERROR: " + err.message + "\n" + (err.stack || "").split("\n").slice(0, 4).join("\n"));
    fail += 1;
  } finally {
    // ---- cleanup: remove every row this test created ----
    const ids = created.users;
    if (ids.length) {
      await CodingCompletion.deleteMany({ user: { $in: ids } });
      await CodingProfile.deleteMany({ user: { $in: ids } });
      await GitHubConnection.deleteMany({ user: { $in: ids } });
      await Activity.deleteMany({ user: { $in: ids } });
      await mongoose.connection.collection("readinessscores").deleteMany({ user: { $in: ids.map((i) => new mongoose.Types.ObjectId(i)) } });
      await mongoose.connection.collection("resumes").deleteMany({ user: { $in: ids.map((i) => new mongoose.Types.ObjectId(i)) } });
      await User.deleteMany({ _id: { $in: ids } });
    }
    if (created.challenges.length) {
      await CodingChallenge.deleteMany({ _id: { $in: created.challenges } });
    }
    const leftoverU = await User.countDocuments({ email: /^e2e\./ });
    const leftoverC = await CodingCompletion.countDocuments({ slug: /^e2e-/ });
    console.log("\ncleanup: leftover e2e users = " + leftoverU + ", leftover e2e completions = " + leftoverC);
    console.log("\n================ RESULT ================");
    console.log("PASS: " + pass + "   FAIL: " + fail + (skipped ? "   SKIPPED: " + skipped : ""));
    if (skipped) console.log("(SKIP = needs live LeetCode; blocked from this host with HTTP 403)");
    console.log(fail === 0 ? "ALL_E2E_TESTS_PASSED" : "THERE_ARE_FAILURES");
    await mongoose.disconnect();
    process.exit(fail === 0 ? 0 : 1);
  }
})().catch((e) => {
  console.log("E2E_CRASH " + e.message + "\n" + e.stack);
  process.exit(1);
});


