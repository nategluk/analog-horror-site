(() => {
  "use strict";

  const ui = window.TyndexGameUi;
  const content = window.TyndexGameUiFixtureContent;
  const root = document.querySelector("[data-game-ui]");
  if (!ui || !content || !root || root.dataset.ready === "true") return;
  root.dataset.ready = "true";

  const SAVE_KEY = "tyndex_game_ui_fixture_v1";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saveApi = ui.createSaveAdapter({
    key: SAVE_KEY,
    version: 1,
    normalize: (raw) => (raw && content.nodes[raw.nodeId] ? raw : null),
  });
  const audio = ui.createAudioRack({
    beds: { empty: { id: "shared.bed.empty-room", loop: true, volume: 0.18 } },
    cues: {
      paper: { id: "shared.paper.unfold", volume: 0.55, category: "paper" },
      knock: { id: "shared.door.three-knocks", volume: 0.6, category: "door" },
    },
  });

  const createSave = () => ({
    version: 1,
    status: "in_progress",
    nodeId: content.startNode,
    flags: {},
  });

  let save = saveApi.read() || createSave();
  saveApi.write(save);

  const shell = ui.bindShell(root, {
    choices: { onPick: (choice) => pick(choice) },
    media: {
      onTransitionEnd: ({ clip, skipped }) => {
        if (clip?.playedFlag) save.flags[clip.playedFlag] = true;
        if (skipped) save.flags.enterPlayed = true;
        saveApi.write(save);
        render({ reveal: !skipped && !reduceMotion.matches });
      },
      onError: () => {
        const live = root.querySelector("[data-game-ui-live]");
        if (live) live.textContent = "Кадр недоступен. Текст остаётся.";
      },
    },
  });

  const waitingClip = (node) =>
    Boolean(node.choicesAfterClip) &&
    node.mediaRole === "transition" &&
    !save.flags[content.visuals[node.visual]?.transition?.playedFlag] &&
    !reduceMotion.matches;

  const render = ({ reveal = false } = {}) => {
    const node = content.nodes[save.nodeId];
    if (!node) return;
    if (node.complete) save.status = "completed";
    saveApi.write(save);
    const room = root.querySelector("[data-game-ui-room]");
    if (room) room.textContent = node.visual === "ENTER" ? "КАНАЛ: ВНУТРИ" : "КАНАЛ: СТЕНД";
    shell.line.render({
      kind: node.kind,
      speaker: node.speaker,
      line: node.line,
      action: node.action || "",
    });
    const holdChoices = waitingClip(node);
    shell.choices.resetGroup();
    shell.choices.render(holdChoices ? [] : node.choices, { reveal });
    shell.media.apply(content.visuals[node.visual], {
      flags: save.flags,
      role: node.mediaRole || "neutral",
      reduceMotion: reduceMotion.matches,
    });
    if (!holdChoices) shell.focusFirst();
    if (audio.unlocked) {
      audio.setBed(node.bed || "empty");
      if (node.cue) audio.playCue(node.cue);
    }
  };

  const pick = (choice) => {
    if (choice.restart) {
      saveApi.reset();
      save = createSave();
      saveApi.write(save);
      render();
      return;
    }
    if (choice.href) {
      window.location.assign(choice.href);
      return;
    }
    if (!choice.next || !content.nodes[choice.next]) return;
    save.nodeId = choice.next;
    saveApi.write(save);
    render();
  };

  root.querySelector("[data-game-ui-sound]")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const on = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(on));
    button.setAttribute("aria-label", on ? "Выключить звук стенда" : "Включить звук стенда");
    if (on) {
      audio.unlock();
      const node = content.nodes[save.nodeId];
      audio.setBed(node?.bed || "empty");
    } else {
      audio.stop();
    }
  });

  render();
})();
