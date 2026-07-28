#!/usr/bin/env node

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const contentPath = path.join(projectRoot, "content", "irina", "call-content.js");
const appPath = path.join(projectRoot, "js", "app.js");
const outputPath = path.join(projectRoot, "docs", "IRINA_DIALOGUES.md");

const contentSource = fs.readFileSync(contentPath, "utf8");
const sandbox = { window: {}, console };
vm.runInNewContext(contentSource, sandbox, {
  filename: contentPath,
  timeout: 3000,
});

const content = sandbox.window.TyndexIrinaCallContent;
if (!content?.nodes) {
  throw new Error("Не удалось загрузить TyndexIrinaCallContent из content/irina/call-content.js");
}

const curatorNodes = content.nodes;

// Classification helpers still live in app.js (runtime logic, not dialogue text).
const appSource = fs.readFileSync(appPath, "utf8");
const extractDeclaration = (name, nextName) => {
  const startMarker = `  const ${name} = `;
  const endMarker = `\n  const ${nextName} = `;
  const start = appSource.indexOf(startMarker);
  const end = appSource.indexOf(endMarker, start);

  if (start === -1 || end === -1) {
    throw new Error(`Не удалось извлечь ${name} из js/app.js.`);
  }

  return appSource.slice(start, end).trim();
};

const assignmentSource = extractDeclaration(
  "getCuratorAssignment",
  "getAssignmentCallbacks"
);
const callbacksSource = extractDeclaration(
  "getAssignmentCallbacks",
  "curatorNodes"
);

const deindent = (value) => {
  const lines = String(value).replace(/\r\n/g, "\n").split("\n");
  const nonEmpty = lines.slice(1).filter((line) => line.trim());
  const indent = nonEmpty.length
    ? Math.min(...nonEmpty.map((line) => line.match(/^\s*/)[0].length))
    : 0;

  return [
    lines[0].trim(),
    ...lines.slice(1).map((line) => line.slice(Math.min(indent, line.length))),
  ]
    .join("\n")
    .trim();
};

const codeBlock = (value) => `\`\`\`js\n${deindent(value)}\n\`\`\``;

const quote = (value) => {
  const text = String(value).trim();
  return text ? `> ${text.replace(/\n/g, "\n> ")}` : "> *(пустая реплика)*";
};

const inlineCode = (value) =>
  `\`${String(value).replace(/`/g, "\\`")}\``;

const renderEffects = (choice) => {
  const details = [];

  if (choice.next) details.push(`Переход: ${inlineCode(choice.next)}`);
  if (choice.reject) details.push(`Отказ/выход: ${inlineCode(choice.reject)}`);
  if (choice.complete) details.push("Завершает эпизод");
  if (choice.downloadFile) {
    details.push(`Открывает файл: ${inlineCode(choice.downloadFile)}`);
  }
  if (choice.image) details.push(`Изображение выбора: ${inlineCode(choice.image)}`);
  if (choice.effect) {
    details.push(
      `Последствия: ${inlineCode(JSON.stringify(choice.effect))}`
    );
  }

  return details;
};

const renderChoices = (choices) => {
  if (typeof choices === "function") {
    return [
      "**Ответы игрока зависят от состояния. Полная логика:**",
      "",
      codeBlock(choices),
    ];
  }

  if (!Array.isArray(choices) || choices.length === 0) {
    return ["**Ответы игрока:** отсутствуют."];
  }

  const lines = ["**Ответы игрока:**", ""];
  choices.forEach((choice, index) => {
    lines.push(`${index + 1}. **${choice.label || "(без подписи)"}**`);
    renderEffects(choice).forEach((detail) => {
      lines.push(`   - ${detail}`);
    });
  });
  return lines;
};

const renderInput = (input) => {
  if (!input) return null;
  return [
    "**Ввод игрока:**",
    "",
    `- Тип: ${inlineCode(input.kind || "—")}`,
    `- Подпись: **${input.label || "—"}**`,
    `- Кнопка: **${input.submitLabel || "—"}**`,
    `- Переход: ${inlineCode(input.next || "—")}`,
  ];
};

const renderNode = ([id, node], index) => {
  const lines = [
    `## ${String(index + 1).padStart(2, "0")}. ${id}`,
    "",
    `- Этап: ${node.step || "—"}`,
    `- Говорящий: ${node.speaker || "—"}`,
  ];

  if (node.media) lines.push(`- Видео/состояние: ${inlineCode(node.media)}`);
  if (node.still) lines.push(`- Статичный материал: ${inlineCode(node.still)}`);
  if (node.feedMode) lines.push(`- Режим канала: ${inlineCode(node.feedMode)}`);
  if (node.autoNext) {
    lines.push(`- Автопереход: ${inlineCode(node.autoNext)}`);
  }

  if (node.interruptedText) {
    lines.push("", "**Первая, прерываемая версия реплики:**", "");
    lines.push(
      typeof node.interruptedText === "function"
        ? codeBlock(node.interruptedText)
        : quote(node.interruptedText)
    );
  }

  lines.push("", "**Реплика:**", "");
  lines.push(
    typeof node.text === "function"
      ? [
          "*Реплика зависит от предыдущих выборов. Полная логика:*",
          "",
          codeBlock(node.text),
        ].join("\n")
      : quote(node.text ?? "")
  );
  const inputLines = renderInput(node.input);
  lines.push("", ...(inputLines || renderChoices(node.choices)), "");

  return lines.join("\n");
};

const nodeEntries = Object.entries(curatorNodes);
const choiceCount = (contentSource.match(/\blabel\s*:/g) || []).length;
const generatedAt = new Date().toISOString();
const output = [
  "# Диалоги игры Ирины",
  "",
  "Автоматический экспорт из `content/irina/call-content.js` (`nodes`).",
  `Сгенерировано: ${generatedAt}.`,
  "",
  `Узлов: **${nodeEntries.length}**. Вариантов ответа: **${choiceCount}**.`,
  "",
  "> Это производный файл для чтения, литературной сверки и загрузки в чат",
  "> с библией лора. Не редактируйте его как источник игры: изменения нужно",
  "> переносить в `content/irina/call-content.js`, после чего повторно",
  "> запускать экспорт.",
  "",
  "Условные реплики и ответы сохранены как короткие фрагменты JavaScript,",
  "чтобы не потерять связь текста с предыдущими выборами игрока.",
  "",
  "---",
  "",
  ...nodeEntries.map(renderNode),
  "---",
  "",
  "# Приложение: итоговая классификация",
  "",
  "Финальные реплики узлов `assignment`, `assignment-role`,",
  "`assignment-keepsake` и `reward-offer` используют эти две функции",
  "(логика остаётся в `js/app.js`):",
  "",
  "## getCuratorAssignment",
  "",
  codeBlock(assignmentSource),
  "",
  "## getAssignmentCallbacks",
  "",
  codeBlock(callbacksSource),
  "",
].join("\n");

fs.writeFileSync(outputPath, output, "utf8");
console.log(
  `Exported ${nodeEntries.length} nodes / ~${choiceCount} choices → ${path.relative(projectRoot, outputPath)}`
);
