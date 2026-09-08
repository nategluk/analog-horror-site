"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {
  projectRoot,
  createScanner,
  parseObjectEntries,
  collectLiterals,
  encodeJsString,
  decodeJsString,
} = require("./copydesk-core");

const BUDGET_FILE = path.join(projectRoot, "content", "archive", "copydesk-layout-budgets.json");
const ARCHIVE_PAGE = path.join(projectRoot, "archive.html");

const RECORDS = [
  {
    id: "protocol-312-t",
    kind: "protocol",
    title: "ПРОТОКОЛ THERAPY",
    file: "documents/protocol-312-t.html",
    layout: "flow",
  },
  {
    id: "protocol-312-r",
    kind: "protocol",
    title: "ПРОТОКОЛ AFTERMATH",
    file: "documents/protocol-312-r.html",
    layout: "flow",
  },
  {
    id: "protocol-playground",
    kind: "protocol",
    title: "ПРОТОКОЛ PLAYGROUND",
    file: "documents/protocol-playground.html",
    layout: "flow",
  },
  {
    id: "protocol-kidults",
    kind: "protocol",
    title: "ПРОТОКОЛ KIDULTS",
    file: "documents/protocol-kidults.html",
    content: "content/book/kidults-protocol.js",
    layout: "locked",
    readerPages: 12,
    globalName: "DZ_SWEET_DREAM_BOOK",
  },
  {
    id: "protocol-avd-312-17",
    kind: "protocol",
    title: "ПРОТОКОЛ FAITH",
    file: "documents/protocol-avd-312-17.html",
    layout: "flow",
  },
  {
    id: "protocol-media-integration",
    kind: "protocol",
    title: "ПРОТОКОЛ CONDUIT",
    file: "documents/protocol-media-integration.html",
    layout: "flow",
  },
  {
    id: "dossier-sz-312",
    kind: "dossier",
    title: "ПРОВОДНИЦА",
    file: "documents/dossier-sz-312.html",
    layout: "flow",
  },
  {
    id: "dossier-irina",
    kind: "dossier",
    title: "МЕДВЕДЬ / ИРИНА В.",
    file: "documents/dossier-irina.html",
    layout: "flow",
  },
  {
    id: "dossier-laura",
    kind: "dossier",
    title: "ОФИЦИАНТКА / ЛОРА П.",
    file: "documents/dossier-laura.html",
    layout: "flow",
  },
  {
    id: "dossier-kirill-zaytsev",
    kind: "dossier",
    title: "ЗАЯЦ / КИРИЛЛ ЗАЙЦЕВ",
    file: "documents/dossier-kirill-zaytsev.html",
    layout: "flow",
  },
  {
    id: "dossier-pavel",
    kind: "dossier",
    title: "КОТ / ПАВЕЛ К.",
    file: "documents/dossier-pavel.html",
    layout: "flow",
  },
  {
    id: "book-sweet-dream",
    kind: "book",
    title: "КНИГА СЛАДКОГО СНА",
    file: "documents/book-sweet-dream.html",
    content: "content/book/sweet-dream-book.js",
    layout: "locked",
    readerPages: 22,
    globalName: "DZ_SWEET_DREAM_BOOK",
  },
];

const KIND_GROUP = {
  protocol: "Протоколы",
  dossier: "Досье",
  book: "Книги",
};

