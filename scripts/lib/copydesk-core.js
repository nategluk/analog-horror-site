"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..", "..");

const SKIP_KEYS = new Set([
  "media",
  "feedState",
  "signal",
  "still",
  "stillAlt",
  "feedMode",
  "autoNext",
  "delay",
  "visual",
  "scene",
  "room",
  "artifact",
  "artifacts",
  "guest",
  "props",
  "sound",
  "inspect",
  "next",
  "id",
  "complete",
  "effect",
  "reject",
  "downloadFile",
  "image",
  "headerImage",
  "avatar",
  "src",
  "downloadName",
  "curatorId",
  "version",
  "startNode",
  "artifactId",
  "quietSleepArtifactId",
  "attachmentArtifactId",
  "code",
  "delayChoicesUntilEnd",
  "terminal",
  "glitchIn",
  "flashOnEnd",
  "restart",
  "leave",
  "guestExit",
  "rewardVideo",
  "waitReward",
  "coffeeReward",
  "complete",
  "kind",
  "select",
  "set",
  "hideIf",
  "pigOutcome",
  "require",
  "requireAny",
  "dogOutcome",
  "receiptVariant",
  "showFor",
  "hideFor",
  "inspect",
  "loop",
  "href",
  "exit",
  "popup",
]);

const SYSTEM_SPEAKERS = new Set(["СИСТЕМА", "КАССА", "ЗАПИСКА", "СМЕНА", "ЗАПИСЬ"]);

const GAMES = {
  irina: {
    id: "irina",
    title: "Куратор Ирина",
    file: "content/irina/call-content.js",
    globalName: "TyndexIrinaCallContent",
    startNode: "intro",
    catalogs: ["rewardCopy", "files"],
    inbox: "staffMessages",
    lockedSpeakers: ["СИСТЕМА"],
    extraNameFiles: ["js/app.js", "hiring.html", "staff.html"],
  },
  lora: {
    id: "lora",
    title: "Красная комната",
    file: "content/lora/red-room-content.js",
    globalName: "TyndexLoraRedRoomContent",
    startNode: "assign_notice",
    catalogs: ["receiptVariants", "receiptCopyHooks", "quietSleepGift"],
    inbox: null,
    lockedSpeakers: ["Я", "ВЫ", "СИСТЕМА", "КАССА", "ЗАПИСКА", "СМЕНА"],
    extraNameFiles: ["js/app.js"],
  },
  pavel: {
    id: "pavel",
    title: "Кабинка обозрения",
    file: "content/pavel/observation-booth-content.js",
    globalName: "TyndexPavelObservationBoothContent",
    startNode: "booth-intro",
    catalogs: [],
    inbox: null,
    lockedSpeakers: ["СИСТЕМА", "ВЫ", "Я", "ГОЛОС ИЗ СЛИВА", "ПРОВОДНИЦА", "ЗАПИСКА"],
    extraNameFiles: [],
  },
  solnyshko: {
    id: "solnyshko",
    title: "Парк Солнышко после закрытия",
    file: "content/irina/solnyshko-park-content.js",
    globalName: "TyndexIrinaSolnyshkoContent",
    startNode: "gate-night",
    catalogs: [],
    inbox: null,
    lockedSpeakers: ["СИСТЕМА", "ВЫ", "Я"],
    extraNameFiles: [],
  },
};

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
        key: decodeJsString(source.slice(start, i)),
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
    if (ch === "{" || ch === "[") {
      const close = ch === "{" ? "}" : "]";
      i += 1;
      skipBalanced(ch, close);
      return { start, end: i };
    }
    if (ch === "(") {
      i += 1;
      skipBalanced("(", ")");
      skipWsAndComments();
      if (peek() === "=" && source[i + 1] === ">") {
        i += 2;
        skipWsAndComments();
        const body = readValueEnd();
        return { start, end: body.end };
      }
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
    if (source.startsWith("function", i) || source.startsWith("async", i)) {
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
  };
};

