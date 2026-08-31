"use strict";

const NODES_MARKER = "<!-- NODES -->";
const DRAFT_NEW = "DRAFT-NEW";
const DRAFT_CUT = "DRAFT-CUT";

const MECHANIC_CHOICE_KEYS = [
  "set",
  "hideIf",
  "require",
  "requireAny",
  "effect",
  "sound",
  "artifact",
  "image",
  "_stage1Keep",
];

const formatList = (value) => {
  if (!Array.isArray(value) || value.length === 0) return "";
  return value.join(", ");
};

const formatMechValue = (value) => {
  if (Array.isArray(value)) return formatList(value);
  if (value === true) return "true";
  if (value == null) return "";
  return String(value);
};

const renderChoiceMech = (choice) => {
  const lines = [];
  MECHANIC_CHOICE_KEYS.forEach((key) => {
    if (choice[key] == null || choice[key] === false) return;
    if (Array.isArray(choice[key]) && choice[key].length === 0) return;
    lines.push(`   - ${key}: ${formatMechValue(choice[key])}`);
  });
  return lines;
};

const renderNode = (id, node) => {
  const flags = [];
  if (node._draftStatus === DRAFT_NEW) flags.push(`<!-- ${DRAFT_NEW} -->`);
  if (node._draftStatus === DRAFT_CUT) flags.push(`<!-- ${DRAFT_CUT} -->`);
  const title = [`## \`${id}\``, ...flags].join(" ");

  const meta = [`- speaker: ${node.speaker || ""}`];
  if (node.room) meta.push(`- room: ${node.room}`);
  if (node.visual) meta.push(`- visual: ${node.visual}`);
  if (node.sound) meta.push(`- sound: ${node.sound}`);
  if (node.imageAlt) meta.push(`- imageAlt: ${node.imageAlt}`);
  if (node.complete) meta.push("- complete: true");
  if (node.guestExit) meta.push("- guestExit: true");
  if (node.delay != null) meta.push(`- delay: ${node.delay}`);
  if (node.effect) meta.push(`- effect: ${node.effect}`);
  if (node.artifact) meta.push(`- artifact: ${node.artifact}`);

  const lines = [title, "", ...meta, "", "**Текст**", "", node.text || "", ""];

  if (node.refusalText) {
    lines.push("**Отказ**", "", node.refusalText, "");
  }

  lines.push("**Кнопки**", "");
  const choices = Array.isArray(node.choices) ? node.choices : [];
  if (choices.length === 0) {
    lines.push("(нет)", "");
  } else {
    choices.forEach((choice, index) => {
      const next = choice.next ? ` → \`${choice.next}\`` : "";
      lines.push(`${index + 1}. ${choice.label || ""}${next}`);
      if (choice.imageAlt) lines.push(`   - imageAlt: ${choice.imageAlt}`);
      lines.push(...renderChoiceMech(choice));
    });
    lines.push("");
  }

  return lines.join("\n");
};

const renderDocument = ({ generatedAt, startNode, nodeCount, nodes }) => {
  const header = [
    "# Черновик сценария: кабинка обозрения Павла",
    "",
    "Это **черновик для сюжетного чата**, не источник правды игры.",
    "Рабочая версия: `content/pavel/observation-booth-content.js`.",
    "Copy Desk id: `pavel`.",
    "",
    `Сгенерировано: ${generatedAt}. Узлов: **${nodeCount}**. Старт: \`${startNode}\`.`,
    "",
    "## Как пользоваться",
    "",
    "- Править можно `speaker`, **Текст**, **Отказ**, подписи кнопок и `imageAlt`.",
    "- Строки `room` / `visual` / `sound` / `next` / `set` / `require` — механика.",
    "  В сюжетном чате их не менять, пока нет явной синхронизации графа.",
    "- Новый блок: скопировать узел, сменить id, добавить `<!-- DRAFT-NEW -->`.",
    "- Вырезать живой узел: `<!-- DRAFT-CUT -->` на заголовке. Удаление из JS",
    "  только по отдельной просьбе «синхронизировать граф».",
    "- Повторный экспорт из JS **перезапишет** литературные правки в этом файле.",
    "  Сначала импорт (`--apply`) или копия файла.",
    "",
    "```sh",
    "node scripts/export-pavel-booth-script.js",
    "node scripts/import-pavel-booth-script.js",
    "node scripts/import-pavel-booth-script.js --apply",
    "```",
    "",
    "Литературный импорт не создаёт и не удаляет узлы и не меняет `next`.",
    "",
    NODES_MARKER,
    "",
  ];

  const body = Object.entries(nodes).map(([id, node]) => renderNode(id, node));
  return `${header.join("\n")}${body.join("\n---\n\n")}\n`;
};

