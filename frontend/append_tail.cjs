const fs = require("fs");

const filePath = "c:\\Users\\Sushi\\Downloads\\MOYU\\frontend\\src\\pages\\CodingLab.jsx";
let s = fs.readFileSync(filePath, "utf8");

// strip trailing whitespace/newlines
s = s.replace(/\s+$/, "");

const tail = `

            {result && (
              <div className="rounded-xl border border-lavender-200/10 bg-brand-950/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="flex items-center gap-1.5 text-sm font-bold">
                    {result.allPassed ? (
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 size={16} />
                        All test cases passed — level complete!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-400">
                        <XCircle size={16} />
                        Some test cases failed
                      </span>
                    )}
                  </h4>
                  <Badge tone={result.allPassed ? "success" : "danger"}>{result.summary}</Badge>
                </div>

                <div className="mb-2 text-xs text-lavender-500">{result.passed}/{result.total} test cases passed</div>

                <div className="space-y-3">
                  {result.results.map((r) => (
                    <div key={r.index} className="rounded-lg border border-lavender-200/10 bg-brand-950/80 p-3 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-lavender-400">Test Case {r.index}</span>
                        {r.passed ? (
                          <span className="flex items-center gap-1 font-bold text-emerald-400">
                            <CheckCircle2 size={13} /> Passed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-bold text-red-400">
                            <XCircle size={13} /> Failed
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex gap-2">
                        <span className="w-16 shrink-0 font-bold text-lavender-400">Input:</span>
                        <code className="whitespace-pre-line break-all text-lavender-200">{r.input || "(none)"}</code>
                      </div>
                      <div className="mt-1 flex gap-2">
                        <span className="w-16 shrink-0 font-bold text-lavender-400">Expected:</span>
                        <code className="whitespace-pre-line text-lavender-200">{r.expected}</code>
                      </div>
                      <div className="mt-1 flex gap-2">
                        <span className="w-16 shrink-0 font-bold text-lavender-400">Got:</span>
                        <code className="whitespace-pre-line text-lavender-200">{r.actual || "(no output)"}</code>
                      </div>
                      {r.stderr && (
                        <div className="mt-1 flex gap-2">
                          <span className="w-16 shrink-0 font-bold text-red-400">Error:</span>
                          <code className="whitespace-pre-line break-all text-red-300">{r.stderr}</code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!result.allPassed && (
                  <div className="mt-3 rounded-lg border border-starlight/20 bg-starlight/5 p-3 text-xs text-lavender-300">
                    <strong>Learning tip:</strong> Compare your <span className="text-red-300">Got</span> against{" "}
                    <span className="text-emerald-300">Expected</span>. The "How to Approach" and "Way to the Correct Answer" panels above show the optimal logic. Fix the failing edge case, then run again.
                  </div>
                )}
              </div>
            )}
          </div>

          </main>
      ) : (
        <div className="mt-8 text-center text-sm text-lavender-400">
          Select a problem from the dropdown above to start coding.
        </div>
      )}
    </DashboardLayout>
  );
}

export default CodingLab;`;

fs.writeFileSync(filePath, s + tail);
console.log("APPENDED OK", fs.readFileSync(filePath, "utf8").length, "chars");
