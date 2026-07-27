(() => {
  const DOSSIER_KEY = "tyndex_staff_profile_v1";
  const CURRENT_SESSION_KEY = "tyndex_curator_call_v4";
  const CHANGE_EVENT = "tyndex:dossier-store-change";
  const watchedKeys = new Set([DOSSIER_KEY, CURRENT_SESSION_KEY]);

  const clone = (value) => {
    if (value === null || value === undefined) return value;
    return JSON.parse(JSON.stringify(value));
  };

  const readJson = (key) => {
    try {
      const serialized = window.localStorage.getItem(key);
      return serialized === null ? null : JSON.parse(serialized);
    } catch {
      return null;
    }
  };

  const notify = (record, operation) => {
    window.dispatchEvent(
      new CustomEvent(CHANGE_EVENT, {
        detail: {
          record,
          operation,
        },
      })
    );
  };

  const writeJson = (key, record, value) => {
    window.localStorage.setItem(key, JSON.stringify(value));
    notify(record, "write");
    return value;
  };

  const removeJson = (key, record) => {
    window.localStorage.removeItem(key);
    notify(record, "remove");
  };

  const getTimestamp = (value) => {
    if (Number.isFinite(value)) return value;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const chooseSession = (current, incoming) => {
    if (!current) return clone(incoming);
    if (!incoming) return clone(current);
    if (current.status === "completed" && incoming.status !== "completed") {
      return clone(current);
    }
    if (incoming.status === "completed" && current.status !== "completed") {
      return clone(incoming);
    }

    const currentTime = getTimestamp(
      current.serverUpdatedAt || current.updatedAt || current.completedAt
    );
    const incomingTime = getTimestamp(
      incoming.serverUpdatedAt || incoming.updatedAt || incoming.completedAt
    );
    return clone(incomingTime >= currentTime ? incoming : current);
  };

  const mergeById = (current = [], incoming = [], chooseRecord) => {
    const merged = new Map();
    current.forEach((record) => {
      if (record?.id) merged.set(record.id, clone(record));
    });
    incoming.forEach((record) => {
      if (!record?.id) return;
      merged.set(record.id, chooseRecord(merged.get(record.id), record));
    });
    return [...merged.values()];
  };

  const mergeDossiers = (current, incoming) => {
    if (!current) return clone(incoming);
    if (!incoming) return clone(current);

    const currentTime = getTimestamp(current.updatedAt);
    const incomingTime = getTimestamp(incoming.updatedAt);
    const newer = incomingTime >= currentTime ? incoming : current;
    const merged = {
      ...clone(current),
      ...clone(newer),
    };

    const statusRank = {
      screening: 0,
      in_progress: 1,
      completed: 2,
    };
    merged.status =
      (statusRank[incoming.status] ?? -1) > (statusRank[current.status] ?? -1)
        ? incoming.status
        : current.status;
    if (current.status === "completed" && incoming.status !== "completed") {
      merged.role = current.role;
      merged.completedAt = current.completedAt;
    } else if (
      incoming.status === "completed" &&
      current.status !== "completed"
    ) {
      merged.role = incoming.role;
      merged.completedAt = incoming.completedAt;
    }
    const createdAt = [current.createdAt, incoming.createdAt]
      .filter(Boolean)
      .sort((left, right) => getTimestamp(left) - getTimestamp(right))[0];
    if (createdAt) merged.createdAt = createdAt;
    merged.artifacts = mergeById(
      current.artifacts,
      incoming.artifacts,
      (known) => known
    );
    merged.sessions = mergeById(
      current.sessions,
      incoming.sessions,
      chooseSession
    );

    return merged;
  };

  const subscribeToDossierChanges = (callback) => {
    if (typeof callback !== "function") return () => {};

    const handleLocalChange = (event) => {
      callback({
        source: "current-tab",
        ...event.detail,
      });
    };
    const handleStorageChange = (event) => {
      if (!watchedKeys.has(event.key)) return;
      callback({
        source: "other-tab",
        record: event.key === DOSSIER_KEY ? "dossier" : "currentSession",
        operation: event.newValue === null ? "remove" : "write",
      });
    };

    window.addEventListener(CHANGE_EVENT, handleLocalChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(CHANGE_EVENT, handleLocalChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  };

  window.TyndexDossierStore = Object.freeze({
    mode: "local",
    keys: Object.freeze({
      dossier: DOSSIER_KEY,
      currentSession: CURRENT_SESSION_KEY,
    }),
    readDossier: () => readJson(DOSSIER_KEY),
    saveDossier: (dossier) => writeJson(DOSSIER_KEY, "dossier", dossier),
    removeDossier: () => removeJson(DOSSIER_KEY, "dossier"),
    readCurrentSession: () => readJson(CURRENT_SESSION_KEY),
    saveCurrentSession: (session) =>
      writeJson(CURRENT_SESSION_KEY, "currentSession", session),
    removeCurrentSession: () =>
      removeJson(CURRENT_SESSION_KEY, "currentSession"),
    mergeDossiers,
    subscribeToDossierChanges,
  });
})();
