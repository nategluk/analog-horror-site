#!/bin/zsh

# One-click macOS launcher for the local Copy Desk.
# It stays local and does not change the production site.

set -u

PROJECT_ROOT="${0:A:h}"
HOST="127.0.0.1"
PORT="${ADMIN_PORT:-8787}"
ADMIN_URL="http://${HOST}:${PORT}/admin/"
SERVER_PID=""

is_copydesk_ready() {
  curl -fsS --max-time 1 "${ADMIN_URL}" 2>/dev/null | grep -q "LOCAL ONLY"
}

open_admin() {
  if command -v open >/dev/null 2>&1; then
    open "${ADMIN_URL}"
  else
    print -r -- "Откройте в браузере: ${ADMIN_URL}"
  fi
}

stop_server() {
  if [[ -n "${SERVER_PID}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
  fi
}

if ! command -v node >/dev/null 2>&1; then
  print -r -- "Не найден Node.js. Установите Node.js и запустите файл ещё раз."
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  print -r -- "Не найден curl — он нужен, чтобы проверить готовность Copy Desk."
  exit 1
fi

if is_copydesk_ready; then
  open_admin
  print -r -- "Copy Desk уже запущен: ${ADMIN_URL}"
  exit 0
fi

cd -- "${PROJECT_ROOT}" || exit 1
print -r -- "Запускаю локальный Copy Desk..."
node scripts/admin-server.js &
SERVER_PID=$!
trap stop_server EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

for attempt in {1..50}; do
  if is_copydesk_ready; then
    open_admin
    print -r -- "Copy Desk открыт: ${ADMIN_URL}"
    print -r -- "Закройте это окно терминала, чтобы остановить локальный сервер."
    wait "${SERVER_PID}"
    exit $?
  fi

  if ! kill -0 "${SERVER_PID}" 2>/dev/null; then
    wait "${SERVER_PID}"
    exit $?
  fi

  sleep 0.1
done

print -r -- "Сервер не ответил за 5 секунд. Проверьте сообщение выше."
wait "${SERVER_PID}"
