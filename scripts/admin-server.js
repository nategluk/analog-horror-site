#!/usr/bin/env node

/**
 * Local Copy Desk + Irina node inspector.
 *
 *   node scripts/admin-server.js
 *   open http://127.0.0.1:8787/admin/          writer UI (both games)
 *   open http://127.0.0.1:8787/admin/nodes.html node inspector (Irina)
 *
 * Bind is localhost only. Not for production deploy.
 */

"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");
const { spawnSync } = require("node:child_process");
const vm = require("node:vm");
const copydesk = require("./lib/copydesk-core");

const projectRoot = path.resolve(__dirname, "..");
const contentPath = path.join(projectRoot, "content", "irina", "call-content.js");
const HOST = "127.0.0.1";
const PORT = Number(process.env.ADMIN_PORT || 8787);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
  ".woff2": "font/woff2",
};

const deepClone = (value) => {
  if (typeof value === "function") return value;
  if (Array.isArray(value)) return value.map(deepClone);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, deepClone(child)])
    );
  }
  return value;
};

const loadContent = () => {
  const source = fs.readFileSync(contentPath, "utf8");
  const sandbox = { window: {}, console };
  vm.runInNewContext(source, sandbox, { filename: contentPath, timeout: 3000 });
  const frozen = sandbox.window.TyndexIrinaCallContent;
  if (!frozen?.nodes) {
    throw new Error("TyndexIrinaCallContent.nodes missing");
  }
  // Object.freeze breaks mutation; clone for admin edits.
  const content = deepClone(frozen);
  return { source, content };
};

const serializeValue = (value, indent = 2, level = 0) => {
  const pad = " ".repeat(indent * level);
  const padIn = " ".repeat(indent * (level + 1));

  if (typeof value === "function") {
    return Function.prototype.toString.call(value);
  }

  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    const items = value.map(
      (item) => `${padIn}${serializeValue(item, indent, level + 1)}`
    );
    return `[\n${items.join(",\n")}\n${pad}]`;
  }

  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (!keys.length) return "{}";
    const items = keys.map((key) => {
      const safeKey = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
      return `${padIn}${safeKey}: ${serializeValue(value[key], indent, level + 1)}`;
    });
    return `{\n${items.join(",\n")}\n${pad}}`;
  }

  throw new Error(`Cannot serialize ${typeof value}`);
};

/**
 * Surgical source editing: change only the target node entry inside
 * `const nodes = { ... }`. Everything else in the file stays byte-identical.
 */
