const fs = require("fs");
const path = require("path");

const projectKml = fs.readFileSync(
  path.join(__dirname, "../public/kml/project-192.kml"),
  "utf8"
);
const match = projectKml.match(/<coordinates>([\s\S]*?)<\/coordinates>/);
if (!match) {
  console.error("No coordinates in project-192.kml");
  process.exit(1);
}

const points = match[1].trim().split(/\s+/).filter(Boolean);
const junctionIdx = points.findIndex((p) => p.startsWith("106.716"));

let endIdx = points.length - 1;
let bestDist = Infinity;
points.forEach((p, i) => {
  const [lng, lat] = p.split(",").map(Number);
  const d = (lng - 107.35667) ** 2 + (lat - 16.50765) ** 2;
  if (d < bestDist) {
    bestDist = d;
    endIdx = i;
  }
});

const segment = points.slice(junctionIdx >= 0 ? junctionIdx : 0, endIdx + 1);
const outPath = path.join(__dirname, "../public/kml/goithau-70.kml");
const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark>
      <name>Gói thầu XL02 (Km600+700 - Km624+228,79)</name>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>
${segment.join("\n")}
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;

fs.writeFileSync(outPath, kml);
console.log(`Wrote ${outPath} (${segment.length} points)`);
