(async () => {
  const results = {};
  let compilers = [];
  try {
    const r = await fetch("https://wandbox.org/api/list.json");
    compilers = await r.json();
    require("fs").writeFileSync("wandbox-compilers.json", JSON.stringify(compilers.map((c) => ({ name: c.name, language: c.language, version: c.version })), null, 2));
    results.list = `HTTP ${r.status}, ${compilers.length} compilers`;
  } catch (e) {
    results.list = `FETCH-ERROR: ${e.message}`;
  }

  const pick = (language) => {
    const opts = compilers.filter((c) => c.language === language && !/head|nightly/i.test(c.name));
    const gcc = opts.find((c) => /gcc/i.test(c.name));
    return (gcc || opts[0] || {}).name;
  };

  const run = async (name, body) => {
    try {
      const r = await fetch("https://wandbox.org/api/compile.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, save: false }),
      });
      const j = await r.json();
      results[name] = `HTTP ${r.status} | status=${j.status} | out=${(j.program_output || "").trim()} | err=${(j.program_error || "").trim().slice(0, 120)}`;
    } catch (e) {
      results[name] = `FETCH-ERROR: ${e.message}`;
    }
  };

  const pyCompiler = pick("Python");
  const cppCompiler = pick("C++");
  const cCompiler = pick("C");
  const javaCompiler = pick("Java");
  results.picks = { pyCompiler, cppCompiler, cCompiler, javaCompiler };

  await run("python", { compiler: pyCompiler, code: "nums = list(map(int, input().split()))\nprint(sum(nums))\n", stdin: "1 2 3 4 5\n" });
  await run("cpp", { compiler: cppCompiler, code: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){ long long s=0,x; while(cin>>x) s+=x; cout<<s<<endl; }\n', stdin: "1 2 3 4 5\n" });
  await run("c", { compiler: cCompiler, code: '#include <stdio.h>\nint main(){ long long s=0,x; while(scanf("%lld",&x)==1) s+=x; printf("%lld\\n",s); return 0; }\n', stdin: "1 2 3 4 5\n" });
  await run("java", { compiler: javaCompiler, code: 'import java.util.*;\npublic class Main { public static void main(String[] a){ Scanner sc=new Scanner(System.in); long s=0; while(sc.hasNextLong()) s+=sc.nextLong(); System.out.println(s);} }\n', stdin: "1 2 3 4 5\n" });

  require("fs").writeFileSync("../wandboxtest.txt", JSON.stringify(results, null, 2) + "\nWANDBOX-TEST-DONE");
})();