const createScanner = (source) => {
  let i = 0;
  const length = source.length;

  const peek = (offset = 0) => source[i + offset] || "";
  const eof = () => i >= length;

  const skipLineComment = () => {
    i += 2;
    while (!eof() && source[i] !== "\n") i += 1;
  };

  const skipBlockComment = () => {
    i += 2;
    while (!eof() && !(source[i] === "*" && source[i + 1] === "/")) i += 1;
    if (!eof()) i += 2;
  };

  const skipString = (quote) => {
    i += 1;
    while (!eof()) {
      const ch = source[i];
      if (ch === "\\") {
        i += 2;
        continue;
      }
      i += 1;
      if (ch === quote) break;
    }
  };

  const skipTemplate = () => {
    i += 1;
    while (!eof()) {
      const ch = source[i];
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === "`") {
        i += 1;
        break;
      }
      if (ch === "$" && source[i + 1] === "{") {
        i += 2;
        skipBalanced("{", "}");
        continue;
      }
      i += 1;
    }
  };

  const skipBalanced = (openChar, closeChar) => {
    let depth = 1;
    while (!eof() && depth > 0) {
      const ch = source[i];
      if (ch === "/" && source[i + 1] === "/") {
        skipLineComment();
        continue;
      }
      if (ch === "/" && source[i + 1] === "*") {
        skipBlockComment();
        continue;
      }
      if (ch === "'" || ch === '"') {
        skipString(ch);
        continue;
      }
      if (ch === "`") {
        skipTemplate();
        continue;
      }
      if (ch === openChar) depth += 1;
      else if (ch === closeChar) depth -= 1;
      i += 1;
    }
  };

  const skipWsAndComments = () => {
    while (!eof()) {
      const ch = source[i];
      if (/\s/.test(ch)) {
        i += 1;
        continue;
      }
      if (ch === "/" && source[i + 1] === "/") {
        skipLineComment();
        continue;
      }
      if (ch === "/" && source[i + 1] === "*") {
        skipBlockComment();
        continue;
      }
      break;
    }
  };

  const readKey = () => {
    skipWsAndComments();
    const start = i;
    const ch = peek();
    if (ch === '"' || ch === "'") {
      const quote = ch;
      skipString(quote);
      return {
        key: JSON.parse(
          quote === "'"
            ? `"${source.slice(start + 1, i - 1).replace(/\\'/g, "'").replace(/"/g, '\\"')}"`
            : source.slice(start, i)
        ),
        raw: source.slice(start, i),
        start,
        end: i,
      };
    }
    if (/[A-Za-z_$]/.test(ch)) {
      i += 1;
      while (!eof() && /[\w$]/.test(peek())) i += 1;
      return {
        key: source.slice(start, i),
        raw: source.slice(start, i),
        start,
        end: i,
      };
    }
    throw new Error(`Expected object key near index ${i}`);
  };

  const readValueEnd = () => {
    skipWsAndComments();
    const start = i;
    const ch = peek();
    if (ch === "{" || ch === "[" || ch === "(") {
      const close = ch === "{" ? "}" : ch === "[" ? "]" : ")";
      i += 1;
      skipBalanced(ch, close);
      return { start, end: i };
    }
    if (ch === "'" || ch === '"') {
      skipString(ch);
      return { start, end: i };
    }
    if (ch === "`") {
      skipTemplate();
      return { start, end: i };
    }
    // number / boolean / null / identifier / arrow function starting with (
    // Also function keyword and async
    if (source.startsWith("function", i) || source.startsWith("async", i)) {
      // function expression as value — scan until comma/} at depth 0 is hard;
      // treat as balanced-ish by reading until we hit top-level comma or }
      // Prefer: if "function" then skip to matching body braces.
      if (source.startsWith("async", i)) {
        i += 5;
        skipWsAndComments();
      }
      if (source.startsWith("function", i)) {
        i += 8;
        skipWsAndComments();
        if (peek() === "*") i += 1;
        skipWsAndComments();
        if (/[A-Za-z_$]/.test(peek())) {
          while (!eof() && /[\w$]/.test(peek())) i += 1;
        }
        skipWsAndComments();
        if (peek() !== "(") throw new Error("Malformed function value");
        i += 1;
        skipBalanced("(", ")");
        skipWsAndComments();
        if (peek() !== "{") throw new Error("Malformed function body");
        i += 1;
        skipBalanced("{", "}");
        return { start, end: i };
      }
    }

    // arrow functions: (args) => ... or ident => ...
    // Fall through to generic scan for expressions until comma/brace at depth 0.
    let depthBrace = 0;
    let depthParen = 0;
    let depthBracket = 0;
    while (!eof()) {
      const c = source[i];
      if (c === "/" && source[i + 1] === "/") {
        skipLineComment();
        continue;
      }
      if (c === "/" && source[i + 1] === "*") {
        skipBlockComment();
        continue;
      }
      if (c === "'" || c === '"') {
        skipString(c);
        continue;
      }
      if (c === "`") {
        skipTemplate();
        continue;
      }
      if (c === "{") depthBrace += 1;
      else if (c === "}") {
        if (depthBrace === 0 && depthParen === 0 && depthBracket === 0) break;
        depthBrace -= 1;
      } else if (c === "(") depthParen += 1;
      else if (c === ")") depthParen -= 1;
      else if (c === "[") depthBracket += 1;
      else if (c === "]") depthBracket -= 1;
      else if (
        (c === "," || c === "}") &&
        depthBrace === 0 &&
        depthParen === 0 &&
        depthBracket === 0
      ) {
        break;
      }
      i += 1;
    }
    return { start, end: i };
  };

  return {
    get index() {
      return i;
    },
    set index(value) {
      i = value;
    },
    eof,
    peek,
    skipWsAndComments,
    readKey,
    readValueEnd,
    skipBalanced,
  };
};

