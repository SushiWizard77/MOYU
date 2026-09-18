(async () => {
  const results = {};
  const post = async (name, url, body, headers = {}) => {
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
      const t = await r.text();
      results[name] = `HTTP ${r.status}: ${t.slice(0, 400)}`;
    } catch (e) {
      results[name] = `FETCH-ERROR: ${e.message}`;
    }
  };

  await post("wandbox-min", "https://wandbox.org/api/compile.json", { compiler: "cpython-3.14.0", code: "print('hello')", save: false });
  await post("wandbox-cpp", "https://wandbox.org/api/compile.json", { compiler: "gcc-13.2.0", code: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){ long long s=0,x; while(cin>>x) s+=x; cout<<s<<endl; }\n', stdin: "1 2 3 4 5\n", save: false });

  // Judge0 CE community (no key) — submit+get
  try {
    const sub = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language_id: 71, source_code: "print(sum(map(int, input().split())))", stdin: "1 2 3 4 5" }),
    });
    results["judge0-ce"] = `HTTP ${sub.status}: ${(await sub.text()).slice(0, 300)}`;
  } catch (e) {
    results["judge0-ce"] = `FETCH-ERROR: ${e.message}`;
  }

  require("fs").writeFileSync("../judgetest2.txt", JSON.stringify(results, null, 2) + "\nJUDGE-TEST2-DONE");
})();
