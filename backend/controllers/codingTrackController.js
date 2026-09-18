// Coding Progress / LeetCode Tracking module (MVP).
// Architecture: "Auto-check via LeetCode username + manual fallback".
// LeetCode has no Submit webhook, so auto-check polls the public GraphQL
// recentAcSubmissionList; the manual "Mark as Completed" button is the
// guaranteed path and never asks for passwords/cookies.
// GitHub is a SEPARATE portfolio feature (OAuth, encrypted token) and is
// never the source of truth for completion.
const mongoose = require("mongoose");
const User = require("../models/User");
const Activity = require("../models/Activity");
const CodingChallenge = require("../models/CodingChallenge");
const CodingCompletion = require("../models/CodingCompletion");
const CodingProfile = require("../models/CodingProfile");
const GitHubConnection = require("../models/GitHubConnection");
const { encryptToken, decryptToken } = require("../utils/tokenCrypto");
const { dayKeyInTimezone, computeStreaks } = require("../utils/codingStreak");

// Guards user-supplied ids so a malformed value returns a clean 4xx instead of
// a Mongoose CastError (which would surface as a 500).
const isValidId = (value) => !!value && mongoose.isValidObjectId(String(value));

const LC_GQL = "https://leetcode.com/graphql";
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const EXT_BY_LANG = {
  python: "py", python3: "py", java: "java", c: "c", cpp: "cpp",
  javascript: "js", typescript: "ts", go: "go", rust: "rs",
  csharp: "cs", ruby: "rb", swift: "swift", kotlin: "kt",
  scala: "scala", php: "php",
};