const findConstObject = (source, constName) => {
  const marker = `const ${constName} =`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Could not find const ${constName}`);
  }
  let i = markerIndex + marker.length;
  while (i < source.length && /\s/.test(source[i])) i += 1;
  if (source[i] !== "{") {
    throw new Error(`const ${constName} is not an object literal`);
  }
  const open = i;
  const scanner = createScanner(source);
  scanner.index = open + 1;
  // use skipBalanced from open
  scanner.index = open;
  // manually:
  const sc = createScanner(source);
  sc.index = open + 1;
  // reimplement match from open
  let depth = 1;
  let pos = open + 1;
  const temp = createScanner(source);
  temp.index = open + 1;
  // simpler: slice helper
  const endScanner = createScanner(source);
  endScanner.index = open;
  // walk with skipBalanced starting after {
  const bal = createScanner(source);
  bal.index = open + 1;
  // custom
  const s = source;
  let j = open + 1;
  let d = 1;
  let inLine = false;
  let inBlock = false;
  let str = null;
  let escape = false;
  while (j < s.length && d > 0) {
    const ch = s[j];
    const next = s[j + 1];
    if (inLine) {
      if (ch === "\n") inLine = false;
      j += 1;
      continue;
    }
    if (inBlock) {
      if (ch === "*" && next === "/") {
        inBlock = false;
        j += 2;
        continue;
      }
      j += 1;
      continue;
    }
    if (str) {
      if (escape) {
        escape = false;
        j += 1;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        j += 1;
        continue;
      }
      if (ch === str) str = null;
      j += 1;
      continue;
    }
    if (ch === "/" && next === "/") {
      inLine = true;
      j += 2;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlock = true;
      j += 2;
      continue;
    }
    if (ch === "'" || ch === '"') {
      str = ch;
      j += 1;
      continue;
    }
    if (ch === "`") {
      // crude template skip
      j += 1;
      while (j < s.length) {
        if (s[j] === "\\") {
          j += 2;
          continue;
        }
        if (s[j] === "`") {
          j += 1;
          break;
        }
        if (s[j] === "$" && s[j + 1] === "{") {
          j += 2;
          let td = 1;
          while (j < s.length && td > 0) {
            if (s[j] === "'" || s[j] === '"') {
              const q = s[j++];
              while (j < s.length) {
                if (s[j] === "\\") {
                  j += 2;
                  continue;
                }
                if (s[j] === q) {
                  j += 1;
                  break;
                }
                j += 1;
              }
              continue;
            }
            if (s[j] === "{") td += 1;
            else if (s[j] === "}") td -= 1;
            j += 1;
          }
          continue;
        }
        j += 1;
      }
      continue;
    }
    if (ch === "{") d += 1;
    else if (ch === "}") d -= 1;
    j += 1;
  }
  const close = j - 1;
  if (d !== 0) throw new Error(`Unbalanced braces for const ${constName}`);
  return { open, close, markerIndex };
};

