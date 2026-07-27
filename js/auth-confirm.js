(() => {
  const ENDPOINT =
    "https://edoqmjtqkqnksxjsjqcg.supabase.co/functions/v1/consume-dossier-claim";
  const AUTH_SESSION_KEY = "tyndex_auth_session_v1";
  const PENDING_CLAIM_KEY = "tyndex_pending_claim_v1";
  const PENDING_TTL_MS = 15 * 60 * 1000;

  const title = document.querySelector("[data-auth-title]");
  const message = document.querySelector("[data-auth-message]");
  const signal = document.querySelector("[data-auth-signal]");
  const code = document.querySelector("[data-auth-code]");
  const progress = document.querySelector("[data-auth-progress]");
  const summary = document.querySelector("[data-auth-summary]");
  const status = document.querySelector("[data-auth-status]");
  const role = document.querySelector("[data-auth-role]");
  const sessions = document.querySelector("[data-auth-sessions]");
  const artifacts = document.querySelector("[data-auth-artifacts]");
  const returnButton = document.querySelector("[data-auth-return]");
  const retryButton = document.querySelector("[data-auth-retry]");

  const readJson = (key) => {
    try {
      return JSON.parse(window.localStorage.getItem(key));
    } catch {
      return null;
    }
  };

  const writeJson = (key, value) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  const clearPending = () => {
    window.localStorage.removeItem(PENDING_CLAIM_KEY);
  };

  const getCallbackData = () => {
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const pending = readJson(PENDING_CLAIM_KEY);
    const pendingIsFresh =
      pending &&
      Number.isFinite(pending.savedAt) &&
      Date.now() - pending.savedAt < PENDING_TTL_MS;

    return {
      claim: query.get("claim") || (pendingIsFresh ? pending.claim : ""),
      transfer:
        query.get("transfer") || (pendingIsFresh ? pending.transfer : ""),
      accessToken:
        hash.get("access_token") ||
        (pendingIsFresh ? pending.accessToken : ""),
      refreshToken:
        hash.get("refresh_token") ||
        (pendingIsFresh ? pending.refreshToken : ""),
      expiresIn: Number(hash.get("expires_in")) || 3600,
      authError:
        hash.get("error_description") ||
        query.get("error_description") ||
        hash.get("error") ||
        query.get("error") ||
        "",
    };
  };

  const clearSensitiveUrl = () => {
    window.history.replaceState(
      {},
      document.title,
      `${window.location.pathname}`,
    );
  };

  const setState = ({
    state,
    heading,
    copy,
    signalText,
    codeText,
    showReturn = true,
    showRetry = false,
  }) => {
    document.body.dataset.authState = state;
    title.textContent = heading;
    message.textContent = copy;
    signal.textContent = signalText;
    code.textContent = codeText;
    progress.hidden = state !== "pending";
    returnButton.hidden = !showReturn;
    retryButton.hidden = !showRetry;
    if (state !== "success") summary.hidden = true;
  };

  const showInvalid = () => {
    clearPending();
    setState({
      state: "error",
      heading: "ССЫЛКА НЕ ПРИНЯТА",
      copy:
        "Ссылка повреждена, была открыта не полностью или больше не подтверждает адрес восстановления. Вернитесь на устройство с локальной копией и запросите новую передачу.",
      signalText: "ОТКЛОНЕНО",
      codeText: "TRANSFER://INVALID",
    });
  };

  const showExpired = () => {
    clearPending();
    setState({
      state: "expired",
      heading: "СРОК ПЕРЕДАЧИ ИСТЁК",
      copy:
        "Локальная копия не изменена. Откройте кадровую базу на исходном устройстве и повторите закрепление личного дела.",
      signalText: "ИСТЕКЛО",
      codeText: "TRANSFER://EXPIRED",
    });
  };

  const showTemporaryFailure = () => {
    setState({
      state: "error",
      heading: "КАНАЛ ВРЕМЕННО НЕДОСТУПЕН",
      copy:
        "Данные не потеряны. Повторите проверку с этого устройства, не запрашивая новое письмо.",
      signalText: "ПОВТОР",
      codeText: "TRANSFER://RETRY",
      showReturn: false,
      showRetry: true,
    });
  };

  const storeSession = (callback) => {
    writeJson(AUTH_SESSION_KEY, {
      version: 1,
      accessToken: callback.accessToken,
      refreshToken: callback.refreshToken,
      expiresAt: Date.now() + callback.expiresIn * 1000,
      updatedAt: Date.now(),
    });
  };

  const showSuccess = (result, callback) => {
    storeSession(callback);
    clearPending();
    document.body.dataset.authState = "success";
    title.textContent =
      result.status === "already_claimed"
        ? "ЛИЧНОЕ ДЕЛО УЖЕ ЗАКРЕПЛЕНО"
        : "ЛИЧНОЕ ДЕЛО ЗАКРЕПЛЕНО";
    message.textContent =
      result.status === "already_claimed"
        ? "Адрес восстановления подтверждён ранее. Доступ на этом устройстве восстановлен."
        : "Локальная копия принята серверной кадровой базой. Теперь дело можно восстановить после смены устройства.";
    signal.textContent = "ДОПУЩЕН";
    code.textContent = "TRANSFER://SEALED";
    progress.hidden = true;
    returnButton.hidden = false;
    retryButton.hidden = true;

    if (result.dossier) {
      const roleLabels = {
        animator: "АНИМАТОР",
        volunteer: "ВОЛОНТЁР",
      };
      status.textContent =
        result.dossier.status === "completed" ? "АКТИВЕН" : "ПРИНЯТ";
      role.textContent = roleLabels[result.dossier.role] || "НАЗНАЧЕНО";
      sessions.textContent = String(result.dossier.sessionCount ?? "—");
      artifacts.textContent = String(result.dossier.artifactCount ?? "—");
      summary.hidden = false;
    } else {
      summary.hidden = true;
    }
  };

  let callback = getCallbackData();

  const consumeClaim = async () => {
    setState({
      state: "pending",
      heading: "ПРОВЕРКА ССЫЛКИ ДОСТУПА",
      copy:
        "Не закрывайте окно. Система сверяет адрес восстановления и локальную копию личного дела.",
      signalText: "ПРОВЕРКА",
      codeText: "TRANSFER://PENDING",
      showReturn: false,
    });

    try {
      const response = await window.fetch(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${callback.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claim: callback.claim,
          transfer: callback.transfer,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && result.ok) {
        showSuccess(result, callback);
        return;
      }

      if (response.status === 410 || result.error === "link_expired") {
        showExpired();
        return;
      }

      if (
        response.status === 400 ||
        response.status === 401 ||
        response.status === 403 ||
        result.error === "link_invalid"
      ) {
        showInvalid();
        return;
      }

      showTemporaryFailure();
    } catch {
      showTemporaryFailure();
    }
  };

  const start = () => {
    if (callback.authError) {
      clearSensitiveUrl();
      showInvalid();
      return;
    }

    if (
      !callback.claim ||
      !callback.transfer ||
      !callback.accessToken ||
      !callback.refreshToken
    ) {
      clearSensitiveUrl();
      showInvalid();
      return;
    }

    writeJson(PENDING_CLAIM_KEY, {
      claim: callback.claim,
      transfer: callback.transfer,
      accessToken: callback.accessToken,
      refreshToken: callback.refreshToken,
      expiresIn: callback.expiresIn,
      savedAt: Date.now(),
    });
    clearSensitiveUrl();
    consumeClaim();
  };

  retryButton.addEventListener("click", () => {
    callback = getCallbackData();
    consumeClaim();
  });

  start();
})();