const charCount = (value) => [...String(value || "")].length;

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const decodeEntities = (value) =>
  String(value || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const stripTags = (html) =>
  decodeEntities(String(html || "").replace(/<[^>]+>/g, "")).replace(/\r\n/g, "\n");

const loadBudgets = () => {
  if (!fs.existsSync(BUDGET_FILE)) return {};
  return JSON.parse(fs.readFileSync(BUDGET_FILE, "utf8"));
};

const saveBudgets = (budgets) => {
  fs.mkdirSync(path.dirname(BUDGET_FILE), { recursive: true });
  fs.writeFileSync(BUDGET_FILE, `${JSON.stringify(budgets, null, 2)}\n`);
};

const ensureBudget = (budgets, recordId, field, currentLen) => {
  if (!budgets[recordId] || typeof budgets[recordId] !== "object") {
    budgets[recordId] = {};
  }
  if (!Number.isInteger(budgets[recordId][field])) {
    budgets[recordId][field] = currentLen;
    return { maxChars: currentLen, dirty: true };
  }
  return { maxChars: budgets[recordId][field], dirty: false };
};

const findFrozenArray = (source, globalName) => {
  const marker = `window.${globalName} = Object.freeze(`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return null;
  const scanner = createScanner(source);
  scanner.index = markerIndex + marker.length;
  scanner.skipWsAndComments();
  if (source[scanner.index] !== "[") return null;
  const open = scanner.index;
  const value = scanner.readValueEnd();
  return { open, close: value.end - 1 };
};

const parseArrayEntries = (source, open, close) => {
  const scanner = createScanner(source);
  scanner.index = open + 1;
  const entries = [];
  while (true) {
    scanner.skipWsAndComments();
    if (scanner.index >= close) break;
    if (source[scanner.index] === "]") break;
    const value = scanner.readValueEnd();
    let entryEnd = value.end;
    scanner.skipWsAndComments();
    if (source[scanner.index] === ",") {
      scanner.index += 1;
      entryEnd = scanner.index;
    }
    entries.push({
      valueStart: value.start,
      valueEnd: value.end,
      entryEnd,
    });
  }
  return entries;
};

const sliceArticle = (html) => {
  const match = html.match(/<article\b[^>]*class="[^"]*staff-content[\s\S]*?<\/article>/i);
  if (!match) return null;
  return { html: match[0], start: match.index };
};

const readerRange = (articleHtml, articleStart) => {
  const match = articleHtml.match(/<section\b[^>]*class="[^"]*sweet-dream-book__reader[\s\S]*?<\/section>/i);
  if (!match) return null;
  return {
    start: articleStart + match.index,
    end: articleStart + match.index + match[0].length,
  };
};

const pushLine = (ctx, line) => {
  if (line.text == null || line.text === "") return;
  const id = `${line.fileKey}:${line.field}`;
  ctx.lines.push({
    id,
    game: "archive",
    nodeId: ctx.record.id,
    bucket: "archive",
    field: line.field,
    speaker: ctx.record.title,
    kind: line.kind || "dialogue",
    text: line.text,
    start: line.start,
    end: line.end,
    quote: line.quote || null,
    fn: false,
    unique: true,
    fileRel: line.fileRel,
    encode: line.encode,
    originalInner: line.originalInner || null,
    page: line.page || 0,
    pageLabel: line.pageLabel || "",
    layoutLocked: ctx.record.layout === "locked" && Boolean(line.lock),
    label: line.label || line.field,
  });
};

const collectMetaFields = (ctx, html, fileRel, fileKey, { lock = false } = {}) => {
  const addAttr = (re, field, kind, label) => {
    const match = html.match(re);
    if (!match) return;
    const full = match[0];
    const value = decodeEntities(match[1]);
    const valueStart = match.index + full.lastIndexOf(match[1]);
    pushLine(ctx, {
      fileKey,
      fileRel,
      field,
      kind,
      label,
      text: value,
      start: valueStart,
      end: valueStart + match[1].length,
      encode: "attr",
      lock,
    });
  };
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    const innerStart = titleMatch.index + titleMatch[0].indexOf(titleMatch[1]);
    pushLine(ctx, {
      fileKey,
      fileRel,
      field: "seo.title",
      kind: "meta",
      label: "SEO title",
      text: decodeEntities(titleMatch[1]).trim(),
      start: innerStart,
      end: innerStart + titleMatch[1].length,
      encode: "text",
      originalInner: titleMatch[1],
      lock,
    });
  }
  addAttr(
    /<meta\s+name="description"\s+content="([^"]*)"/i,
    "seo.description",
    "meta",
    "SEO description"
  );
  addAttr(
    /<meta\s+property="og:title"\s+content="([^"]*)"/i,
    "seo.ogTitle",
    "meta",
    "OG title"
  );
  addAttr(
    /<meta\s+property="og:description"\s+content="([^"]*)"/i,
    "seo.ogDescription",
    "meta",
    "OG description"
  );
};

