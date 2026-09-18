(async () => {
  const results = {};
  const tryPost = async (name, url, body, extraHeaders = {}) => {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", ...extraHeaders },
        body: JSON.stringify(body),
      });
      const text = (await r.text()).slice(0, 300);
      results[name] = `HTTP ${r.status}: ${text}`;
    } catch (e) {
      results[name] = `FETCH-ERROR: ${e.message}`;
    }
  };

  const pistonBody = {
    language: "python",
    version: "3.10.0",
    files: [{ content: "print(sum(map(int, input().split())))" }],
    stdin: "1 2 3",
  };
  await tryPost("emkc-piston", "https://emkc.org/api/v2/piston/execute", pistonBody);
  await tryPost("quaqmory", "https://piston.quaqmory.dev/api/v2/execute", pistonBody);
  await tryPost("wandbox", "https://wandbox.org/api/compile.json", { code: "print(sum(map(int, input().split())))", compiler: "python-3.11", stdin: "1 2 3", save: false });
  require("fs").writeFileSync("../judgetest.txt", JSON.stringify(results, null, 2) + "\nJUDGE-TEST-DONE");
})();