const parseObjectEntries = (source, open, close) => {
  const scanner = createScanner(source);
  scanner.index = open + 1;
  const entries = [];

  while (true) {
    scanner.skipWsAndComments();
    if (scanner.index >= close) break;
    if (source[scanner.index] === "}") break;

    const entryStart = scanner.index;
    const keyInfo = scanner.readKey();
    scanner.skipWsAndComments();
    if (source[scanner.index] !== ":") {
      throw new Error(`Expected ':' after key ${keyInfo.key}`);
    }
    scanner.index += 1;
    const value = scanner.readValueEnd();
    let entryEnd = value.end;
    scanner.skipWsAndComments();
    let trailingComma = false;
    if (source[scanner.index] === ",") {
      trailingComma = true;
      scanner.index += 1;
      entryEnd = scanner.index;
    }

    // Include the key line indent in entryStart so replacements/deletes do not
    // leave orphaned spaces before the key.
    let lineStart = source.lastIndexOf("\n", keyInfo.start - 1) + 1;
    if (!/^\s*$/.test(source.slice(lineStart, keyInfo.start))) {
      lineStart = keyInfo.start;
    }

    entries.push({
      key: keyInfo.key,
      keyRaw: keyInfo.raw,
      keyStart: keyInfo.start,
      keyEnd: keyInfo.end,
      valueStart: value.start,
      valueEnd: value.end,
      entryStart: lineStart,
      entryEnd,
      trailingComma,
    });
  }

  return entries;
};

const getNodesSection = (source) => {
  const range = findConstObject(source, "nodes");
  const entries = parseObjectEntries(source, range.open, range.close);
  return { ...range, entries };
};

const indentOf = (source, index) => {
  let lineStart = source.lastIndexOf("\n", index - 1) + 1;
  let indent = "";
  while (lineStart < source.length && (source[lineStart] === " " || source[lineStart] === "\t")) {
    indent += source[lineStart];
    lineStart += 1;
  }
  return indent;
};

const formatKey = (id, preferQuoted = false) => {
  if (preferQuoted || !/^[A-Za-z_$][\w$]*$/.test(id)) {
    return JSON.stringify(id);
  }
  return id;
};

const formatNodeEntry = (id, node, keyIndent, keyRaw = null) => {
  const rawObject = serializeValue(node, 2, 0);
  // serializeValue emits 2-space indents from column 0. Prefix every
  // continuation line with the key indent so nested } stay nested.
  const reindented = rawObject
    .split("\n")
    .map((line, index) => (index === 0 ? line : `${keyIndent}${line}`))
    .join("\n");

  const finalKey =
    keyRaw &&
    ((keyRaw.startsWith('"') && keyRaw.endsWith('"') && JSON.parse(keyRaw) === id) ||
      (keyRaw.startsWith("'") && keyRaw.endsWith("'") && keyRaw.slice(1, -1) === id) ||
      (!keyRaw.startsWith('"') && !keyRaw.startsWith("'") && keyRaw === id))
      ? keyRaw
      : formatKey(id, /[^A-Za-z0-9_$]/.test(id));

  return `${keyIndent}${finalKey}: ${reindented}`;
};

const writeContentSource = (nextSource) => {
  const sandbox = { window: {}, console };
  vm.runInNewContext(nextSource, sandbox, {
    filename: contentPath,
    timeout: 3000,
  });
  if (!sandbox.window.TyndexIrinaCallContent?.nodes) {
    throw new Error("Saved source failed to load TyndexIrinaCallContent");
  }
  fs.writeFileSync(contentPath, nextSource, "utf8");
  return sandbox.window.TyndexIrinaCallContent;
};

