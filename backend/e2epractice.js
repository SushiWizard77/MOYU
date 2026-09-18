const BASE = "http://localhost:5000/api/v1";
const out = [];
const log = (label, v) => out.push(`${label}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
(async () => {
  try {
    const lr = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "smoke@moyu.test", password: "Smoke@123" }),
    });
    const ld = await lr.json();
    var token = ld.token;
    if (!token) {
      const rr = await fetch(`${BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Smoke Test", email: "smoke@moyu.test", password: "Smoke@123", college: "Test University", department: "CSE", graduationYear: 2026 }),
      });
      const rd = await rr.json();
      token = rd.token;
    }
    const H = { "Content-Type": "application/json", Authorization: `Bearer ${token}`, moyuToken: token };

    // 1. PROJECTS CRUD (no category field)
    const pc = await (await fetch(`${BASE}/projects`, {
      method: "POST",
      headers: H,
      body: JSON.stringify({ title: "Smoke Project", description: "A test project.", githubLink: "https://github.com/smoke/repo", liveLink: "https://smoke.dev", techStack: ["React", "Node.js"], status: "completed" }),
    })).json();
    log("project created", pc.data ? `title=${pc.data.title} status=${pc.data.status}` : pc.message);
    if (pc.data) {
      const pl = await (await fetch(`${BASE}/projects`, { headers: H })).json();
      log("projects list count", pl.data.length);
      const pid = pc.data._id;
      const pu = await (await fetch(`${BASE}/projects/${pid}`, {
        method: "PATCH",
        headers: H,
        body: JSON.stringify({ title: "Smoke Project v2", description: "Updated once.", techStack: ["React"], status: "ongoing" }),
      })).json();
      log("project updated", pu.data ? `title=${pu.data.title} status=${pu.data.status}` : pu.message);
      const pd = await (await fetch(`${BASE}/projects/${pid}`, { method: "DELETE", headers: H })).json();
      log("project deleted", pd.success);
    }

    // 2. PRACTICE HUB: config → start (no leak) → submit with error analysis
    const options = ["Coding", "Aptitude", "Communication", "SQL", "DSA"];
    for (const cat of options) {
      const s = await (await fetch(`${BASE}/practice/session/start?count=3&category=${encodeURIComponent(cat)}`, { headers: H })).json();
      const qs = s.data || [];
      if (qs.length < 1) {
        log("practice no questions for", cat);
        continue;
      }
      const hasLeak = qs.some((q) => !!q.correctOptionIndex || !!q.correctAnswer);
      log("practice no leak for", `${cat}: ${hasLeak ? "LEAK-BAD" : "no-leak-ok"}`);
      const answers = qs.map((q, i) => ({ questionId: q._id, selectedIndex: i % 4 }));
      const sub = await (await fetch(`${BASE}/practice/session/submit`, {
        method: "POST",
        headers: H,
        body: JSON.stringify({ answers }),
      })).json();
      const sd = sub.data || {};
      log("practice submit", `${cat}: ${sd.correctCount}/${sd.attempted} (${sd.score}%) improveAreas=${JSON.stringify((sd.improveAreas||[]).map(a=>a.topic))} categories=${JSON.stringify((sd.categoryBreakdown||[]).map(c=>`${c.category}:${c.correct}/${c.total}`))}`);
      if (!Array.isArray(sd.results) || !sd.results.every((r) => typeof r.isCorrect === "boolean")) {
        log("practice results missing", `${cat}: BAD`);
      }
    }

    // 3. Practice Hub: category list check (quick open) — just hit list once
    const pl2 = await (await fetch(`${BASE}/practice`, { headers: H })).json();
    log("practice list count", pl2.data.length);

  } catch (e) {
    log("FATAL", e.message);
  }
  require("fs").writeFileSync("../e2epractice.txt", out.join("\n") + "\nE2E-PRACTICE-DONE");
})();
