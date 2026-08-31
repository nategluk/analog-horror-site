(() => {
  const DOSSIER_KEY = "tyndex_staff_profile_v1";
  const CURRENT_SESSION_KEY = "tyndex_curator_call_v4";
  const AUTH_SESSION_KEY = "tyndex_auth_session_v1";
  const SYNC_ENDPOINT =
    "https://edoqmjtqkqnksxjsjqcg.supabase.co/functions/v1/sync-dossier";
  const TOKEN_ENDPOINT =
    "https://edoqmjtqkqnksxjsjqcg.supabase.co/auth/v1/token?grant_type=refresh_token";
  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_zIWow9PlLu6B63FKWLiBrA_jllbCKhI";
  const GAME_SAVE_KEYS = Object.freeze([
    "tyndex_lora_red_room_v1",
    "tyndex_pavel_observation_booth_v1",
    "tyndex_irina_solnyshko_v1",
  ]);
  const SYNC_DELAY_MS = 900;
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

  const readGameSaves = () =>
    Object.fromEntries(
      GAME_SAVE_KEYS.flatMap((key) => {
        const value = readJson(key);
        return value?.version === 1 ? [[key, value]] : [];
      })
    );

  const mergeGameSaves = (incoming) => {
    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
      return readGameSaves();
    }
    GAME_SAVE_KEYS.forEach((key) => {
      const restored = incoming[key];
      if (!restored || restored.version !== 1) return;
      const current = readJson(key);
      const currentTime = Number(current?.updatedAt || 0);
      const restoredTime = Number(restored.updatedAt || 0);
      if (!current || restoredTime >= currentTime) {
        window.localStorage.setItem(key, JSON.stringify(restored));
      }
    });
    return readGameSaves();
  };

  const readAuthSession = () => {
    const session = readJson(AUTH_SESSION_KEY);
    if (
      !session ||
      session.version !== 1 ||
      typeof session.accessToken !== "string" ||
      typeof session.refreshToken !== "string"
    ) return null;
    return session;
  };

  const refreshAuthSession = async (session) => {
    if (!session?.refreshToken) return null;
    try {
      const response = await window.fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: session.refreshToken }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.access_token || !result.refresh_token) return null;
      const refreshed = {
        version: 1,
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        expiresAt: Date.now() + (Number(result.expires_in) || 3600) * 1000,
        updatedAt: Date.now(),
      };
      window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(refreshed));
      return refreshed;
    } catch {
      return null;
    }
  };

  const getUsableAuthSession = async ({ forceRefresh = false } = {}) => {
    const session = readAuthSession();
    if (!session) return null;
    if (!forceRefresh && Number(session.expiresAt) > Date.now() + 60_000) {
      return session;
    }
    return refreshAuthSession(session);
  };

  const buildBackupPayload = () => ({
    schemaVersion: 2,
    dossier: readJson(DOSSIER_KEY),
    currentSession: readJson(CURRENT_SESSION_KEY),
    gameSaves: readGameSaves(),
  });

  let syncTimer = 0;
  let syncPromise = null;
  let syncRequested = false;

  const syncNow = async () => {
    const payload = buildBackupPayload();
    if (payload.dossier?.status !== "completed") return false;
    if (syncPromise) {
      syncRequested = true;
      return syncPromise;
    }
    syncPromise = (async () => {
      let session = await getUsableAuthSession();
      if (!session) return false;
      const send = (accessToken) => window.fetch(SYNC_ENDPOINT, {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildBackupPayload()),
      });
      try {
        let response = await send(session.accessToken);
        if (response.status === 401) {
          session = await getUsableAuthSession({ forceRefresh: true });
          if (!session) return false;
          response = await send(session.accessToken);
        }
        const result = await response.json().catch(() => ({}));
        if (result.error === "server_newer") {
          if (!result.backup) return false;
          mergeBackup(result.backup);
          response = await send(session.accessToken);
          const retryResult = await response.json().catch(() => ({}));
          return response.ok && retryResult.ok === true;
        }
        return response.ok && result.ok === true;
      } catch {
        return false;
      }
    })().finally(() => {
      syncPromise = null;
      if (syncRequested) {
        syncRequested = false;
        queueSync();
      }
    });
    return syncPromise;
  };

  const queueSync = () => {
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(syncNow, SYNC_DELAY_MS);
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
      (known, next) => ({
        ...clone(next),
        ...clone(known),
      })
    );
    merged.sessions = mergeById(
      current.sessions,
      incoming.sessions,
      chooseSession
    );
    merged.messages = mergeById(
      current.messages,
      incoming.messages,
      (known, next) => {
        if (!known) return clone(next);
        if (!next) return clone(known);
        const knownReadAt = getTimestamp(known.readAt);
        const nextReadAt = getTimestamp(next.readAt);
        return {
          ...clone(known),
          ...clone(next),
          deliveredAt:
            getTimestamp(known.deliveredAt) <= getTimestamp(next.deliveredAt)
              ? known.deliveredAt
              : next.deliveredAt,
          readAt:
            knownReadAt >= nextReadAt ? known.readAt : next.readAt,
        };
      }
    );
    const mergeUnique = (...lists) => [
      ...new Set(lists.flat().filter((value) => typeof value === "string")),
    ];
    merged.removedArtifactIds = mergeUnique(
      current.removedArtifactIds || [],
      incoming.removedArtifactIds || []
    );
    merged.removedMessageIds = mergeUnique(
      current.removedMessageIds || [],
      incoming.removedMessageIds || []
    );
    merged.nameHistory = mergeUnique(
      current.nameHistory || [],
      incoming.nameHistory || []
    ).slice(-8);
    const deletedItems = new Map();
    [...(current.deletedItems || []), ...(incoming.deletedItems || [])].forEach(
      (item) => {
        if (!item?.kind || !item?.id) return;
        const key = `${item.kind}:${item.id}`;
        const known = deletedItems.get(key);
        if (!known || getTimestamp(item.deletedAt) > getTimestamp(known.deletedAt)) {
          deletedItems.set(key, clone(item));
        }
      }
    );
    merged.deletedItems = [...deletedItems.values()];

    return merged;
  };

  const mergeBackup = (incoming) => {
    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
      return buildBackupPayload();
    }
    if (incoming.dossier) {
      const dossier = mergeDossiers(readJson(DOSSIER_KEY), incoming.dossier);
      window.localStorage.setItem(DOSSIER_KEY, JSON.stringify(dossier));
    }
    if (incoming.currentSession) {
      const session = chooseSession(
        readJson(CURRENT_SESSION_KEY),
        incoming.currentSession
      );
      window.localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
    }
    mergeGameSaves(incoming.gameSaves);
    return buildBackupPayload();
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
    mode: "local-with-cloud-backup",
    keys: Object.freeze({
      dossier: DOSSIER_KEY,
      currentSession: CURRENT_SESSION_KEY,
    }),
    readDossier: () => readJson(DOSSIER_KEY),
    saveDossier: (dossier) => {
      const saved = writeJson(DOSSIER_KEY, "dossier", dossier);
      queueSync();
      return saved;
    },
    removeDossier: () => removeJson(DOSSIER_KEY, "dossier"),
    readCurrentSession: () => readJson(CURRENT_SESSION_KEY),
    saveCurrentSession: (session) => {
      const saved = writeJson(CURRENT_SESSION_KEY, "currentSession", session);
      queueSync();
      return saved;
    },
    removeCurrentSession: () =>
      removeJson(CURRENT_SESSION_KEY, "currentSession"),
    mergeDossiers,
    readGameSaves,
    mergeGameSaves,
    mergeBackup,
    buildBackupPayload,
    queueSync,
    syncNow,
    subscribeToDossierChanges,
  });

  window.addEventListener("online", queueSync);
  window.setTimeout(queueSync, 0);
})();