// ---- shared helpers (pure) ----
const slugFromInput = (input) => {
  if (!input) return "";
  const s = String(input).trim();
  const m = s.match(/leetcode\.com\/problems\/([^/\s?#]+)/i);
  if (m) return m[1].replace(/\/+$/, "").toLowerCase();
  return s.replace(/\s+/g, "-").replace(/[^a-z0-9-]/gi, "").toLowerCase();
};

const submissionIdFromUrl = (url) => {
  if (!url) return "";
  const m = String(url).match(/submissions\/(\d+)/);
  return m ? m[1] : "";
};

const profileTimezone = (user) => user.timezone || "UTC";

const getOrCreateProfile = async (userId) => {
  let profile = await CodingProfile.findOne({ user: userId });
  if (!profile) profile = await CodingProfile.create({ user: userId });
  return profile;
};

// Recompute counts + streaks from the canonical completions table.
// Single writer path: every completion goes through recordCompletion().
const recomputeProfile = async (userId, timezone) => {
  const completions = await CodingCompletion.find({ user: userId }).sort({ completedAt: 1 }).lean();
  const byDiff = { Easy: 0, Medium: 0, Hard: 0 };
  completions.forEach((c) => {
    if (byDiff[c.difficulty] !== undefined) byDiff[c.difficulty] += 1;
  });
  const daySet = {};
  completions.forEach((c) => {
    daySet[c.completedDay] = true;
  });
  const days = Object.keys(daySet).sort();
  const todayKey = dayKeyInTimezone(new Date(), timezone || "UTC");
  const streak = computeStreaks(days, todayKey);
  const profile = await getOrCreateProfile(userId);
  profile.totalSolved = completions.length;
  profile.easySolved = byDiff.Easy;
  profile.mediumSolved = byDiff.Medium;
  profile.hardSolved = byDiff.Hard;
  profile.currentStreak = streak.current;
  profile.longestStreak = streak.longest;
  profile.lastCompletedDay = days.length ? days[days.length - 1] : "";
  profile.timezone = timezone || profile.timezone || "UTC";
  await profile.save();
  return { profile, days };
};

// ---- LeetCode public GraphQL (auto-check side only) ----
// LeetCode sits behind bot protection: from a datacenter IP (e.g. Vercel) it
// answers 403. Such failures are tagged `unavailable` so callers can tell
// "we could not reach LeetCode" apart from "LeetCode says this user does not
// exist" — the latter is only ever concluded from a 200 payload with
// `matchedUser: null`.
function lcUnavailable(message) {
  const err = new Error(message);
  err.unavailable = true;
  return err;
}

async function lcFetch(query, variables) {
  let r;
  try {
    r = await fetch(LC_GQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
        "User-Agent": "MOYU/2.0",
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (e) {
    throw lcUnavailable("LeetCode could not be reached (" + e.message + ").");
  }
  if (!r.ok) {
    throw lcUnavailable("LeetCode refused the request (HTTP " + r.status + ").");
  }
  try {
    return await r.json();
  } catch {
    throw lcUnavailable("LeetCode returned an unexpected response.");
  }
}

async function fetchRecentAccepted(username, limit) {
  const data = await lcFetch(
    "query recentAc($username: String!, $limit: Int!) { recentAcSubmissionList(username: $username, limit: $limit) { id title titleSlug timestamp statusDisplay lang } }",
    { username, limit: limit || 15 }
  );
  const list = (data && data.data && data.data.recentAcSubmissionList) || [];
  return list.filter((s) => String(s.statusDisplay || "").toLowerCase() === "accepted");
}

async function fetchQuestionMeta(slug) {
  try {
    const data = await lcFetch(
      "query q($titleSlug: String!) { question(titleSlug: $titleSlug) { title difficulty } }",
      { titleSlug: slug }
    );
    const q = data && data.data && data.data.question;
    return { title: (q && q.title) || "", difficulty: (q && q.difficulty) || "" };
  } catch (e) {
    return { title: "", difficulty: "" };
  }
}

// Definitive "does this LeetCode account exist?" lookup.
// LeetCode answers HTTP 200 with `matchedUser: null` for unknown handles, so
// the HTTP status alone cannot be trusted — an existence check must inspect
// the payload. Also returns the account's global solved totals so we can cache
// them on the user (separate from MOYU-tracked challenge completions).
async function fetchLcUser(username) {
  const data = await lcFetch(
    "query u($username: String!) { matchedUser(username: $username) { username submitStatsGlobal { acSubmissionNum { difficulty count } } } }",
    { username }
  );
  const mu = data && data.data && data.data.matchedUser;
  if (!mu) return null;
  const num = (mu.submitStatsGlobal && mu.submitStatsGlobal.acSubmissionNum) || [];
  const pick = (d) => {
    const row = num.find((n) => n.difficulty === d);
    return row ? Number(row.count) || 0 : 0;
  };
  return {
    username: mu.username,
    totalSolved: pick("All"),
    easySolved: pick("Easy"),
    mediumSolved: pick("Medium"),
    hardSolved: pick("Hard"),
  };
}

// Canonical writer: validate, dedupe, write completion, recompute profile.
// Returns { completion, created, profile }.
const recordCompletion = async ({ userId, slug, title, difficulty, source, submissionUrl, challengeId, completedAt, timezone }) => {
  const cleanSlug = slugFromInput(slug);
  if (!cleanSlug) {
    const err = new Error("A valid LeetCode problem link or slug is required.");
    err.status = 400;
    throw err;
  }
  if (!DIFFICULTIES.includes(difficulty)) {
    const err = new Error("Difficulty must be one of Easy, Medium, Hard.");
    err.status = 400;
    throw err;
  }
  let challenge = null;
  if (challengeId) {
    if (!isValidId(challengeId)) {
      const err = new Error("Invalid challengeId.");
      err.status = 400;
      throw err;
    }
    challenge = await CodingChallenge.findById(challengeId);
    if (!challenge) {
      const err = new Error("Challenge not found.");
      err.status = 404;
      throw err;
    }
    if (String(challenge.slug) !== cleanSlug) {
      const err = new Error("That solution does not match the challenge problem.");
      err.status = 400;
      throw err;
    }
  } else {
    challenge = await CodingChallenge.findOne({ slug: cleanSlug });
  }
  const dupeBySlug = await CodingCompletion.findOne({ user: userId, slug: cleanSlug });
  if (dupeBySlug) {
    const err = new Error("Already recorded — duplicate completions are not counted twice.");
    err.status = 409;
    err.completion = dupeBySlug;
    throw err;
  }
  if (challenge) {
    const dupeByChallenge = await CodingCompletion.findOne({ user: userId, challenge: challenge._id });
    if (dupeByChallenge) {
      const err = new Error("Challenge already completed.");
      err.status = 409;
      err.completion = dupeByChallenge;
      throw err;
    }
  }
  const when = completedAt ? new Date(completedAt) : new Date();
  const tz = timezone || "UTC";
  const completion = await CodingCompletion.create({
    user: userId,
    challenge: challenge ? challenge._id : null,
    slug: cleanSlug,
    title: title || (challenge && challenge.title) || cleanSlug,
    difficulty,
    source: source || "manual",
    submissionUrl: submissionUrl || "",
    completedDay: dayKeyInTimezone(when, tz),
    timezone: tz,
    completedAt: when,
  });
  const recomputed = await recomputeProfile(userId, tz);
  return { completion, created: true, profile: recomputed.profile, challenge };
};

// GET /api/v1/coding-track/link — connect/update LeetCode username status
const getLink = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("leetcodeUsername timezone");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const profile = await getOrCreateProfile(req.user.userId);
    if (user.leetcodeUsername && profile.leetcodeUsername !== user.leetcodeUsername) {
      profile.leetcodeUsername = user.leetcodeUsername;
      await profile.save();
    }
    res.json({
      success: true,
      data: {
        leetcodeUsername: user.leetcodeUsername || profile.leetcodeUsername || "",
        timezone: profileTimezone(user),
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PATCH /api/v1/coding-track/link { leetcodeUsername, timezone? }
const updateLink = async (req, res) => {
  try {
    const username = String((req.body && req.body.leetcodeUsername) || "").trim().replace(/^@/, "");
    const timezone = String((req.body && req.body.timezone) || "UTC").trim() || "UTC";
    if (!username) return res.status(400).json({ success: false, message: "leetcodeUsername is required" });
    if (!/^[a-zA-Z0-9_-]{1,30}$/.test(username)) {
      return res.status(400).json({ success: false, message: "That does not look like a valid LeetCode username." });
    }
    let lcUser = null;
    let unreachable = "";
    try {
      lcUser = await fetchLcUser(username);
    } catch (e) {
      // Cannot reach LeetCode (offline, or blocked from this host's IP).
      // The student must still be able to link their handle so the manual
      // "Mark as Completed" fallback keeps working.
      if (!e.unavailable) throw e;
      unreachable = e.message;
    }
    if (!lcUser && !unreachable) {
      return res.status(400).json({
        success: false,
        message: "LeetCode user @" + username + " does not exist.",
      });
    }
    const previous = await User.findById(req.user.userId).select("leetcodeStats");
    const prevStats = (previous && previous.leetcodeStats) || {};
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        leetcodeUsername: username,
        timezone,
        // Cached snapshot of the account's own global totals (display only).
        // MOYU's streak/Easy/Medium/Hard progress stays driven by
        // CodingCompletion so the two are never double-counted. When LeetCode
        // is unreachable we keep whatever snapshot we already had.
        leetcodeStats: lcUser
          ? {
              totalSolved: lcUser.totalSolved,
              easySolved: lcUser.easySolved,
              mediumSolved: lcUser.mediumSolved,
              hardSolved: lcUser.hardSolved,
              streakDays: prevStats.streakDays || 0,
              lastSyncedAt: new Date(),
            }
          : {
              totalSolved: prevStats.totalSolved || 0,
              easySolved: prevStats.easySolved || 0,
              mediumSolved: prevStats.mediumSolved || 0,
              hardSolved: prevStats.hardSolved || 0,
              streakDays: prevStats.streakDays || 0,
              lastSyncedAt: prevStats.lastSyncedAt || null,
            },
      },
      { new: true }
    );
    const profile = await getOrCreateProfile(req.user.userId);
    profile.leetcodeUsername = username;
    profile.timezone = timezone;
    await profile.save();
    await Activity.create({ user: user._id, type: "leetcode", description: "Linked LeetCode @" + username });
    res.json({
      success: true,
      message: lcUser
        ? "Linked LeetCode @" + username + " (" + lcUser.totalSolved + " solved on LeetCode)."
        : "Linked LeetCode @" + username + ". Auto-check is temporarily unavailable (" + unreachable +
          ") — use Mark as Completed in the meantime.",
      data: { leetcodeUsername: username, timezone, leetcodeStats: user.leetcodeStats, autoCheckAvailable: !!lcUser },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/v1/coding-track/stats — totals + streaks + recent
const getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("leetcodeUsername timezone");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const tz = profileTimezone(user);
    const recomputed = await recomputeProfile(req.user.userId, tz);
    const profile = recomputed.profile;
    if (user.leetcodeUsername && profile.leetcodeUsername !== user.leetcodeUsername) {
      profile.leetcodeUsername = user.leetcodeUsername;
      await profile.save();
    }
    const recent = await CodingCompletion.find({ user: req.user.userId })
      .populate("challenge", "dayNumber category")
      .sort({ completedAt: -1 })
      .limit(10)
      .lean();
    res.json({
      success: true,
      data: {
        leetcodeUsername: user.leetcodeUsername || "",
        totalSolved: profile.totalSolved,
        easy: profile.easySolved,
        medium: profile.mediumSolved,
        hard: profile.hardSolved,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        lastCompletedDay: profile.lastCompletedDay,
        timezone: profile.timezone,
        lastSyncedAt: profile.lastSyncedAt,
        recent,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/v1/coding-track/streak — streak only (cheap)
const getStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("timezone");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const recomputed = await recomputeProfile(req.user.userId, profileTimezone(user));
    res.json({
      success: true,
      data: {
        currentStreak: recomputed.profile.currentStreak,
        longestStreak: recomputed.profile.longestStreak,
        lastCompletedDay: recomputed.profile.lastCompletedDay,
        timezone: recomputed.profile.timezone,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/v1/coding-track/daily — today's challenge + status
const getDaily = async (req, res) => {
  try {
    const userId = req.user.userId;
    const challenges = await CodingChallenge.find({ isActive: true }).sort({ dayNumber: 1 }).lean();
    if (!challenges.length) {
      return res.json({ success: true, data: { challenge: null, completed: false } });
    }
    const done = await CodingCompletion.find({ user: userId, challenge: { $ne: null } }).select("challenge").lean();
    const doneSet = {};
    done.forEach((d) => {
      if (d.challenge) doneSet[String(d.challenge)] = true;
    });
    const next = challenges.find((c) => !doneSet[String(c._id)]) || challenges[challenges.length - 1];
    const completion = await CodingCompletion.findOne({ user: userId, challenge: next._id }).lean();
    res.json({
      success: true,
      data: {
        challenge: next,
        completed: !!completion,
        completion: completion || null,
        remaining: challenges.filter((c) => !doneSet[String(c._id)]).length,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/v1/coding-track/complete { challengeId?, slugOrUrl?, difficulty?, submissionUrl? }
const completeManual = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("timezone");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const body = req.body || {};
    let slugOrUrl = body.slugOrUrl;
    let difficulty = body.difficulty;
    const challengeId = body.challengeId;
    const submissionUrl = body.submissionUrl || "";
    if (challengeId) {
      if (!isValidId(challengeId)) {
        return res.status(400).json({ success: false, message: "Invalid challengeId." });
      }
      const ch = await CodingChallenge.findById(challengeId);
      if (!ch) return res.status(404).json({ success: false, message: "Challenge not found." });
      slugOrUrl = ch.slug;
      difficulty = ch.difficulty;
    }
    if (submissionUrl) {
      const u = String(submissionUrl);
      const ok = /^https:\/\/(www\.)?leetcode\.com\//.test(u) && (u.includes("/problems/") || submissionIdFromUrl(u));
      if (!ok) return res.status(400).json({ success: false, message: "submissionUrl must be a LeetCode problem or submission URL." });
    }
    let title = "";
    if (!difficulty || difficulty === "Unknown") {
      const meta = await fetchQuestionMeta(slugFromInput(slugOrUrl));
      title = meta.title || "";
      if (!difficulty || difficulty === "Unknown") difficulty = meta.difficulty;
    }
    const result = await recordCompletion({
      userId: req.user.userId,
      slug: slugOrUrl,
      title,
      difficulty,
      source: "manual",
      submissionUrl,
      challengeId: challengeId || null,
      timezone: profileTimezone(user),
    });
    await Activity.create({
      user: req.user.userId,
      type: "leetcode",
      description: "Completed " + result.completion.difficulty + ": " + result.completion.title + " (manual)",
    });
    res.status(201).json({
      success: true,
      message: "Recorded — " + result.completion.difficulty + ' "' + result.completion.title + '" completed.',
      data: { completion: result.completion, profile: result.profile },
    });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, message: e.message, completion: e.completion || undefined });
  }
};

// POST /api/v1/coding-track/verify — auto-check recent Accepted vs challenge/daily
const verifyAuto = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("leetcodeUsername timezone");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.leetcodeUsername) {
      return res.status(400).json({ success: false, message: "Link your LeetCode username first." });
    }
    let recent;
    try {
      recent = await fetchRecentAccepted(user.leetcodeUsername, 15);
    } catch (e) {
      if (!e.unavailable) throw e;
      // Auto-check genuinely cannot run right now. This is not a 500: the
      // manual "Mark as Completed" path is the documented fallback.
      return res.status(503).json({
        success: false,
        message: "Auto-check is unavailable right now (" + e.message + ") Use Mark as Completed.",
        data: { verified: 0, autoCheckAvailable: false },
      });
    }
    if (!recent.length) {
      return res.json({ success: true, message: "No Accepted submissions found yet.", data: { verified: 0 } });
    }
    const slugs = recent.map((r) => r.titleSlug);
    const have = await CodingCompletion.find({ user: user._id, slug: { $in: slugs } }).select("slug").lean();
    const haveSet = {};
    have.forEach((d) => {
      haveSet[d.slug] = true;
    });
    let verified = 0;
    const fresh = [];
    for (const sub of recent) {
      if (haveSet[sub.titleSlug]) continue;
      const meta = await fetchQuestionMeta(sub.titleSlug);
      if (!DIFFICULTIES.includes(meta.difficulty)) continue;
      const result = await recordCompletion({
        userId: user._id,
        slug: sub.titleSlug,
        title: sub.title || meta.title,
        difficulty: meta.difficulty,
        source: "auto",
        submissionUrl: "",
        challengeId: null,
        completedAt: new Date(Number(sub.timestamp) * 1000),
        timezone: profileTimezone(user),
      });
      verified += 1;
      fresh.push(result.completion);
      await Activity.create({
        user: user._id,
        type: "leetcode",
        description: "Verified LeetCode " + result.completion.difficulty + ": " + result.completion.title,
      });
    }
    const profile = await getOrCreateProfile(user._id);
    profile.lastSyncedAt = new Date();
    profile.leetcodeUsername = user.leetcodeUsername;
    await profile.save();
    res.json({
      success: true,
      message: verified ? "Verified " + verified + " new solve(s) from LeetCode." : "Already up to date.",
      data: { verified, completions: fresh, profile },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ---- GitHub OAuth (separate portfolio feature) ----
const githubAuthUrl = (req, res) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({
        success: false,
        message: "GitHub OAuth is not configured. Set GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET.",
      });
    }
    const redirectUri = process.env.GITHUB_REDIRECT_URI || "";
    const scope = "repo";
    const state = Buffer.from(String(req.user.userId)).toString("base64url");
    let url = "https://github.com/login/oauth/authorize?client_id=" + encodeURIComponent(clientId);
    url += "&scope=" + encodeURIComponent(scope) + "&state=" + encodeURIComponent(state);
    if (redirectUri) url += "&redirect_uri=" + encodeURIComponent(redirectUri);
    res.json({ success: true, data: { url } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const githubCallback = async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ success: false, message: "OAuth code is required." });
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return res.status(500).json({ success: false, message: "GitHub OAuth is not configured on the server." });
    }
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
      signal: AbortSignal.timeout(15000),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenJson.access_token) {
      return res.status(400).json({ success: false, message: "GitHub OAuth failed: " + (tokenJson.error_description || tokenJson.error || "no token") });
    }
    const meRes = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + tokenJson.access_token,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "MOYU",
      },
    });
    if (!meRes.ok) return res.status(400).json({ success: false, message: "Could not read GitHub profile." });
    const me = await meRes.json();
    const enc = encryptToken(tokenJson.access_token);
    await GitHubConnection.findOneAndUpdate(
      { user: req.user.userId },
      {
        user: req.user.userId,
        githubUserId: String(me.id),
        githubUsername: me.login,
        scopes: String(tokenJson.scope || "repo").split(","),
        tokenIv: enc.iv,
        tokenTag: enc.tag,
        tokenData: enc.data,
        connectedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    await Activity.create({
      user: req.user.userId,
      type: "github",
      description: "Connected GitHub @" + me.login + " via OAuth",
    });
    res.json({
      success: true,
      message: "Connected GitHub @" + me.login + ".",
      data: { githubUsername: me.login },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/v1/coding-track/github — connection status (never returns token)
const githubStatus = async (req, res) => {
  try {
    const conn = await GitHubConnection.findOne({ user: req.user.userId }).lean();
    if (!conn) return res.json({ success: true, data: { connected: false } });
    res.json({
      success: true,
      data: {
        connected: true,
        githubUsername: conn.githubUsername,
        repoFullName: conn.repoFullName,
        connectedAt: conn.connectedAt,
        lastSyncAt: conn.lastSyncAt,
        lastPushSha: conn.lastPushSha,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PATCH /api/v1/coding-track/github/repo { repoFullName } — select target repo
const githubSelectRepo = async (req, res) => {
  try {
    const repoFullName = String((req.body && req.body.repoFullName) || "").trim();
    if (!/^[\w.-]+\/[\w.-]+$/.test(repoFullName)) {
      return res.status(400).json({ success: false, message: "repoFullName must look like owner/repo." });
    }
    const conn = await GitHubConnection.findOne({ user: req.user.userId }).select("+tokenIv +tokenTag +tokenData");
    if (!conn) return res.status(400).json({ success: false, message: "Connect GitHub first." });
    let token = "";
    try {
      token = decryptToken({ iv: conn.tokenIv, tag: conn.tokenTag, data: conn.tokenData });
    } catch (e) {
      return res.status(400).json({ success: false, message: "Stored GitHub token is unreadable. Reconnect." });
    }
    const check = await fetch("https://api.github.com/repos/" + repoFullName, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + token,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "MOYU",
      },
    });
    if (check.status !== 200) {
      return res.status(400).json({ success: false, message: "Cannot access repo " + repoFullName + " with this token." });
    }
    conn.repoFullName = repoFullName;
    await conn.save();
    res.json({ success: true, message: "Selected " + repoFullName + " for solution sync.", data: { repoFullName } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/v1/coding-track/github/sync { completionId, language?, code }
const githubSyncSolution = async (req, res) => {
  try {
    const { completionId, language, code } = req.body || {};
    if (!completionId) return res.status(400).json({ success: false, message: "completionId is required." });
    if (!isValidId(completionId)) {
      return res.status(400).json({ success: false, message: "Invalid completionId." });
    }
    const completion = await CodingCompletion.findOne({ _id: completionId, user: req.user.userId });
    if (!completion) return res.status(404).json({ success: false, message: "Completion not found." });
    const conn = await GitHubConnection.findOne({ user: req.user.userId }).select("+tokenIv +tokenTag +tokenData");
    if (!conn || !conn.repoFullName) {
      return res.status(400).json({ success: false, message: "Connect GitHub and select a repository first." });
    }
    let token = "";
    try {
      token = decryptToken({ iv: conn.tokenIv, tag: conn.tokenTag, data: conn.tokenData });
    } catch (e) {
      return res.status(400).json({ success: false, message: "Stored GitHub token is unreadable. Reconnect." });
    }
    const ext = EXT_BY_LANG[String(language || "").toLowerCase()] || "txt";
    const path = "leetcode/" + String(completion.difficulty).toLowerCase() + "/" + completion.slug + "." + ext;
    const content = "// " + completion.title + " (" + completion.difficulty + ") — synced from MOYU\n" + (code || "// Paste your accepted code in the sync dialog to store the full file.\n");
    const base = "https://api.github.com/repos/" + conn.repoFullName + "/contents/" + path;
    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "MOYU",
    };
    let sha;
    const existing = await fetch(base, { headers });
    if (existing.status === 200) sha = (await existing.json()).sha;
    else if (existing.status !== 404) {
      return res.status(400).json({ success: false, message: "GitHub read failed (" + existing.status + ")." });
    }
    const body = { message: "Sync " + completion.title + " (" + completion.difficulty + ") from MOYU", content: Buffer.from(content, "utf8").toString("base64") };
    if (sha) body.sha = sha;
    const put = await fetch(base, {
      method: "PUT",
      headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    });
    if (!put.ok) {
      return res.status(400).json({ success: false, message: "GitHub push failed (" + put.status + ")." });
    }
    const pushed = await put.json();
    conn.lastSyncAt = new Date();
    conn.lastPushSha = (pushed && pushed.commit && pushed.commit.sha) || "";
    await conn.save();
    // Remember where the file landed so the student sees "committed" in MOYU.
    completion.githubPath = path;
    completion.githubSyncedAt = new Date();
    await completion.save();
    await Activity.create({
      user: req.user.userId,
      type: "github",
      description: "Synced " + completion.title + " to " + conn.repoFullName,
    });
    res.json({
      success: true,
      message: "Synced to " + conn.repoFullName + ".",
      data: { path, sha: conn.lastPushSha },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  getLink,
  updateLink,
  getStats,
  getStreak,
  getDaily,
  completeManual,
  verifyAuto,
  githubAuthUrl,
  githubCallback,
  githubStatus,
  githubSelectRepo,
  githubSyncSolution,
  // exported for tests
  __test: { slugFromInput, recordCompletion, recomputeProfile },
};