const decodeJsString = (raw) => {
  if (!raw) return "";
  const quote = raw[0];
  if (quote === "`") {
    if (raw.includes("${")) return null;
    return raw.slice(1, -1).replace(/\\`/g, "`").replace(/\\\$/g, "$").replace(/\\n/g, "\n");
  }
  if (quote !== '"' && quote !== "'") return raw;
  let out = "";
  for (let i = 1; i < raw.length - 1; i += 1) {
    const ch = raw[i];
    if (ch !== "\\") {
      out += ch;
      continue;
    }
    const next = raw[i + 1];
    i += 1;
    if (next === "n") out += "\n";
    else if (next === "t") out += "\t";
    else if (next === "r") out += "\r";
    else if (next) out += next;
  }
  return out;
};

const encodeJsString = (value, quote = '"') => {
  if (quote === "'") {
    return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r")}'`;
  }
  return JSON.stringify(value);
};

const findConstObject = (source, constName) => {
  const marker = `const ${constName} =`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return null;
  let i = markerIndex + marker.length;
  while (i < source.length && /\s/.test(source[i])) i += 1;
  if (source[i] !== "{") return null;
  const scanner = createScanner(source);
  scanner.index = i + 1;
  const value = (() => {
    const nested = createScanner(source);
    nested.index = i;
    nested.readValueEnd();
    return { open: i, close: nested.index - 1 };
  })();
  return value;
};

const parseObjectEntries = (source, open, close) => {
  const scanner = createScanner(source);
  scanner.index = open + 1;
  const entries = [];
  while (true) {
    scanner.skipWsAndComments();
    if (scanner.index >= close) break;
    if (source[scanner.index] === "}") break;
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

const collectLiterals = (source, from, to) => {
  const out = [];
  let i = from;
  let inLine = false;
  let inBlock = false;
  while (i < to) {
    const ch = source[i];
    const next = source[i + 1];
    if (inLine) {
      if (ch === "\n") inLine = false;
      i += 1;
      continue;
    }
    if (inBlock) {
      if (ch === "*" && next === "/") {
        inBlock = false;
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }
    if (ch === "/" && next === "/") {
      inLine = true;
      i += 2;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlock = true;
      i += 2;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const start = i;
      const scanner = createScanner(source);
      scanner.index = i;
      scanner.readValueEnd();
      const raw = source.slice(start, scanner.index);
      const value = decodeJsString(raw);
      if (value != null) {
        out.push({ start, end: scanner.index, quote: ch, value, raw });
      }
      i = scanner.index;
      continue;
    }
    if (ch === "`") {
      const start = i;
      const scanner = createScanner(source);
      scanner.index = i;
      scanner.readValueEnd();
      const raw = source.slice(start, scanner.index);
      if (!raw.includes("${")) {
        const value = decodeJsString(raw);
        if (value != null) {
          out.push({ start, end: scanner.index, quote: "`", value, raw });
        }
      }
      i = scanner.index;
      continue;
    }
    i += 1;
  }
  return out;
};

const looksLikeMechanicToken = (value) =>
  /^[a-z][a-zA-Z0-9_-]*$/.test(value) && !/\s/.test(value);

const looksLikeFunction = (source, start, end) => {
  const head = source.slice(start, Math.min(end, start + 80)).trim();
  return (
    head.startsWith("function") ||
    head.startsWith("async") ||
    head.includes("=>")
  );
};

const lineKind = (gameId, { speaker, field }) => {
  if (field === "speaker") return "name";
  if (field === "step") return "meta";
  if (field.startsWith("choice") || field === "label" || field.includes("choice")) {
    return "choice";
  }
  if (
    field.includes("message") ||
    field.includes("staff") ||
    field === "subject" ||
    field === "preview" ||
    field === "body" ||
    field === "sender"
  ) {
    return "message";
  }
  if (
    field.includes("receipt") ||
    field.includes("gift") ||
    field.includes("reward") ||
    field.includes("stamp") ||
    field.includes("title") ||
    field.startsWith("catalog:")
  ) {
    return "popup";
  }
  if (field === "action") return speaker && SYSTEM_SPEAKERS.has(speaker) ? "system" : "thought";
  if (gameId === "lora" || gameId === "pavel" || gameId === "solnyshko") {
    if (speaker === "Я" || speaker === "ВЫ") return "thought";
    if (SYSTEM_SPEAKERS.has(speaker)) return "system";
    return "dialogue";
  }
  if (SYSTEM_SPEAKERS.has(speaker)) return "system";
  return "dialogue";
};

const collectFromValue = (ctx, source, start, end, fieldPath, speaker) => {
  const trimmedStart = (() => {
    let i = start;
    while (i < end && /\s/.test(source[i])) i += 1;
    return i;
  })();
  const first = source[trimmedStart];

  if (first === '"' || first === "'" || first === "`") {
    const lits = collectLiterals(source, trimmedStart, end);
    const lit = lits[0];
    if (!lit) return;
    pushLine(ctx, {
      field: fieldPath,
      speaker,
      text: lit.value,
      start: lit.start,
      end: lit.end,
      quote: lit.quote,
      fn: false,
    });
    return;
  }

  if (first === "{") {
    let close = end - 1;
    while (close > trimmedStart && source[close] !== "}") close -= 1;
    const entries = parseObjectEntries(source, trimmedStart, close);
    entries.forEach((entry) => {
      if (SKIP_KEYS.has(entry.key)) return;
      const nextSpeaker = entry.key === "speaker" ? null : speaker;
      collectFromValue(
        ctx,
        source,
        entry.valueStart,
        entry.valueEnd,
        fieldPath ? `${fieldPath}.${entry.key}` : entry.key,
        nextSpeaker
      );
    });
    return;
  }

  if (first === "[") {
    const scanner = createScanner(source);
    scanner.index = trimmedStart + 1;
    let index = 0;
    while (scanner.index < end) {
      scanner.skipWsAndComments();
      if (source[scanner.index] === "]") break;
      const value = scanner.readValueEnd();
      collectFromValue(
        ctx,
        source,
        value.start,
        value.end,
        `${fieldPath}[${index}]`,
        speaker
      );
      index += 1;
      scanner.skipWsAndComments();
      if (source[scanner.index] === ",") scanner.index += 1;
    }
    return;
  }

  if (looksLikeFunction(source, trimmedStart, end)) {
    const lits = collectLiterals(source, trimmedStart, end).filter(
      (lit) => lit.value && lit.value.length > 0
    );
    lits.forEach((lit, index) => {
      if (looksLikeMechanicToken(lit.value)) return;
      pushLine(ctx, {
        field: `${fieldPath}.fn[${index}]`,
        speaker,
        text: lit.value,
        start: lit.start,
        end: lit.end,
        quote: lit.quote,
        fn: true,
      });
    });
  }
};

const pushLine = (ctx, line) => {
  if (line.text == null || line.text === "") return;
  const id = `${ctx.bucket}:${ctx.nodeId}:${line.field}`;
  ctx.lines.push({
    id,
    game: ctx.gameId,
    nodeId: ctx.nodeId,
    bucket: ctx.bucket,
    field: line.field,
    speaker: line.speaker || "",
    kind: lineKind(ctx.gameId, {
      speaker: line.speaker || "",
      field: line.field,
    }),
    text: line.text,
    start: line.start,
    end: line.end,
    quote: line.quote,
    fn: Boolean(line.fn),
  });
};

const loadGameSource = (gameId) => {
  const game = GAMES[gameId];
  if (!game) throw new Error(`Unknown game: ${gameId}`);
  const filePath = path.join(projectRoot, game.file);
  const source = fs.readFileSync(filePath, "utf8");
  return { game, filePath, source };
};

const indexGame = (gameId) => {
  const { game, filePath, source } = loadGameSource(gameId);
  const lines = [];
  const nodesRange = findConstObject(source, "nodes");
  if (!nodesRange) throw new Error(`nodes object missing in ${game.file}`);
  const nodeEntries = parseObjectEntries(source, nodesRange.open, nodesRange.close);

  nodeEntries.forEach((nodeEntry) => {
    const ctx = {
      gameId,
      bucket: "node",
      nodeId: nodeEntry.key,
      lines,
      scanner: createScanner(source),
    };
    let speaker = "";
    let close = nodeEntry.valueEnd - 1;
    while (close > nodeEntry.valueStart && source[close] !== "}") close -= 1;
    const props = parseObjectEntries(source, nodeEntry.valueStart, close);
    const speakerProp = props.find((prop) => prop.key === "speaker");
    if (speakerProp) {
      const lit = collectLiterals(source, speakerProp.valueStart, speakerProp.valueEnd)[0];
      speaker = lit ? lit.value : "";
    }
    props.forEach((prop) => {
      if (prop.key === "speaker") {
        collectFromValue(ctx, source, prop.valueStart, prop.valueEnd, "speaker", speaker);
        return;
      }
      if (SKIP_KEYS.has(prop.key)) return;
      if (prop.key === "choices") {
        collectChoices(ctx, source, prop, speaker);
        return;
      }
      if (prop.key === "input") {
        collectFromValue(ctx, source, prop.valueStart, prop.valueEnd, "input", speaker);
        return;
      }
      collectFromValue(ctx, source, prop.valueStart, prop.valueEnd, prop.key, speaker);
    });
  });

  game.catalogs.forEach((name) => {
    const range = findConstObject(source, name);
    if (!range) return;
    const ctx = {
      gameId,
      bucket: "catalog",
      nodeId: name,
      lines,
      scanner: createScanner(source),
    };
    collectFromValue(ctx, source, range.open, range.close + 1, `catalog:${name}`, "");
  });

  const messages = [];
  if (game.inbox) {
    const range = findConstObject(source, game.inbox);
    if (range) {
      const messageEntries = parseObjectEntries(source, range.open, range.close);
      messageEntries.forEach((entry) => {
        let close = entry.valueEnd - 1;
        while (close > entry.valueStart && source[close] !== "}") close -= 1;
        const props = parseObjectEntries(source, entry.valueStart, close);
        let sender = "";
        const senderProp = props.find((prop) => prop.key === "sender");
        if (senderProp) {
          const lit = collectLiterals(
            source,
            senderProp.valueStart,
            senderProp.valueEnd
          )[0];
          sender = lit ? lit.value : "";
        }
        const ctx = {
          gameId,
          bucket: "inbox",
          nodeId: entry.key,
          lines,
          scanner: createScanner(source),
        };
        props.forEach((prop) => {
          if (SKIP_KEYS.has(prop.key)) return;
          collectFromValue(
            ctx,
            source,
            prop.valueStart,
            prop.valueEnd,
            prop.key,
            sender
          );
        });
        const subjectLine = lines.find(
          (line) => line.bucket === "inbox" && line.nodeId === entry.key && line.field === "subject"
        );
        const previewLine = lines.find(
          (line) => line.bucket === "inbox" && line.nodeId === entry.key && line.field === "preview"
        );
        messages.push({
          id: entry.key,
          sender,
          subject: subjectLine ? subjectLine.text : "",
          preview: previewLine ? previewLine.text : "",
        });
      });
    }
  }

  const counts = {};
  lines.forEach((line) => {
    counts[line.text] = (counts[line.text] || 0) + 1;
  });
  lines.forEach((line) => {
    line.occurrences = counts[line.text];
    line.unique = counts[line.text] === 1;
  });

  const nodes = [];
  const byNode = new Map();
  lines
    .filter((line) => line.bucket === "node")
    .forEach((line) => {
      if (!byNode.has(line.nodeId)) {
        byNode.set(line.nodeId, {
          id: line.nodeId,
          speaker: line.speaker,
          preview: "",
          kinds: new Set(),
          outbound: [],
        });
      }
      const node = byNode.get(line.nodeId);
      if (line.field === "speaker") node.speaker = line.text;
      if (!node.preview && line.kind !== "name" && line.kind !== "choice") {
        node.preview = line.text.replace(/\s+/g, " ").slice(0, 140);
      }
      node.kinds.add(line.kind);
    });

  nodeEntries.forEach((nodeEntry) => {
    const node = byNode.get(nodeEntry.key) || {
      id: nodeEntry.key,
      speaker: "",
      preview: "",
      kinds: new Set(),
      outbound: [],
    };
    let close = nodeEntry.valueEnd - 1;
    while (close > nodeEntry.valueStart && source[close] !== "}") close -= 1;
    const props = parseObjectEntries(source, nodeEntry.valueStart, close);
    props.forEach((prop) => {
      if (prop.key === "autoNext") {
        const lit = collectLiterals(source, prop.valueStart, prop.valueEnd)[0];
        if (lit) node.outbound.push({ to: lit.value, label: "auto" });
      }
      if (prop.key === "choices" && source[prop.valueStart] !== "(" && !looksLikeFunction(source, prop.valueStart, prop.valueEnd)) {
        const choiceLines = lines.filter(
          (line) => line.nodeId === nodeEntry.key && line.field.startsWith("choices")
        );
        const nexts = collectLiterals(source, prop.valueStart, prop.valueEnd).filter((lit) => {
          const keyBefore = source.lastIndexOf(":", lit.start);
          const keySlice = source.slice(Math.max(prop.valueStart, keyBefore - 12), keyBefore);
          return /next\s*$/.test(keySlice);
        });
        nexts.forEach((lit, index) => {
          const labelLine = choiceLines.find((line) =>
            line.field.startsWith(`choices[${index}]`)
          );
          node.outbound.push({
            to: lit.value,
            label: labelLine ? labelLine.text : "→",
          });
        });
      }
    });
    node.kinds = [...node.kinds];
    nodes.push(node);
  });

  const speakers = {};
  lines
    .filter((line) => line.field === "speaker" || line.field === "sender")
    .forEach((line) => {
      speakers[line.text] = (speakers[line.text] || 0) + 1;
    });

  return {
    game: {
      id: game.id,
      title: game.title,
      file: game.file,
      startNode: game.startNode,
      lockedSpeakers: game.lockedSpeakers,
    },
    filePath,
    source,
    lines,
    nodes,
    messages,
    characters: Object.entries(speakers).map(([name, nodeCount]) => ({
      name,
      nodeCount,
      locked: game.lockedSpeakers.includes(name),
      mentions: lines.filter(
        (line) =>
          line.field !== "speaker" &&
          line.field !== "sender" &&
          typeof line.text === "string" &&
          line.text.includes(name)
      ).length,
    })),
  };
};

const collectChoices = (ctx, source, prop, speaker) => {
  if (looksLikeFunction(source, prop.valueStart, prop.valueEnd)) {
    collectFromValue(ctx, source, prop.valueStart, prop.valueEnd, "choices", speaker);
    return;
  }
  collectFromValue(ctx, source, prop.valueStart, prop.valueEnd, "choices", speaker);
};

const listGames = () =>
  Object.values(GAMES).map((game) => ({
    id: game.id,
    title: game.title,
    file: game.file,
  }));

const patchLine = (gameId, lineId, expected, nextText) => {
  const index = indexGame(gameId);
  const line = index.lines.find((item) => item.id === lineId);
  if (!line) throw new Error(`Unknown line: ${lineId}`);
  if (line.text !== expected) {
    throw new Error("Текст уже изменился. Обновите список и повторите.");
  }
  if (line.fn && !line.unique) {
    throw new Error(
      "Эта строка внутри функции встречается больше одного раза. Правьте только уникальные строки."
    );
  }
  const encoded = encodeJsString(nextText, line.quote);
  const nextSource =
    index.source.slice(0, line.start) + encoded + index.source.slice(line.end);
  writeGameSource(gameId, nextSource);
  return indexGame(gameId);
};

const writeGameSource = (gameId, nextSource) => {
  const { game, filePath } = loadGameSource(gameId);
  const sandbox = { window: {}, console };
  vm.runInNewContext(nextSource, sandbox, { filename: filePath, timeout: 4000 });
  if (!sandbox.window[game.globalName]) {
    throw new Error(`Saved source failed to load ${game.globalName}`);
  }
  fs.writeFileSync(filePath, nextSource, "utf8");
};

const replaceExactLiterals = (source, from, to) => {
  const lits = collectLiterals(source, 0, source.length);
  const matches = lits.filter((lit) => lit.value === from);
  let next = source;
  matches
    .slice()
    .sort((a, b) => b.start - a.start)
    .forEach((lit) => {
      next = next.slice(0, lit.start) + encodeJsString(to, lit.quote) + next.slice(lit.end);
    });
  return { next, count: matches.length };
};

const replaceExactText = (source, from, to) => {
  if (!from) return { next: source, count: 0 };
  let count = 0;
  let next = "";
  let i = 0;
  while (i < source.length) {
    const hit = source.indexOf(from, i);
    if (hit === -1) {
      next += source.slice(i);
      break;
    }
    next += source.slice(i, hit) + to;
    count += 1;
    i = hit + from.length;
  }
  return { next, count };
};

const renameCharacter = (gameId, from, to) => {
  const game = GAMES[gameId];
  if (!game) throw new Error(`Unknown game: ${gameId}`);
  const trimmed = String(to || "").trim();
  if (!from || !trimmed) throw new Error("Нужны старое и новое имя");
  if (from === trimmed) throw new Error("Имя не изменилось");
  if (game.lockedSpeakers.includes(from)) {
    throw new Error(
      `«${from}» — роль панели (мысль / система), не имя героя. Такие подписи лучше не переименовывать оптом.`
    );
  }
  const index = indexGame(gameId);
  const names = new Set(index.characters.map((item) => item.name));
  if (!names.has(from)) throw new Error(`Герой «${from}» не найден`);
  if (names.has(trimmed)) {
    throw new Error(`Имя «${trimmed}» уже занято другим говорящим`);
  }

  const { next, count } = replaceExactLiterals(index.source, from, trimmed);
  if (!count) throw new Error("В файле сценария точных строковых литералов с этим именем нет");
  writeGameSource(gameId, next);

  const extras = [];
  (game.extraNameFiles || []).forEach((rel) => {
    const full = path.join(projectRoot, rel);
    if (!fs.existsSync(full)) return;
    const original = fs.readFileSync(full, "utf8");
    const asLiteral = replaceExactLiterals(original, from, trimmed);
    let working = asLiteral.next;
    let extraCount = asLiteral.count;
    if (rel.endsWith(".html")) {
      const html = replaceExactText(working, from, trimmed);
      working = html.next;
      extraCount = html.count;
    }
    if (extraCount > 0 && working !== original) {
      fs.writeFileSync(full, working, "utf8");
      extras.push({ file: rel, count: extraCount });
    }
  });

  return {
    from,
    to: trimmed,
    contentReplacements: count,
    extras,
    index: indexGame(gameId),
  };
};

const deleteInboxMessage = (gameId, messageId) => {
  const game = GAMES[gameId];
  if (!game) throw new Error(`Unknown game: ${gameId}`);
  if (!game.inbox) throw new Error("В этой игре нет писем личного кабинета");
  const id = String(messageId || "").trim();
  if (!id) throw new Error("Нужен id сообщения");

  const { source } = loadGameSource(gameId);
  const range = findConstObject(source, game.inbox);
  if (!range) throw new Error(`Не найден каталог ${game.inbox}`);
  const entries = parseObjectEntries(source, range.open, range.close);
  const index = entries.findIndex((entry) => entry.key === id);
  if (index === -1) throw new Error(`Сообщение «${id}» не найдено`);

  const entry = entries[index];
  let start = entry.entryStart;
  let end = entry.entryEnd;
  if (start > 0 && source[start - 1] === "\n") start -= 1;

  const nextSource = source.slice(0, start) + source.slice(end);
  writeGameSource(gameId, nextSource);
  return indexGame(gameId);
};

module.exports = {
  GAMES,
  listGames,
  indexGame,
  patchLine,
  renameCharacter,
  deleteInboxMessage,
  projectRoot,
};