const collectHtmlBlocks = (ctx, html, fileRel, fileKey, { lock = false, skipRange = null } = {}) => {
  const article = sliceArticle(html);
  if (!article) return;
  const source = article.html;
  const base = article.start;
  const blockRe = /<(h2|h3|h4|p|li|figcaption|span)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let match;
  let index = 0;
  while ((match = blockRe.exec(source))) {
    const absStart = base + match.index;
    const absEnd = absStart + match[0].length;
    if (skipRange && absStart >= skipRange.start && absEnd <= skipRange.end) continue;
    const className = match[2] || "";
    const tag = match[1].toLowerCase();
    if (/protocol-back-link|sweet-dream-book__back|visually-hidden|swipe-guide|staff-nav-code|staff-tv-ident/.test(className)) continue;
    if (tag === "span" && !/protocol-access|sweet-dream-book__access|protocol-kicker/.test(className)) continue;
    const inner = match[3];
    if (!stripTags(inner).replace(/\s/g, "")) continue;
    const open = match[0].slice(0, match[0].length - inner.length - match[1].length - 3);
    const innerStart = absStart + open.length;
    const text = stripTags(inner);
    const kind =
      tag === "figcaption" ? "caption" : tag === "h2" || tag === "h3" || tag === "h4" ? "heading" : "dialogue";
    pushLine(ctx, {
      fileKey,
      fileRel,
      field: `html.${tag}[${index}]`,
      kind,
      label:
        tag === "figcaption"
          ? "Подпись"
          : tag === "h2"
            ? "Заголовок"
            : tag === "h3" || tag === "h4"
              ? "Рубрика"
              : /protocol-kicker|sweet-dream-book__kicker/.test(className)
                ? "Шильд"
                : /protocol-access|sweet-dream-book__access/.test(className)
                  ? "Допуск"
                  : /subtitle/.test(className)
                    ? "Подзаголовок"
                    : kind === "dialogue"
                      ? "Абзац"
                      : tag,
      text,
      start: innerStart,
      end: innerStart + inner.length,
      encode: "html",
      originalInner: inner,
      lock,
    });
    index += 1;
  }

  const imgRe = /<img\b[^>]*\balt="([^"]*)"/gi;
  let imgIndex = 0;
  while ((match = imgRe.exec(source))) {
    const absStart = base + match.index;
    if (skipRange && absStart >= skipRange.start && absStart < skipRange.end) continue;
    const value = decodeEntities(match[1]);
    if (!value) continue;
    const valueStart = base + match.index + match[0].lastIndexOf(match[1]);
    pushLine(ctx, {
      fileKey,
      fileRel,
      field: `html.alt[${imgIndex}]`,
      kind: "caption",
      label: "Alt изображения",
      text: value,
      start: valueStart,
      end: valueStart + match[1].length,
      encode: "attr",
      lock,
    });
    imgIndex += 1;
  }
};

const collectShelfCard = (ctx, archiveHtml, { lock = false } = {}) => {
  const href = `documents/${ctx.record.id}`;
  const re = new RegExp(
    `<a\\b[^>]*href="${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]*?</a>`,
    "i"
  );
  const match = archiveHtml.match(re);
  if (!match) return;
  const block = match[0];
  const base = match.index;
  const copyMatch = block.match(/<span class="archive-record__copy">([\s\S]*)<\/span>\s*<\/a>\s*$/i);
  if (!copyMatch) return;
  const copy = copyMatch[1];
  const copyBase = base + copyMatch.index + copyMatch[0].indexOf(copy);
  const fields = [
    { re: /<strong>([\s\S]*?)<\/strong>/i, field: "shelf.title", label: "Карточка: название", kind: "heading" },
    { re: /<span>([\s\S]*?)<\/span>/i, field: "shelf.kicker", label: "Карточка: шильд", kind: "meta" },
    { re: /<p>([\s\S]*?)<\/p>/i, field: "shelf.blurb", label: "Карточка: описание", kind: "dialogue" },
  ];
  fields.forEach((item) => {
    const found = copy.match(item.re);
    if (!found) return;
    const text = stripTags(found[1]);
    if (!String(text).replace(/\s/g, "")) return;
    const innerStart = copyBase + found.index + found[0].indexOf(found[1]);
    pushLine(ctx, {
      fileKey: "archive.html",
      fileRel: "archive.html",
      field: item.field,
      kind: item.kind,
      label: item.label,
      text,
      start: innerStart,
      end: innerStart + found[1].length,
      encode: "html",
      originalInner: found[1],
      lock,
    });
  });
};