const upsertNodeInSource = (source, id, node, { create = false } = {}) => {
  const section = getNodesSection(source);
  const existing = section.entries.find((entry) => entry.key === id);

  if (existing && create) {
    throw new Error(`Node already exists: ${id}`);
  }
  if (!existing && !create) {
    throw new Error(`Unknown node: ${id}`);
  }

  if (existing) {
    const keyIndent = indentOf(source, existing.keyStart);
    let entryText = formatNodeEntry(id, node, keyIndent, existing.keyRaw);
    // Preserve trailing comma if original had one, or if not last entry
    const isLast =
      section.entries[section.entries.length - 1].key === id;
    const needsComma = existing.trailingComma || !isLast;
    if (needsComma) entryText += ",";

    // Keep a single newline after entry if original had more structure
    const before = source.slice(0, existing.entryStart);
    const after = source.slice(existing.entryEnd);
    // Trim one leading newline from after if entryEnd consumed comma only
    return before + entryText + after;
  }

  // Create: insert immediately after the last entry, preserving the
  // original whitespace before the closing `}` of the nodes object.
  const sample = section.entries[section.entries.length - 1];
  const keyIndent = sample ? indentOf(source, sample.keyStart) : "    ";
  const entryText = formatNodeEntry(id, node, keyIndent, null);

  let working = source;
  let insertAt;

  if (sample) {
    insertAt = sample.entryEnd;
    if (!sample.trailingComma) {
      working =
        working.slice(0, sample.valueEnd) + "," + working.slice(sample.valueEnd);
      insertAt += 1;
    }
  } else {
    insertAt = section.open + 1;
  }

  const insertion = `\n${entryText},`;
  return working.slice(0, insertAt) + insertion + working.slice(insertAt);
};

const deleteNodeInSource = (source, id) => {
  const section = getNodesSection(source);
  const index = section.entries.findIndex((entry) => entry.key === id);
  if (index === -1) throw new Error(`Unknown node: ${id}`);
  if (id === "intro" || id === "reclassification-entry") {
    throw new Error("Cannot delete entry nodes");
  }

  const entry = section.entries[index];
  let start = entry.entryStart;
  let end = entry.entryEnd;

  // Consume the preceding newline so the previous entry sits flush
  // against whatever follows (next entry or closing brace).
  if (start > 0 && source[start - 1] === "\n") start -= 1;

  return source.slice(0, start) + source.slice(end);
};

const isScalar = (value) =>
  value === null ||
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean";

const deepEqual = (left, right) => {
  if (left === right) return true;
  if (typeof left === "function" && typeof right === "function") {
    return (
      Function.prototype.toString.call(left) ===
      Function.prototype.toString.call(right)
    );
  }
  if (left == null || right == null) return left === right;
  if (typeof left !== typeof right) return false;
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) return false;
    if (left.length !== right.length) return false;
    return left.every((item, index) => deepEqual(item, right[index]));
  }
  if (typeof left === "object") {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) return false;
    return leftKeys.every(
      (key) => rightKeys.includes(key) && deepEqual(left[key], right[key])
    );
  }
  return false;
};

/**
 * Prefer patching only changed top-level scalar properties so neighboring
 * properties (choices, functions, media blocks) keep original formatting.
 * Falls back to whole-entry replace when keys are added/removed or a complex
 * property actually changes.
 */
const tryPatchNodeProperties = (source, id, nextNode, previousNode) => {
  const section = getNodesSection(source);
  const entry = section.entries.find((item) => item.key === id);
  if (!entry) return null;
  if (source[entry.valueStart] !== "{") return null;

  let close = entry.valueEnd - 1;
  while (close > entry.valueStart && source[close] !== "}") close -= 1;
  if (source[close] !== "}") return null;

  let props;
  try {
    props = parseObjectEntries(source, entry.valueStart, close);
  } catch {
    return null;
  }

  const prevKeys = props.map((prop) => prop.key);
  const nextKeys = Object.keys(nextNode);
  if (prevKeys.length !== nextKeys.length) return null;
  if (nextKeys.some((key) => !prevKeys.includes(key))) return null;
  if (prevKeys.some((key) => !nextKeys.includes(key))) return null;

  const patches = [];

  for (const prop of props) {
    const newVal = nextNode[prop.key];
    const oldVal = previousNode?.[prop.key];
    const oldText = source.slice(prop.valueStart, prop.valueEnd).trim();

    if (isScalar(newVal)) {
      const serialized = serializeValue(newVal, 2, 0);
      const oldLooksScalar =
        oldText === "null" ||
        oldText === "true" ||
        oldText === "false" ||
        /^-?\d+(\.\d+)?$/.test(oldText) ||
        (oldText.startsWith('"') && oldText.endsWith('"')) ||
        (oldText.startsWith("'") && oldText.endsWith("'"));
      if (!oldLooksScalar) return null;
      if (oldText !== serialized) {
        patches.push({
          start: prop.valueStart,
          end: prop.valueEnd,
          text: serialized,
        });
      }
      continue;
    }

    // Complex property: keep original source text if runtime value is unchanged.
    if (deepEqual(oldVal, newVal)) continue;
    return null;
  }

  if (!patches.length) return source;

  let nextSource = source;
  patches
    .sort((a, b) => b.start - a.start)
    .forEach((patch) => {
      nextSource =
        nextSource.slice(0, patch.start) + patch.text + nextSource.slice(patch.end);
    });
  return nextSource;
};

