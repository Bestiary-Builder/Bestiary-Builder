import fs from "node:fs";

const input = JSON.parse(
    fs.readFileSync("../staticData/automationDocumentation.json", "utf8")
);

const hints = [];

for (const section of Object.values(input)) {
    for (const [name, variable] of Object.entries(section.variables ?? {})) {
        hints.push({
            name,
            detail: variable.type,
            doc: variable.desc,
        });
    }
}

fs.writeFileSync(
    "./monaco-hints.json",
    JSON.stringify(hints, null, 2) + "\n"
);

console.log(`Generated ${hints.length} hints.`);
