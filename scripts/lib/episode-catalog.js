"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..", "..");
const CATALOG_FILE = path.join(projectRoot, "content", "archive", "episode-catalog.js");
const ARCHIVE_PAGE = path.join(projectRoot, "archive.html");
const EPISODES_PAGE = path.join(projectRoot, "episodes.html");

const PLATFORMS = ["boosty", "instagram", "facebook", "youtube", "tiktok"];

const THEMES = [
  { id: "archive", label: "Архив", tag: "АРХИВ" },
  { id: "mask", label: "Аниматоры", tag: "АНИМАТОРЫ" },
  { id: "dream", label: "Сон", tag: "СОН" },
  { id: "park", label: "Парк", tag: "ПАРК" },
  { id: "commerce", label: "Торговый зал", tag: "ТОРГОВЫЙ ЗАЛ" },
  { id: "pool", label: "Бассейн", tag: "БАССЕЙН" },
  { id: "robot", label: "Tyndex", tag: "TYNDEX" },
  { id: "redroom", label: "Красная комната", tag: "КРАСНАЯ КОМНАТА" },
  { id: "broadcast", label: "Эфир", tag: "ЭФИР" },
  { id: "institution", label: "Учреждение", tag: "УЧРЕЖДЕНИЕ" },
  { id: "transit", label: "Маршрут", tag: "МАРШРУТ" },
];

const ID_RE = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;

const countWord = (count, one, few, many) => {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
};

const archiveCountPhrase = (count) =>
  `${count} ${countWord(count, "выпуск", "выпуска", "выпусков")}`;

const episodesCounterPhrase = (count) =>
  `${count} ${countWord(count, "ВЫПУСК", "ВЫПУСКА", "ВЫПУСКОВ")}`;

const isSafeUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch (_error) {
    return false;
  }
};

const loadCatalog = () => {
  const source = fs.readFileSync(CATALOG_FILE, "utf8");
  const sandbox = { window: {}, console };
  vm.runInNewContext(source, sandbox, { filename: CATALOG_FILE, timeout: 4000 });
  const frozen = sandbox.window.DZ_EPISODE_CATALOG;
  if (!Array.isArray(frozen)) {
    throw new Error("DZ_EPISODE_CATALOG missing");
  }
  return JSON.parse(JSON.stringify(frozen));
};

const normalizeSources = (raw) => {
  const sources = {};
  PLATFORMS.forEach((platform) => {
    const value = String(raw?.[platform] || "").trim();
    if (!value) return;
    if (!isSafeUrl(value)) {
      throw new Error(`Ссылка ${platform} должна начинаться с http:// или https://`);
    }
    sources[platform] = value;
  });
  return sources;
};

const normalizeEpisode = (payload, { requireId = true } = {}) => {
  const id = String(payload.id || "").trim();
  if (requireId && !id) throw new Error("Нужен id выпуска");
  if (id && !ID_RE.test(id)) {
    throw new Error("id: латиница, цифры и дефис, например EP-057 или Special-3");
  }

  const title = String(payload.title || "").trim();
  const description = String(payload.description || "").trim();
  if (!title) throw new Error("Нужен заголовок");
  if (!description) throw new Error("Нужно описание");

  const theme = String(payload.theme || "").trim() || "archive";
  if (!THEMES.some((item) => item.id === theme)) {
    throw new Error(`Неизвестная тема: ${theme}`);
  }

  const tag =
    String(payload.tag || "").trim() ||
    THEMES.find((item) => item.id === theme)?.tag ||
    "АРХИВ";

  const sortRaw = payload.sortOrder;
  const sortOrder = sortRaw === "" || sortRaw == null ? null : Number(sortRaw);
  if (sortOrder == null || !Number.isFinite(sortOrder)) {
    throw new Error("Нужен числовой порядок в списке");
  }

  return {
    id,
    sortOrder,
    title,
    description,
    theme,
    tag,
    sources: normalizeSources(payload.sources || {}),
  };
};

const serializeCatalog = (episodes) =>
  `window.DZ_EPISODE_CATALOG = Object.freeze(\n${JSON.stringify(episodes, null, 2)}\n);\n`;

const writeCatalogFile = (episodes) => {
  const source = serializeCatalog(episodes);
  const sandbox = { window: {}, console };
  vm.runInNewContext(source, sandbox, { filename: CATALOG_FILE, timeout: 4000 });
  if (!Array.isArray(sandbox.window.DZ_EPISODE_CATALOG)) {
    throw new Error("Saved catalog failed to load");
  }
  fs.writeFileSync(CATALOG_FILE, source, "utf8");
};