const leafLabel = (entry, index) => {
  if (entry.kind === "cover") return `Лист ${String(index + 1).padStart(2, "0")} · обложка`;
  if (entry.kind === "preface") return `Лист ${String(index + 1).padStart(2, "0")} · предисловие`;
  const chapter = Number(entry.chapter);
  if (Number.isInteger(chapter)) {
    return `Лист ${String(index + 1).padStart(2, "0")} · глава ${String(chapter).padStart(2, "0")}`;
  }
  return `Лист ${String(index + 1).padStart(2, "0")}`;
};

const collectBookContent = (ctx, source, fileRel) => {
  const range = findFrozenArray(source, ctx.record.globalName);
  if (!range) throw new Error(`Не найден ${ctx.record.globalName} в ${fileRel}`);
  const entries = parseArrayEntries(source, range.open, range.close);
  entries.forEach((entry, entryIndex) => {
    let close = entry.valueEnd - 1;
    while (close > entry.valueStart && source[close] !== "}") close -= 1;
    const props = parseObjectEntries(source, entry.valueStart, close);
    const kindProp = props.find((prop) => prop.key === "kind");
    const chapterProp = props.find((prop) => prop.key === "chapter");
    const kindLit = kindProp ? collectLiterals(source, kindProp.valueStart, kindProp.valueEnd)[0] : null;
    const chapterLit = chapterProp
      ? source.slice(chapterProp.valueStart, chapterProp.valueEnd).trim()
      : "";
    const pageLabel = leafLabel(
      { kind: kindLit ? kindLit.value : undefined, chapter: Number(chapterLit) },
      entryIndex
    );
    const addLit = (prop, field, label, kind) => {
      if (!prop) return;
      const lit = collectLiterals(source, prop.valueStart, prop.valueEnd)[0];
      if (!lit) return;
      pushLine(ctx, {
        fileKey: fileRel,
        fileRel,
        field: `entries[${entryIndex}].${field}`,
        kind,
        label,
        text: lit.value,
        start: lit.start,
        end: lit.end,
        quote: lit.quote,
        encode: "js",
        lock: true,
        page: entryIndex + 1,
        pageLabel,
      });
    };
    addLit(
      props.find((prop) => prop.key === "title"),
      "title",
      "Заголовок листа",
      "heading"
    );
    addLit(props.find((prop) => prop.key === "alt"), "alt", "Alt иллюстрации", "caption");
    addLit(props.find((prop) => prop.key === "warning"), "warning", "Предупреждение", "system");
    const paragraphs = props.find((prop) => prop.key === "paragraphs");
    if (paragraphs && source[paragraphs.valueStart] === "[") {
      const items = parseArrayEntries(source, paragraphs.valueStart, paragraphs.valueEnd - 1);
      items.forEach((item, paragraphIndex) => {
        const lit = collectLiterals(source, item.valueStart, item.valueEnd)[0];
        if (!lit) return;
        pushLine(ctx, {
          fileKey: fileRel,
          fileRel,
          field: `entries[${entryIndex}].paragraphs[${paragraphIndex}]`,
          kind: "dialogue",
          label: `Абзац ${paragraphIndex + 1}`,
          text: lit.value,
          start: lit.start,
          end: lit.end,
          quote: lit.quote,
          encode: "js",
          lock: true,
          page: entryIndex + 1,
          pageLabel,
        });
      });
    }
    const inserts = props.find((prop) => prop.key === "inserts");
    if (inserts && source[inserts.valueStart] === "[") {
      const plates = parseArrayEntries(source, inserts.valueStart, inserts.valueEnd - 1);
      plates.forEach((plate, plateIndex) => {
        let plateClose = plate.valueEnd - 1;
        while (plateClose > plate.valueStart && source[plateClose] !== "}") plateClose -= 1;
        const plateProps = parseObjectEntries(source, plate.valueStart, plateClose);
        const after = plateProps.find((prop) => prop.key === "afterParagraph");
        const afterN = after ? source.slice(after.valueStart, after.valueEnd).trim() : "?";
        addLit(
          plateProps.find((prop) => prop.key === "alt"),
          `inserts[${plateIndex}].alt`,
          `Вклейка после абзаца ${afterN}: alt`,
          "caption"
        );
      });
    }
  });
  return entries.length;
};

