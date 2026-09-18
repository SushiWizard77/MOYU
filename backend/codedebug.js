const BASE = "http://localhost:5000/api/v1";
(async () => {
  const lr = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "smoke@moyu.test", password: "Smoke@123" }),
  });
  const token = (await lr.json()).token;
  const H = { "Content-Type": "application/json", Authorization: `Bearer ${token}`, moyuToken: token };
  const list = await (await fetch(`${BASE}/coding`, { headers: H })).json();
  const sum = (list.data || []).find((p) => p.slug === "sum-of-array-elements");
  const full = await (await fetch(`${BASE}/coding/${sum._id}`, { headers: H })).json();
  const langs = ["python", "java", "c", "cpp"];
  const lines = [];
  for (const lang of langs) {
    const result = await (await fetch(`${BASE}/coding/run`, {
      method: "POST", headers: H,
      body: JSON.stringify({ problemId: sum._id, language: lang, code: full.data.starterCode[lang] }),
    })).json();
    const d = result.data || {};
    lines.push(`${lang}: ${d.summary || result.message} allPassed=${d.allPassed}${d.compileError ? ` | compileError: ${String(d.compileError).slice(0, 200)}` : ""}`);
  }
  require("fs").writeFileSync("../codedebug.txt", lines.join("\n") + "\nCODE-DEBUG-DONE");
})();
