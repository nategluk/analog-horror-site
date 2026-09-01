(() => {
  "use strict";

  const SAVE_KEY = "tyndex_irina_solnyshko_v1";
  const PROFILE_KEY = "tyndex_staff_profile_v1";
  const INSIDE_MEDIA = [
    "park-wide",
    "carousel-empty",
    "irina-cotton-a",
    "irina-cotton-b",
    "irina-cotton-c",
    "irina-cotton-d",
    "gate-open",
  ];
  const ui = window.TyndexGameUi;
  const content = window.TyndexIrinaSolnyshkoContent;
  const root = document.querySelector("[data-solnyshko-hours]");
  if (!ui || !content || !root || root.dataset.hoursReady === "true") return;
  root.dataset.hoursReady = "true";

  const channel = root.querySelector("[data-solnyshko-channel]");
  const fallback = root.querySelector("[data-solnyshko-fallback]");
  const form = root.querySelector("[data-solnyshko-input]");
  const dateInput = root.querySelector("[data-solnyshko-date]");
  const inputLabel = root.querySelector("[data-solnyshko-input-label]");
  const inputSubmit = root.querySelector("[data-solnyshko-input-submit]");
  const soundButton = root.querySelector("[data-solnyshko-sound]");
  const liveEl = root.querySelector("[data-game-ui-live]");
  const artifactDialog = document.querySelector("[data-solnyshko-artifact-dialog]");
  const unlockDialog = document.querySelector("[data-solnyshko-unlock-dialog]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let soundOn = false;
  let artifactNext = null;
  let lastRenderedNode = "";
  let pendingEnterReveal = false;
  let textPhase = "line";
  let wasHolding = false;
  let lastMediaKey = "";
  let lastCueKey = "";
  let mediaFailed = false;
  const panel = root.querySelector("[data-game-ui-panel]");

  const readJson = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  };

  const saveApi = ui.createSaveAdapter({
    key: SAVE_KEY,
    version: 1,
    normalize: (raw) => (raw && content.nodes[raw.nodeId] ? raw : null),
  });

  const readProfile = () => window.TyndexDossierStore?.readDossier?.() || readJson(PROFILE_KEY);

  const authorizedProfile = () => {
    const profile = readProfile();
    if (
      profile?.version !== 1 ||
      profile?.curatorId !== "0091-A" ||
      profile?.status !== "completed" ||
      !["animator", "volunteer", "impostor"].includes(profile?.role)
    ) {
      return null;
    }
    return profile;
  };

  const hasArtifact = (profile, artifactId) => {
    if (!profile || !artifactId) return false;
    if ((profile.removedArtifactIds || []).includes(artifactId)) return false;
    return (profile.artifacts || []).some((artifact) => artifact?.id === artifactId);
  };

  const pad2 = (value) => String(value).padStart(2, "0");

  const dateParts = (value) => {
    const chunks = String(value || "").match(/\d+/g) || [];
    if (chunks.length < 2) return null;
    const day = Number(chunks[0]);
    const month = Number(chunks[1]);
    if (!day || !month || day > 31 || month > 12) return null;
    const year = chunks[2] ? Number(chunks[2]) : null;
    return { day: pad2(day), month: pad2(month), year };
  };

  const dateKeys = (stamps) => {
    const keys = new Set();
    (stamps || []).forEach((stamp) => {
      const parts = dateParts(stamp);
      if (!parts) {
        const raw = String(stamp).replace(/\D/g, "");
        if (raw) keys.add(raw);
        return;
      }
      keys.add(parts.day + parts.month);
      if (parts.year == null) return;
      const yy = pad2(parts.year % 100);
      keys.add(parts.day + parts.month + yy);
      keys.add(parts.day + parts.month + "19" + yy);
      keys.add(parts.day + parts.month + "20" + yy);
    });
    return keys;
  };

  const dateAccepted = (value) => {
    const allowed = dateKeys(content.acceptedDates);
    const digits = String(value || "").replace(/\D/g, "");
    if (digits && allowed.has(digits)) return true;
    const parts = dateParts(value);
    if (!parts) return false;
    if (parts.year == null) return allowed.has(parts.day + parts.month);
    return allowed.has(parts.day + parts.month + pad2(parts.year % 100));
  };

  const choiceVisible = (choice, role) => {
    if (choice.showFor && !choice.showFor.includes(role)) return false;
    if (choice.hideFor && choice.hideFor.includes(role)) return false;
    return true;
  };

  const textKindFor = (node) => {
    const speakerLabel = String(node?.speaker || "").trim().toUpperCase();
    if (speakerLabel === "Я") return "thought";
    if (speakerLabel === "СИСТЕМА") return "system";
    return "dialogue";
  };

  const choiceKind = (choice) => {
    if (choice.inspect === "artifact") return "item";
    if (choice.href) return "link";
    const letters = String(choice.label || "").replace(/[^A-Za-zА-Яа-яЁё]/g, "");
    if (letters && letters === letters.toUpperCase()) return "action";
    return "speech";
  };

  const nodeLine = (node, saved) => (
    typeof node.text === "string" ? node.text : node.text[saved.role] || node.text.fallback
  );

  const visualFor = (node) => {
    const media = node.media || {};
    const still = media.poster || "../assets/guest/locations/solnyshko-park.webp";
    const desc = {
      id: media.id || node.visual || "",
      alt: media.alt || "",
      fallback: { still },
    };
    if (media.playEnterThenLoop) {
      desc.transition = {
        src: media.playEnterThenLoop,
        startStill: still,
        holdStill: still,
        playback: "one-shot",
        playedFlag: "enterPlayed",
      };
      desc.neutral = { src: media.src, still };
      return desc;
    }
    if (media.loop === false && media.src) {
      desc.burst = {
        src: media.src,
        startStill: still,
        holdStill: still,
        playback: "one-shot",
        playedFlag: media.playedFlag,
      };
      desc.neutral = { still };
      return desc;
    }
    desc.neutral = { src: media.src, still };
    return desc;
  };

  const mediaRoleFor = (node, saved) => {
    const media = node.media || {};
    if (media.playEnterThenLoop && !saved.flags.enterPlayed) return "transition";
    if (media.loop === false && media.src) return "burst";
    return "neutral";
  };

  const waitingEnter = (node, saved) =>
    Boolean(node.media?.playEnterThenLoop && !saved.flags.enterPlayed) && !reduceMotion.matches;

  const cueFor = (node, role) => {
    if (role === "transition") return "solnyshko.sfx.gate-open";
    return node.sound || "";
  };

  const syncCue = (node, role) => {
    const cueId = cueFor(node, role);
    const cueKey = soundOn && cueId ? `${save.nodeId}:${role}:${cueId}` : "";
    if (!soundOn) {
      lastCueKey = "";
      return;
    }
    if (cueId && cueKey !== lastCueKey) audio.playCue(cueId);
    lastCueKey = cueKey;
  };

  let save = saveApi.read();

  const ensureImpostorDossier = () => {
    if (!save || save.flags?.enteredAs !== "birthday") return null;
    const profile = window.TyndexStaffProfile?.registerImpostorEntry?.({
      enteredAt: Date.now(),
    });
    if (profile?.role === "impostor") save.role = "impostor";
    return profile || null;
  };

  const writeSave = (next) => {
    save = saveApi.write(next);
    window.TyndexDossierStore?.queueSync?.();
    return save;
  };

  const audio = ui.createAudioRack({
    beds: {
      carnival: { id: "solnyshko.music.carnival-horror", volume: 0.18 },
    },
    cues: {
      "solnyshko.sfx.gate-chain": { id: "solnyshko.sfx.gate-chain", volume: 0.55 },
      "solnyshko.sfx.gate-open": { id: "solnyshko.sfx.gate-open", volume: 0.6 },
      "solnyshko.sfx.carousel-mechanism": { id: "solnyshko.sfx.carousel-mechanism", volume: 0.5 },
      "solnyshko.sfx.cotton-spinner": { id: "solnyshko.sfx.cotton-spinner", volume: 0.45 },
      "solnyshko.sfx.lock-finger-taps": { id: "solnyshko.sfx.lock-finger-taps", volume: 0.55 },
      "shared.paper.unfold": { id: "shared.paper.unfold", volume: 0.5 },
    },
  });

  const syncBed = () => {
    if (soundOn) {
      audio.unlock();
      audio.setBed("carnival");
    } else {
      audio.stop();
    }
  };

  const shell = ui.bindShell(root, {
    choices: { onPick: (choice) => pick(choice) },
    media: {
      onTransitionEnd: ({ clip, skipped }) => {
        if (!save) return;
        if (clip?.playedFlag) save.flags[clip.playedFlag] = true;
        else if (skipped) save.flags.enterPlayed = true;
        else return;
        if (save.flags.enterPlayed) ensureImpostorDossier();
        writeSave(save);
        pendingEnterReveal = !skipped && !reduceMotion.matches;
        render({ reveal: pendingEnterReveal });
      },
      onError: ({ role } = {}) => {
        mediaFailed = true;
        const node = save && content.nodes[save.nodeId];
        const caption = node?.mediaFallback || "Кадр недоступен.";
        if (fallback) fallback.textContent = caption;
        if (liveEl) liveEl.textContent = caption;
        if (role === "transition" && save) {
          save.flags.enterPlayed = true;
          ensureImpostorDossier();
          writeSave(save);
          render();
        }
      },
    },
  });

  const openArtifact = (artifactId, next = null) => {
    const artifact = window.TyndexIrinaCallContent?.files?.[artifactId];
    if (!artifactDialog || !artifact) return false;
    const image = artifactDialog.querySelector("[data-solnyshko-artifact-image]");
    const title = artifactDialog.querySelector("[data-solnyshko-artifact-title]");
    const lines = artifactDialog.querySelector("[data-solnyshko-artifact-lines]");
    const stamp = artifactDialog.querySelector("[data-solnyshko-artifact-stamp]");
    image.src = `../${artifact.src}`;
    image.alt = artifact.alt || "";
    title.textContent = artifact.copy?.title || "ЛИЧНОЕ ВЛОЖЕНИЕ";
    lines.replaceChildren(
      ...(artifact.copy?.lines || []).map((line) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = line;
        return paragraph;
      })
    );
    stamp.textContent = artifact.copy?.stamp || "";
    artifactNext = next;
    artifactDialog.hidden = false;
    if (typeof artifactDialog.showModal === "function") artifactDialog.showModal();
    if (soundOn) audio.playCue("shared.paper.unfold");
    return true;
  };

  const openUnlock = () => {
    const notice = content.unlockNotice || {};
    const title = unlockDialog?.querySelector("[data-solnyshko-unlock-title]");
    const body = unlockDialog?.querySelector("[data-solnyshko-unlock-body]");
    const ok = unlockDialog?.querySelector("[data-solnyshko-unlock-ok]");
    if (title) title.textContent = notice.title || "";
    if (body) body.textContent = notice.body || "";
    if (ok) ok.textContent = notice.ok || "ОКЕЙ";
    if (!unlockDialog) return;
    unlockDialog.hidden = false;
    if (typeof unlockDialog.showModal === "function") unlockDialog.showModal();
  };

  const leaveToStaff = (href) => {
    if (save) {
      save.status = "completed";
      save.pavelAccessUnlocked = true;
      writeSave(save);
    }
    window.location.assign(href);
  };

  const goTo = (nextId, extraFlags) => {
    Object.assign(save.flags, extraFlags || {});
    save.nodeId = nextId;
    const nextNode = content.nodes[save.nodeId];
    if (nextNode?.complete || extraFlags?.pavelAccessUnlocked) {
      save.pavelAccessUnlocked = true;
    }
    if (nextNode?.complete) save.status = "completed";
    writeSave(save);
    render();
  };

  const pick = (choice) => {
    if (!save || !choice) return;
    if (choice.restart) {
      saveApi.reset();
      lastRenderedNode = "";
      pendingEnterReveal = false;
      textPhase = "line";
      wasHolding = false;
      lastMediaKey = "";
      lastCueKey = "";
      mediaFailed = false;
      start(authorizedProfile());
      return;
    }
    if (choice.inspect === "artifact") {
      const profile = authorizedProfile();
      if (!hasArtifact(profile, choice.artifactId)) {
        if (liveEl) liveEl.textContent = choice.missing || "АРТЕФАКТ НЕ НАЙДЕН В ЛИЧНОМ ДЕЛЕ.";
        return;
      }
      save.flags.inspectedArtifacts ||= [];
      if (!save.flags.inspectedArtifacts.includes(choice.artifactId)) {
        save.flags.inspectedArtifacts.push(choice.artifactId);
      }
      writeSave(save);
      openArtifact(
        choice.artifactId,
        choice.nextAfterInspect
          ? { next: choice.nextAfterInspect, set: choice.setAfterInspect }
          : null
      );
      return;
    }
    if (choice.href) {
      leaveToStaff(choice.href);
      return;
    }
    goTo(choice.next, choice.set);
  };

  const clearAdvance = () => {
    shell.line.setAdvance(null);
    if (!panel) return;
    delete panel.dataset.waitingAdvance;
    if (panel._hoursAdvance) {
      panel.removeEventListener("click", panel._hoursAdvance);
      panel._hoursAdvance = null;
    }
  };

  const armAdvance = (next) => {
    clearAdvance();
    let done = false;
    const fire = (event) => {
      if (done) return;
      if (event?.target?.closest?.("[data-game-ui-choices], form, [data-game-ui-sound], [data-game-ui-leave], [data-game-ui-modal]")) {
        return;
      }
      done = true;
      event?.preventDefault?.();
      next();
    };
    if (panel) panel.dataset.waitingAdvance = "true";
    window.requestAnimationFrame(() => {
      if (textPhase === "ready") return;
      if (panel) {
        panel._hoursAdvance = fire;
        panel.addEventListener("click", fire);
      }
      shell.line.setAdvance(fire);
    });
  };

  const render = ({ reveal = false } = {}) => {
    const node = content.nodes[save.nodeId];
    if (!node) return;
    const nodeChanged = lastRenderedNode !== save.nodeId;
    const hold = waitingEnter(node, save);
    const role = mediaRoleFor(node, save);
    const actionText = String(node.action || "").trim();
    if (channel) {
      channel.textContent = INSIDE_MEDIA.includes(node.media?.id) ? "КАНАЛ: ВНУТРИ" : "КАНАЛ: ВОРОТА";
    }
    if (nodeChanged && liveEl) liveEl.textContent = "";
    if (!mediaFailed && fallback) fallback.textContent = "";

    if (hold) {
      wasHolding = true;
      textPhase = "line";
      clearAdvance();
      if (panel) delete panel.dataset.choicesOnly;
      shell.line.render({
        kind: textKindFor(node),
        speaker: "",
        line: "",
        action: "",
      });
      form.hidden = true;
      shell.choices.resetGroup();
      shell.choices.render([]);
    } else {
      const startBeats = nodeChanged || wasHolding;
      wasHolding = false;
      if (startBeats) textPhase = "line";
      if (node.popup) textPhase = "ready";

      const waiting = textPhase !== "ready";
      if (textPhase === "line") {
        shell.line.render({
          kind: textKindFor(node),
          speaker: node.speaker || "",
          line: nodeLine(node, save),
          action: "",
        });
        armAdvance(() => {
          textPhase = actionText ? "thought" : "ready";
          render();
        });
      } else if (textPhase === "thought") {
        shell.line.render({
          kind: "thought",
          speaker: "Я",
          line: actionText,
          action: "",
        });
        armAdvance(() => {
          textPhase = "ready";
          render();
        });
      } else {
        clearAdvance();
        if (actionText) {
          shell.line.render({
            kind: textKindFor(node),
            speaker: "",
            line: "",
            action: "",
          });
        } else {
          shell.line.render({
            kind: textKindFor(node),
            speaker: node.speaker || "",
            line: nodeLine(node, save),
            action: "",
          });
        }
      }

      if (panel) {
        if (textPhase === "ready" && actionText) panel.dataset.choicesOnly = "true";
        else delete panel.dataset.choicesOnly;
      }

      const hasInput = Boolean(node.input);
      form.hidden = !hasInput || waiting;
      if (hasInput) {
        inputLabel.textContent = node.input.prompt;
        dateInput.placeholder = node.input.placeholder || "";
        inputSubmit.textContent = node.input.submit || "ПРОВЕРИТЬ";
        dateInput.value = save.flags.typedDate || "";
        dateInput.removeAttribute("aria-invalid");
      }

      const mapped = (node.choices || []).map((choice) => ({
        ...choice,
        variant: choiceKind(choice),
        hidden: !choiceVisible(choice, save.role),
      }));
      shell.choices.resetGroup();
      shell.choices.render(waiting ? [] : mapped, { reveal: reveal || pendingEnterReveal });
      pendingEnterReveal = false;
    }

    const mediaKey = `${save.nodeId}:${role}:${save.flags.enterPlayed ? "1" : "0"}`;
    if (mediaKey !== lastMediaKey) {
      mediaFailed = false;
      if (fallback) fallback.textContent = "";
      lastMediaKey = mediaKey;
      shell.media.apply(visualFor(node), {
        flags: save.flags,
        role,
        reduceMotion: reduceMotion.matches,
        muted: !soundOn,
      });
    }

    if (node.popup === "unlock") openUnlock();
    lastRenderedNode = save.nodeId;
    syncBed();
    syncCue(node, role);

    if (!hold) {
      window.requestAnimationFrame(() => {
        if (textPhase !== "ready") root.querySelector("[data-game-ui-line]")?.focus();
        else if (!form.hidden && dateInput) dateInput.focus();
        else shell.focusFirst();
      });
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const node = save && content.nodes[save.nodeId];
    if (!save || !node?.input) return;
    save.flags.typedDate = dateInput.value;
    if (!dateAccepted(dateInput.value)) {
      if (liveEl) liveEl.textContent = node.input.fail || "ДАТА НЕ ПРИНЯТА.";
      dateInput.setAttribute("aria-invalid", "true");
      dateInput.focus();
      writeSave(save);
      return;
    }
    save.flags.dateAccepted = true;
    const profile = authorizedProfile();
    goTo(profile ? "park-grounds" : node.input.next, profile
      ? { enteredAs: "birthday" }
      : undefined);
  });

  artifactDialog?.querySelector("[data-solnyshko-artifact-close]")?.addEventListener("click", () => {
    artifactDialog.close();
    artifactDialog.hidden = true;
    const pending = artifactNext;
    artifactNext = null;
    if (save && pending?.next) goTo(pending.next, pending.set);
  });

  unlockDialog?.querySelector("[data-solnyshko-unlock-ok]")?.addEventListener("click", () => {
    unlockDialog.close();
    unlockDialog.hidden = true;
    const node = save && content.nodes[save.nodeId];
    const next = node?.choices?.[0]?.next;
    if (save && next) goTo(next);
  });

  soundButton?.addEventListener("click", () => {
    soundOn = !soundOn;
    soundButton.setAttribute("aria-pressed", soundOn ? "true" : "false");
    soundButton.setAttribute("aria-label", soundOn ? "Выключить звук смены" : "Включить звук смены");
    shell.media.setMuted(!soundOn);
    syncBed();
    if (save) {
      const node = content.nodes[save.nodeId];
      if (node) syncCue(node, mediaRoleFor(node, save));
    }
  });

  const start = (profile) => {
    save = writeSave({
      version: 1,
      status: "in_progress",
      nodeId: content.startNode,
      role: profile?.role || "fallback",
      flags: {},
      pavelAccessUnlocked: false,
    });
    render();
  };

  if (save) {
    if (save.flags?.enteredAs === "birthday" && save.flags.enterPlayed) {
      ensureImpostorDossier();
    }
    const profile = authorizedProfile();
    save.role = profile?.role || "fallback";
    writeSave(save);
    render();
  } else {
    const profile = authorizedProfile();
    start(profile);
  }

  if (window.matchMedia("(max-width: 520px)").matches) {
    const restoreFocus = () => root.scrollIntoView({ block: "start" });
    if (document.readyState === "complete") window.setTimeout(restoreFocus, 0);
    else window.addEventListener("load", () => window.setTimeout(restoreFocus, 0), { once: true });
  }
})();
