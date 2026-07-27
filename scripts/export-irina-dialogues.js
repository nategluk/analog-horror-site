#!/usr/bin/env node

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(projectRoot, "js", "app.js");
const outputPath = path.join(projectRoot, "docs", "IRINA_DIALOGUES.md");

const source = fs.readFileSync(sourcePath, "utf8");
const objectMarker = "  const curatorNodes = ";
const objectEndMarker = "\n  const applyCuratorEffect = ";
const objectStart = source.indexOf(objectMarker);
const objectEnd = source.indexOf(objectEndMarker, objectStart);

if (objectStart === -1 || objectEnd === -1) {
  throw new Error("Не удалось найти объект curatorNodes в js/app.js.");
}

const objectSource = source
  .slice(objectStart + objectMarker.length, objectEnd)
  .trim()
  .replace(/;$/, "");
const curatorNodes = vm.runInNewContext(`(${objectSource})`, Object.create(null), {
  filename: sourcePath,
  timeout: 1000,
});

const extractDeclaration = (name, nextName) => {
  const startMarker = `  const ${name} = `;
  const endMarker = `\n  const ${nextName} = `;
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);

  if (start === -1 || end === -1) {
    throw new Error(`Не удалось извлечь ${name} из js/app.js.`);
  }

  return source.slice(start, end).trim();
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
const choiceCount = (objectSource.match(/\blabel\s*:/g) || []).length;
const generatedAt = new Date().toISOString();
const output = [
  "# Диалоги игры Ирины",
  "",
  `Автоматический экспорт из \`js/app.js\`, объект \`curatorNodes\`.`,
  `Сгенерировано: ${generatedAt}.`,
  "",
  `Узлов: **${nodeEntries.length}**. Вариантов ответа: **${choiceCount}**.`,
  "",
  "> Это производный файл для чтения, литературной сверки и загрузки в чат",
  "> с библией лора. Не редактируйте его как источник игры: изменения нужно",
  "> переносить в `js/app.js`, после чего повторно запускать экспорт.",
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
  "`assignment-keepsake` и `reward-offer` используют эти две функции.",
  "Они приложены, чтобы экспорт содержал все возможные фразы итогового",
  "назначения и правила их выбора.",
  "",
  codeBlock(assignmentSource),
  "",
  codeBlock(callbacksSource),
  "",
].join("\n");

fs.writeFileSync(outputPath, output, "utf8");
console.log(
  `Готово: ${path.relative(projectRoot, outputPath)} (${nodeEntries.length} узлов, ${choiceCount} ответов).`
);