const parseStatus = (headingLine) => {
  if (headingLine.includes(`<!-- ${DRAFT_NEW} -->`)) return DRAFT_NEW;
  if (headingLine.includes(`<!-- ${DRAFT_CUT} -->`)) return DRAFT_CUT;
  return "";
};

const parseId = (headingLine) => {
  const match = headingLine.match(/^##\s+`([^`]+)`/);
  if (!match) return "";
  return match[1].trim();
};

const splitSections = (block) => {
  const lines = block.replace(/\r\n/g, "\n").split("\n");
  const heading = lines[0] || "";
  const rest = lines.slice(1);
  const sections = { meta: [], text: "", refusalText: "", buttons: [] };
  let mode = "meta";
  let buffer = [];

  const flushText = (target) => {
    const value = buffer.join("\n").replace(/^\n+|\n+$/g, "");
    if (target === "text") sections.text = value;
    if (target === "refusal") sections.refusalText = value;
    buffer = [];
  };

  rest.forEach((line) => {
    if (line === "**Текст**") {
      mode = "text";
      buffer = [];
      return;
    }
    if (line === "**Отказ**") {
      if (mode === "text") flushText("text");
      mode = "refusal";
      buffer = [];
      return;
    }
    if (line === "**Кнопки**") {
      if (mode === "text") flushText("text");
      if (mode === "refusal") flushText("refusal");
      mode = "buttons";
      return;
    }
    if (mode === "meta") {
      if (line.startsWith("- ")) sections.meta.push(line);
      return;
    }
    if (mode === "text" || mode === "refusal") {
      buffer.push(line);
      return;
    }
    if (mode === "buttons") sections.buttons.push(line);
  });

  if (mode === "text") flushText("text");
  if (mode === "refusal") flushText("refusal");

  return { heading, ...sections };
};

const parseMeta = (metaLines) => {
  const out = {};
  metaLines.forEach((line) => {
    const match = line.match(/^- ([^:]+):\s*(.*)$/);
    if (!match) return;
    out[match[1].trim()] = match[2];
  });
  return out;
};

const parseChoices = (buttonLines) => {
  const choices = [];
  buttonLines.forEach((line) => {
    if (!line.trim() || line.trim() === "(нет)") return;
    const numbered = line.match(/^\s*(\d+)\.\s+(.+)$/);
    if (numbered) {
      const rest = numbered[2];
      const arrow = rest.match(/^(.*)\s+→\s+`([^`]+)`\s*$/);
      if (arrow) {
        choices.push({ label: arrow[1].trim(), next: arrow[2].trim(), mech: {} });
      } else {
        choices.push({ label: rest.trim(), next: "", mech: {} });
      }
      return;
    }
    const mech = line.match(/^\s+-\s+([^:]+):\s*(.*)$/);
    if (mech && choices.length) {
      const key = mech[1].trim();
      const raw = mech[2].trim();
      if (key === "imageAlt") {
        choices[choices.length - 1].imageAlt = raw;
      } else if (raw.includes(", ")) {
        choices[choices.length - 1].mech[key] = raw.split(", ").map((item) => item.trim());
      } else if (raw === "true") {
        choices[choices.length - 1].mech[key] = true;
      } else {
        choices[choices.length - 1].mech[key] = raw;
      }
    }
  });
  return choices;
};

const parseDocument = (markdown) => {
  const source = String(markdown).replace(/\r\n/g, "\n");
  const markerIndex = source.indexOf(NODES_MARKER);
  const body = markerIndex === -1 ? source : source.slice(markerIndex + NODES_MARKER.length);
  const starts = [];
  const headingRe = /^## `/gm;
  let match = headingRe.exec(body);
  while (match) {
    starts.push(match.index);
    match = headingRe.exec(body);
  }

  const nodes = [];
  starts.forEach((start, index) => {
    const end = index + 1 < starts.length ? starts[index + 1] : body.length;
    const block = body.slice(start, end).trim();
    const { heading, meta, text, refusalText, buttons } = splitSections(block);
    const id = parseId(heading);
    if (!id) return;
    const metaMap = parseMeta(meta);
    nodes.push({
      id,
      status: parseStatus(heading),
      speaker: metaMap.speaker || "",
      text,
      refusalText,
      imageAlt: metaMap.imageAlt || "",
      room: metaMap.room || "",
      visual: metaMap.visual || "",
      sound: metaMap.sound || "",
      complete: metaMap.complete === "true",
      guestExit: metaMap.guestExit === "true",
      delay: metaMap.delay != null && metaMap.delay !== "" ? Number(metaMap.delay) : null,
      effect: metaMap.effect || "",
      artifact: metaMap.artifact || "",
      choices: parseChoices(buttons),
    });
  });

  return { nodes };
};

module.exports = {
  NODES_MARKER,
  DRAFT_NEW,
  DRAFT_CUT,
  renderDocument,
  parseDocument,
};