const reconstructHtml = (originalInner, nextText) => {
  const trimmed = String(nextText || "");
  const strong = String(originalInner || "").match(/^(\s*)<strong>([\s\S]*?)<\/strong>([\s\S]*)$/i);
  if (strong) {
    const label = stripTags(strong[2]);
    if (label && (trimmed === label || trimmed.startsWith(label))) {
      return `${strong[1]}<strong>${escapeHtml(label)}</strong>${escapeHtml(trimmed.slice(label.length))}`;
    }
  }
  return escapeHtml(trimmed);
};

const applyBudgets = (record, lines, budgets) => {
  let dirty = false;
  lines.forEach((line) => {
    if (!line.layoutLocked) {
      line.maxChars = null;
      line.targetChars = charCount(line.text);
      return;
    }
    const result = ensureBudget(budgets, record.id, line.field, charCount(line.text));
    line.maxChars = result.maxChars;
    line.targetChars = result.maxChars;
    if (result.dirty) dirty = true;
  });
  return dirty;
};

const indexRecord = (record, { htmlCache, budgets }) => {
  const htmlRel = record.file;
  const htmlPath = path.join(projectRoot, htmlRel);
  const html = htmlCache[htmlRel] || fs.readFileSync(htmlPath, "utf8");
  htmlCache[htmlRel] = html;
  const archiveHtml = htmlCache["archive.html"] || fs.readFileSync(ARCHIVE_PAGE, "utf8");
  htmlCache["archive.html"] = archiveHtml;

  const ctx = { record, lines: [] };
  const article = sliceArticle(html);
  const skipRange =
    record.layout === "locked" && article ? readerRange(article.html, article.start) : null;
  collectMetaFields(ctx, html, htmlRel, htmlRel, { lock: record.layout === "locked" });
  collectHtmlBlocks(ctx, html, htmlRel, htmlRel, {
    lock: record.layout === "locked",
    skipRange,
  });
  collectShelfCard(ctx, archiveHtml, { lock: false });

  let sourcePages = 0;
  let contentSource = "";
  if (record.content) {
    const contentPath = path.join(projectRoot, record.content);
    contentSource = fs.readFileSync(contentPath, "utf8");
    sourcePages = collectBookContent(ctx, contentSource, record.content);
  }

  const dirty = applyBudgets(record, ctx.lines, budgets);
  const previewLine = ctx.lines.find((line) => line.kind === "dialogue") || ctx.lines[0];
  return {
    node: {
      id: record.id,
      speaker: record.title,
      preview: previewLine ? previewLine.text.replace(/\s+/g, " ").slice(0, 140) : record.title,
      step: record.title,
      sceneGroup: KIND_GROUP[record.kind],
      kinds: ["dialogue"],
      outbound: [],
      layout: record.layout,
      readerPages: record.readerPages || 0,
      sourcePages,
      href: `/${htmlRel.replace(/\.html$/, "")}`,
    },
    lines: ctx.lines,
    dirty,
    files: {
      [htmlRel]: html,
      "archive.html": archiveHtml,
      ...(record.content ? { [record.content]: contentSource } : {}),
    },
  };
};