const saveNodeSurgically = (id, node, { create = false, previousNode = null } = {}) => {
  const source = fs.readFileSync(contentPath, "utf8");
  let nextSource;

  if (!create) {
    const patched = tryPatchNodeProperties(
      source,
      id,
      node,
      previousNode || node
    );
    if (patched != null) {
      nextSource = patched;
    } else {
      nextSource = upsertNodeInSource(source, id, node, { create: false });
    }
  } else {
    nextSource = upsertNodeInSource(source, id, node, { create: true });
  }

  const loaded = writeContentSource(nextSource);
  return loaded.nodes[id];
};

const deleteNodeSurgically = (id) => {
  const source = fs.readFileSync(contentPath, "utf8");
  const nextSource = deleteNodeInSource(source, id);
  writeContentSource(nextSource);
};

const reviveNodePayload = (payload) => {
  // Accept plain objects; function fields may arrive as { __fn: "..." }
  const revive = (value) => {
    if (value && typeof value === "object" && typeof value.__fn === "string") {
      // eslint-disable-next-line no-new-func
      return new Function(`return (${value.__fn});`)();
    }
    if (Array.isArray(value)) return value.map(revive);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, revive(v)])
      );
    }
    return value;
  };
  return revive(payload);
};

const projectNode = (id, node) => {
  const project = (value) => {
    if (typeof value === "function") {
      return { __fn: Function.prototype.toString.call(value) };
    }
    if (Array.isArray(value)) return value.map(project);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, project(v)])
      );
    }
    return value;
  };
  return { id, ...project(node) };
};

const sendJson = (res, status, data) => {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });

const safeJoin = (root, requestPath) => {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const clean = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(root, clean);
  if (!full.startsWith(root)) return null;
  return full;
};

const serveStatic = (req, res, urlPath) => {
  let rel = urlPath === "/" ? "/index.html" : urlPath;
  if (rel === "/admin" || rel === "/admin/") rel = "/admin/index.html";
  const full = safeJoin(projectRoot, rel);
  if (!full || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    res.writeHead(404).end("Not found");
    return;
  }
  const ext = path.extname(full).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  fs.createReadStream(full).pipe(res);
};

const publicCopydeskIndex = (index) => ({
  game: index.game,
  nodes: index.nodes,
  characters: index.characters,
  lines: index.lines.map((line) => ({
    id: line.id,
    game: line.game,
    nodeId: line.nodeId,
    bucket: line.bucket,
    field: line.field,
    speaker: line.speaker,
    kind: line.kind,
    text: line.text,
    fn: line.fn,
    unique: line.unique,
    occurrences: line.occurrences,
  })),
});

