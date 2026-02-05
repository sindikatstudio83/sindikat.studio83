import fs from "fs";
import path from "path";

const SRC = "src";
const DIST = "dist";

const PARTIALS = path.join(SRC, "partials");
const PAGES = path.join(SRC, "pages");

if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST);
}

const partialCache = {};
fs.readdirSync(PARTIALS).forEach(file => {
  partialCache[file.replace(".html", "")] =
    fs.readFileSync(path.join(PARTIALS, file), "utf8");
});

fs.readdirSync(PAGES).forEach(file => {
  if (!file.endsWith(".html")) return;

  let html = fs.readFileSync(path.join(PAGES, file), "utf8");

  Object.entries(partialCache).forEach(([name, content]) => {
    html = html.replace(
      `<!-- PARTIAL: ${name} -->`,
      content
    );
  });

  fs.writeFileSync(path.join(DIST, file), html);
  console.log(`✔ built ${file}`);
});