const replaceCount = (filePath, pattern, nextText) => {
  if (!fs.existsSync(filePath)) return false;
  const original = fs.readFileSync(filePath, "utf8");
  const next = original.replace(pattern, nextText);
  if (next === original) return false;
  fs.writeFileSync(filePath, next, "utf8");
  return true;
};

const syncPublicCounts = (count) => {
  const archivePhrase = archiveCountPhrase(count);
  const episodesPhrase = episodesCounterPhrase(count);
  replaceCount(
    ARCHIVE_PAGE,
    /\d+\s+выпуск(?:а|ов)?(?=\s+с поиском)/,
    archivePhrase
  );
  replaceCount(
    EPISODES_PAGE,
    /\d+\s+ВЫПУСК(?:А|ОВ)?/,
    episodesPhrase
  );
};

const writeCatalog = (episodes) => {
  writeCatalogFile(episodes);
  syncPublicCounts(episodes.length);
  return episodes;
};

const nextRegularSlot = (episodes) => {
  let maxNum = -1;
  let maxSort = -1;
  episodes.forEach((episode) => {
    const match = String(episode.id).match(/^EP-(\d+)$/i);
    if (match) maxNum = Math.max(maxNum, Number(match[1]));
    if (Number.isFinite(Number(episode.sortOrder))) {
      maxSort = Math.max(maxSort, Number(episode.sortOrder));
    }
  });
  const nextNum = maxNum + 1;
  const padded = String(nextNum).padStart(3, "0");
  return {
    id: `EP-${padded}`,
    sortOrder: Math.max(Math.floor(maxSort) + 1, nextNum),
    title: `Детский Жир №${padded} — `,
  };
};

const publicMeta = (episodes) => ({
  count: episodes.length,
  archivePhrase: archiveCountPhrase(episodes.length),
  next: nextRegularSlot(episodes),
  platforms: PLATFORMS,
  themes: THEMES,
  tags: [...new Set(episodes.map((episode) => episode.tag).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "ru")
  ),
});

const listEpisodes = () => {
  const episodes = loadCatalog();
  return { episodes, ...publicMeta(episodes) };
};

const saveEpisode = (payload, { previousId } = {}) => {
  const episodes = loadCatalog();
  const episode = normalizeEpisode(payload);
  const fromId = String(previousId || payload.previousId || episode.id).trim();
  const existingIndex = episodes.findIndex((item) => item.id === fromId);
  const idTaken = episodes.findIndex((item) => item.id === episode.id);

  if (existingIndex === -1) {
    if (idTaken !== -1) throw new Error(`Выпуск «${episode.id}» уже есть`);
    episodes.push(episode);
  } else {
    if (idTaken !== -1 && idTaken !== existingIndex) {
      throw new Error(`Выпуск «${episode.id}» уже есть`);
    }
    episodes[existingIndex] = episode;
  }

  writeCatalog(episodes);
  return { episode, ...listEpisodes() };
};

const createEpisode = (payload = {}) => {
  const episodes = loadCatalog();
  const slot = nextRegularSlot(episodes);
  const draft = {
    ...slot,
    title: String(payload.title || slot.title).trim() || slot.title,
    description: String(payload.description || "").trim() || "Описание выпуска.",
    theme: payload.theme || "broadcast",
    tag: payload.tag || "",
    sources: payload.sources || {},
    sortOrder: payload.sortOrder == null ? slot.sortOrder : payload.sortOrder,
    id: String(payload.id || slot.id).trim() || slot.id,
  };
  return saveEpisode(draft);
};

const deleteEpisode = (episodeId) => {
  const id = String(episodeId || "").trim();
  if (!id) throw new Error("Нужен id выпуска");
  const episodes = loadCatalog();
  const index = episodes.findIndex((item) => item.id === id);
  if (index === -1) throw new Error(`Выпуск «${id}» не найден`);
  episodes.splice(index, 1);
  writeCatalog(episodes);
  return listEpisodes();
};

module.exports = {
  PLATFORMS,
  THEMES,
  CATALOG_FILE,
  archiveCountPhrase,
  episodesCounterPhrase,
  loadCatalog,
  serializeCatalog,
  listEpisodes,
  saveEpisode,
  createEpisode,
  deleteEpisode,
  nextRegularSlot,
  projectRoot,
};