const handleApi = async (req, res, url) => {
  const { pathname } = url;

  if (req.method === "GET" && pathname === "/api/copydesk/games") {
    return sendJson(res, 200, { games: copydesk.listGames() });
  }

  if (req.method === "GET" && pathname.startsWith("/api/copydesk/") && pathname.endsWith("/script")) {
    const gameId = decodeURIComponent(pathname.slice("/api/copydesk/".length, -"/script".length));
    try {
      return sendJson(res, 200, publicCopydeskIndex(copydesk.indexGame(gameId)));
    } catch (error) {
      return sendJson(res, 400, { error: error.message || String(error) });
    }
  }

  if (req.method === "PUT" && pathname.startsWith("/api/copydesk/") && pathname.endsWith("/line")) {
    const gameId = decodeURIComponent(pathname.slice("/api/copydesk/".length, -"/line".length));
    const raw = await readBody(req);
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return sendJson(res, 400, { error: "Invalid JSON" });
    }
    try {
      const index = copydesk.patchLine(
        gameId,
        payload.id,
        payload.expected,
        payload.text
      );
      return sendJson(res, 200, publicCopydeskIndex(index));
    } catch (error) {
      return sendJson(res, 400, { error: error.message || String(error) });
    }
  }

  if (req.method === "POST" && pathname.startsWith("/api/copydesk/") && pathname.endsWith("/rename")) {
    const gameId = decodeURIComponent(pathname.slice("/api/copydesk/".length, -"/rename".length));
    const raw = await readBody(req);
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return sendJson(res, 400, { error: "Invalid JSON" });
    }
    try {
      const result = copydesk.renameCharacter(gameId, payload.from, payload.to);
      return sendJson(res, 200, {
        from: result.from,
        to: result.to,
        contentReplacements: result.contentReplacements,
        extras: result.extras,
        ...publicCopydeskIndex(result.index),
      });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || String(error) });
    }
  }

  if (req.method === "GET" && pathname === "/api/health") {
    return sendJson(res, 200, { ok: true, contentPath: "content/irina/call-content.js" });
  }

  if (req.method === "GET" && pathname === "/api/meta") {
    const { content } = loadContent();
    const nodes = content.nodes;
    const list = Object.entries(nodes).map(([id, node]) => ({
      id,
      step: node.step || "",
      speaker: node.speaker || "",
      media: node.media || "",
      hasInput: Boolean(node.input),
      textKind: typeof node.text,
      choicesKind: typeof node.choices,
      choiceCount: Array.isArray(node.choices) ? node.choices.length : null,
      autoNext: node.autoNext || null,
    }));
    return sendJson(res, 200, {
      version: content.version,
      curatorId: content.curatorId,
      nodeCount: list.length,
      artifactCount: Object.keys(content.staffArtifacts || {}).length,
      fileCount: Object.keys(content.files || {}).length,
      messageCount: Object.keys(content.staffMessages || {}).length,
      nodes: list,
    });
  }

  if (req.method === "GET" && pathname.startsWith("/api/nodes/")) {
    const id = decodeURIComponent(pathname.slice("/api/nodes/".length));
    const { content } = loadContent();
    const node = content.nodes[id];
    if (!node) return sendJson(res, 404, { error: `Unknown node: ${id}` });
    return sendJson(res, 200, projectNode(id, node));
  }

  if (req.method === "PUT" && pathname.startsWith("/api/nodes/")) {
    const id = decodeURIComponent(pathname.slice("/api/nodes/".length));
    const raw = await readBody(req);
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return sendJson(res, 400, { error: "Invalid JSON" });
    }

    const { content, source } = loadContent();
    const create = Boolean(payload.create) && !content.nodes[id];
    if (!content.nodes[id] && !payload.create) {
      return sendJson(res, 404, {
        error: `Unknown node: ${id}. Pass create:true to add.`,
      });
    }

    const { id: _ignore, create: _c, ...rest } = payload;
    const revived = reviveNodePayload(rest);

    try {
      // Merge with existing node so omitted runtime-only fields are not wiped
      // when the client sends a partial editor payload.
      const previousNode = create ? null : content.nodes[id];
      const merged = create ? revived : { ...previousNode, ...revived };
      const saved = saveNodeSurgically(id, merged, {
        create,
        previousNode,
      });
      const after = fs.readFileSync(contentPath, "utf8");
      return sendJson(res, 200, {
        ok: true,
        id,
        surgical: true,
        bytesBefore: source.length,
        bytesAfter: after.length,
        node: projectNode(id, saved),
      });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || String(error) });
    }
  }

  if (req.method === "POST" && pathname === "/api/nodes") {
    const raw = await readBody(req);
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return sendJson(res, 400, { error: "Invalid JSON" });
    }
    const id = String(payload.id || "").trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      return sendJson(res, 400, {
        error: "id must be kebab-case (a-z0-9 and hyphens)",
      });
    }
    const { content } = loadContent();
    if (content.nodes[id]) {
      return sendJson(res, 409, { error: `Node already exists: ${id}` });
    }
    const node = reviveNodePayload({
      step: payload.step || "ЧЕРНОВИК",
      media: payload.media || "state-neutral",
      speaker: payload.speaker || "ИРИНА В.",
      text: payload.text || "Новая реплика.",
      choices: payload.choices || [
        { label: "ПРОДОЛЖИТЬ", next: payload.next || "intro" },
      ],
    });
    try {
      const saved = saveNodeSurgically(id, node, { create: true });
      return sendJson(res, 201, {
        ok: true,
        id,
        surgical: true,
        node: projectNode(id, saved),
      });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || String(error) });
    }
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/nodes/")) {
    const id = decodeURIComponent(pathname.slice("/api/nodes/".length));
    if (id === "intro" || id === "reclassification-entry") {
      return sendJson(res, 400, { error: "Cannot delete entry nodes" });
    }
    const { content } = loadContent();
    if (!content.nodes[id]) return sendJson(res, 404, { error: "Not found" });
    try {
      deleteNodeSurgically(id);
      return sendJson(res, 200, { ok: true, deleted: id, surgical: true });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || String(error) });
    }
  }

  if (req.method === "POST" && pathname === "/api/validate") {
    const result = spawnSync(
      process.execPath,
      [path.join(projectRoot, "scripts", "validate-irina-call-content.js")],
      { encoding: "utf8", cwd: projectRoot }
    );
    return sendJson(res, result.status === 0 ? 200 : 400, {
      ok: result.status === 0,
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
    });
  }

  if (req.method === "POST" && pathname === "/api/export") {
    const result = spawnSync(
      process.execPath,
      [path.join(projectRoot, "scripts", "export-irina-dialogues.js")],
      { encoding: "utf8", cwd: projectRoot }
    );
    return sendJson(res, result.status === 0 ? 200 : 400, {
      ok: result.status === 0,
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
    });
  }

  if (req.method === "GET" && pathname === "/api/graph") {
    const { content } = loadContent();
    const edges = [];
    const addEdge = (from, to, label = "") => {
      if (!to) return;
      edges.push({ from, to, label });
    };
    Object.entries(content.nodes).forEach(([id, node]) => {
      if (node.autoNext) addEdge(id, node.autoNext, "auto");
      if (node.input?.next) addEdge(id, node.input.next, "input");
      if (Array.isArray(node.choices)) {
        node.choices.forEach((choice) => {
          if (choice?.next) addEdge(id, choice.next, choice.label || "");
        });
      } else if (typeof node.choices === "function") {
        edges.push({ from: id, to: id, label: "(function choices)" });
      }
    });
    return sendJson(res, 200, {
      nodes: Object.keys(content.nodes).map((id) => ({ id })),
      edges,
    });
  }

  return sendJson(res, 404, { error: "Unknown API route" });
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${HOST}:${PORT}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(req, res, url.pathname);
  } catch (error) {
    sendJson(res, 500, { error: error.message || String(error) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Copy Desk:     http://${HOST}:${PORT}/admin/`);
  console.log(`Node inspector: http://${HOST}:${PORT}/admin/nodes.html`);
  console.log(`Site preview:   http://${HOST}:${PORT}/hiring.html`);
});
