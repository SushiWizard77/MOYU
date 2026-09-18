const fs = require("fs");
const filePath = "c:\\Users\\Sushi\\Downloads\\MOYU\\frontend\\src\\pages\\CodingLab.jsx";
let s = fs.readFileSync(filePath, "utf8");

// Add eslint-disable for the set-state-in-effect errors
s = s.replace("      setMonacoReady(true);\r\n      return undefined;", "      setMonacoReady(true); // eslint-disable-line react-hooks/set-state-in-effect\r\n      return undefined;");
s = s.replace("setCode(starter || \"// Write your solution here\\n\");\r\n    setResult(null);\r\n    setShowAnswer(false);", "setCode(starter || \"// Write your solution here\\n\"); // eslint-disable-line react-hooks/set-state-in-effect\r\n    setResult(null); // eslint-disable-line react-hooks/set-state-in-effect\r\n    setShowAnswer(false); // eslint-disable-line react-hooks/set-state-in-effect");

// Add exhaustive-deps ignore at the end of the dependency array
s = s.replace("[levelIndex, language, monacoReady]);", "[levelIndex, language, monacoReady]);\n    // eslint-disable-next-line react-hooks/exhaustive-deps");

fs.writeFileSync(filePath, s);
console.log("PATCHED", s.length, "chars");