const indexArchive = () => {
  const budgets = loadBudgets();
  const htmlCache = {};
  const lines = [];
  const nodes = [];
  const files = {};
  let dirty = false;
  RECORDS.forEach((record) => {
    const indexed = indexRecord(record, { htmlCache, budgets });
    nodes.push(indexed.node);
    lines.push(...indexed.lines);
    Object.assign(files, indexed.files);
    if (indexed.dirty) dirty = true;
  });
  if (dirty) saveBudgets(budgets);
  const counts = {};
  lines.forEach((line) => {
    counts[line.text] = (counts[line.text] || 0) + 1;
  });
  lines.forEach((line) => {
    line.occurrences = counts[line.text];
    line.unique = counts[line.text] === 1;
  });
  return {
    game: {
      id: "archive",
      title: "Архив",
      file: "documents/",
      startNode: RECORDS[0].id,
      lockedSpeakers: [],
      surface: "archive",
    },
    nodes,
    lines,
    messages: [],
    characters: [],
    files,
    records: RECORDS.map((record) => ({
      id: record.id,
      kind: record.kind,
      title: record.title,
      layout: record.layout,
      readerPages: record.readerPages || 0,
    })),
  };
};

const writeBookSource = (fileRel, nextSource) => {
  const filePath = path.join(projectRoot, fileRel);
  const sandbox = { window: {}, console };
  vm.runInNewContext(nextSource, sandbox, { filename: filePath, timeout: 4000 });
  if (!Array.isArray(sandbox.window.DZ_SWEET_DREAM_BOOK)) {
    throw new Error(`Saved source failed to load DZ_SWEET_DREAM_BOOK in ${fileRel}`);
  }
  fs.writeFileSync(filePath, nextSource, "utf8");
};

const encodeReplacement = (line, nextText) => {
  if (line.encode === "js") return encodeJsString(nextText, line.quote || '"');
  if (line.encode === "attr") return escapeHtml(nextText);
  if (line.encode === "html") return reconstructHtml(line.originalInner, nextText);
  return escapeHtml(nextText);
};

const patchLine = (lineId, expected, nextText) => {
  const index = indexArchive();
  const line = index.lines.find((item) => item.id === lineId);
  if (!line) throw new Error(`Unknown line: ${lineId}`);
  if (line.text !== expected) {
    throw new Error("Текст уже изменился. Обновите список и повторите.");
  }
  const next = String(nextText ?? "");
  if (line.layoutLocked && Number.isInteger(line.maxChars) && charCount(next) > line.maxChars) {
    throw new Error(`Лимит знаков для вёрстки: ${line.maxChars}. Сейчас ${charCount(next)}.`);
  }
  const encoded = encodeReplacement(line, next);
  const fileRel = line.fileRel;
  const source = index.files[fileRel];
  const currentRaw = source.slice(line.start, line.end);
  if (line.encode === "js") {
    const decoded = decodeJsString(currentRaw);
    if (decoded !== line.text) {
      throw new Error("Исходная строка в файле не совпала. Обновите список.");
    }
  }
  const nextSource = source.slice(0, line.start) + encoded + source.slice(line.end);
  const fullPath = path.join(projectRoot, fileRel);
  if (fileRel.endsWith(".js")) writeBookSource(fileRel, nextSource);
  else fs.writeFileSync(fullPath, nextSource, "utf8");
  return indexArchive();
};

const publicIndex = (index = indexArchive()) => ({
  game: index.game,
  nodes: index.nodes,
  characters: index.characters,
  messages: index.messages,
  records: index.records,
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
    maxChars: line.maxChars,
    targetChars: line.targetChars,
    page: line.page,
    pageLabel: line.pageLabel,
    layoutLocked: line.layoutLocked,
    label: line.label,
  })),
});

module.exports = {
  RECORDS,
  indexArchive,
  patchLine,
  publicIndex,
};
