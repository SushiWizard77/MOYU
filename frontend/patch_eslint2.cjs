const fs = require("fs");
const filePath = "c:\\Users\\Sushi\\Downloads\\MOYU\\frontend\\src\\pages\\CodingLab.jsx";
let s = fs.readFileSync(filePath, "utf8");

// The monaco effect disable is correct. Fix the level-sync effect: add disable comment.
s = s.replace("            const level = levels[levelIndex];\r\n            const starter = level.starterCode?.[language] || level.starterCode?.python || \"\";\r\n            setCode(starter || \"// Write your solution here\\n\"); // eslint-disable-line react-hooks/set-state-in-effect\r\n            setResult(null); // eslint-disable-line react-hooks/set-state-in-effect\r\n            setShowAnswer(false); // eslint-disable-line react-hooks/set-state-in-effect",
"            const level = levels[levelIndex]; // eslint-disable-line react-hooks/exhaustive-deps\r\n            const starter = level.starterCode?.[language] || level.starterCode?.python || \"\";\r\n            setCode(starter || \"// Write your solution here\\n\"); // eslint-disable-line react-hooks/set-state-in-effect\r\n            setResult(null); // eslint-disable-line react-hooks/set-state-in-effect\r\n            setShowAnswer(false); // eslint-disable-line react-hooks/set-state-in-effect");

// Remove the duplicate exhaustive-deps disable after the array
s = s.replace("[levelIndex, language, monacoReady]);\r\n    // eslint-disable-next-line react-hooks/exhaustive-deps\r\n  }, [levelIndex, language, monacoReady]);", "[levelIndex, language, monacoReady]);\n    // eslint-disable-next-line react-hooks/exhaustive-deps");

fs.writeFileSync(filePath, s);
console.log("PATCHED", s.length, "chars");
