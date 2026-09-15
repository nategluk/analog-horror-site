"use strict";

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const sourceRelative = process.argv[2] || "content/book/children-protocol.js";
const outputRelative = process.argv[3] || "content/archive/layout-manifest-protocol-children.json";
const globalName = process.argv[4] || "DZ_CHILDREN_PROTOCOL";

const sourceFile = path.resolve(projectRoot, sourceRelative);
const outputFile = path.resolve(projectRoot, outputRelative);

const countChars = (value) => [...String(value || "")].length;

const readDimensions = (assetPath) => {
  if (!assetPath) return null;
  const absolutePath = path.resolve(projectRoot, assetPath);
  if (!fs.existsSync(absolutePath)) return null;
  try {
    const description = childProcess.execFileSync("file", ["--brief", "--dereference", absolutePath], {
      encoding: "utf8"
    });
    const match = description.match(/(\d+)\s*x\s*(\d+)/i);
    if (!match) return null;
    return { width: Number(match[1]), height: Number(match[2]) };
  } catch (error) {
    return null;
  }
};

const getRole = (page, pageCount) => {
  if (page === 1) return "intro";
  if (page === pageCount) return "appendix";
  if (page === pageCount - 2) return "final-open";
  if (page === pageCount - 1) return "final-close";
  if (page === pageCount - 4) return "insert-open";
  if (page === pageCount - 3) return "insert-close";
  return page % 2 === 0 ? "chapter-open" : "chapter-close";
};

const getLayout = (entry) => {
  if (!entry.image) return "text-only";
  const width = Number(entry.width) || 0;
  const height = Number(entry.height) || 0;
  return width > height ? "landscape-image-with-copy" : "portrait-image-with-copy";
};

const source = fs.readFileSync(sourceFile, "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: sourceFile });
const pages = context.window[globalName];

if (!Array.isArray(pages) || pages.length === 0) {
  throw new Error(`${globalName} did not expose a non-empty page array`);
}

const manifest = {
  schemaVersion: 1,
  kind: "book-layout-manifest",
  template: "protocol-children",
  reader: {
    layout: "explicit",
    pageCount: pages.length,
    pageNumberField: "page"
  },
  source: {
    content: sourceRelative,
    global: globalName
  },
  measurement: {
    textUnit: "Unicode code points",
    includesSpaces: true,
    fields: ["kicker", "title", "warning", "paragraphs"]
  },
  pages: pages.map((entry, index) => {
    const page = Number(entry.page) || index + 1;
    const paragraphs = (Array.isArray(entry.paragraphs) ? entry.paragraphs : []).map((text) => ({
      text: String(text || ""),
      chars: countChars(text)
    }));
    const declaredDimensions = entry.image
      ? {
          width: Number(entry.width) || null,
          height: Number(entry.height) || null
        }
      : null;
    const assetDimensions = readDimensions(entry.image);
    const dimensions = assetDimensions || declaredDimensions;
    const image = entry.image
      ? {
          path: entry.image,
          orientation: dimensions && dimensions.width > dimensions.height ? "landscape" : "portrait",
          declaredDimensions,
          assetDimensions,
          targetDimensions: dimensions
        }
      : null;

    return {
      page,
      role: getRole(page, pages.length),
      layout: getLayout(entry),
      kicker: entry.kicker || null,
      title: entry.title || null,
      warning: entry.warning || null,
      text: {
        kickerChars: countChars(entry.kicker),
        titleChars: countChars(entry.title),
        warningChars: countChars(entry.warning),
        paragraphs,
        paragraphChars: paragraphs.map(({ chars }) => chars),
        totalParagraphChars: paragraphs.reduce((total, { chars }) => total + chars, 0)
      },
      image
    };
  })
};

if (manifest.pages.some((entry, index) => entry.page !== index + 1)) {
  throw new Error("layout manifest pages must be sequential and one-based");
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`wrote ${outputRelative}: ${manifest.pages.length} pages`);
