# Серверное личное дело: настройка Supabase

Актуально на 27 июля 2026 года для Supabase CLI `2.109.1`.

Этот документ описывает серверное основание личного кабинета. Репозиторий
связан с удалённым Supabase-проектом, а миграции применены 27 июля 2026 года.
Публичный адрес определён как `https://detskiyzhir.org/`. Браузерная игра
продолжает хранить рабочее состояние локально, а сервер уже принимает первичное
закрепление и восстанавливает закреплённое дело на новом устройстве: Auth URL,
секреты, миграции и четыре Edge Function развёрнуты. Экран подтверждения
опубликован на публичном домене.

Канонический продуктовый и логический контракт находится в
`docs/IRINA_CALL_GAME.md`.

## Что уже подготовлено

- `supabase/config.toml` — локальные Auth, redirect и Edge Function настройки;
- `supabase/migrations/` — дела, сеансы, артефакты и временные передачи;
- `supabase/functions/begin-dossier-claim/` — начало закрепления и magic link;
- `supabase/functions/consume-dossier-claim/` — подтверждённое закрепление;
- `supabase/functions/begin-dossier-access/` — новое письмо для уже
  закреплённого дела;
- `supabase/functions/restore-dossier/` — чтение собственного дела по
  подтверждённой сессии;
- `supabase/functions/_shared/curator-0091-contract.ts` — серверные allowlist;
- `supabase/templates/magic-link.html` — подготовленный фирменный шаблон письма;
- `supabase/functions/.env.example` — только несекретные примеры переменных;
- `auth/confirm.html`, `js/auth-confirm.js`, `css/auth.css` — безопасный callback;
- `js/app.js`, `staff.html`, `css/style.css` — предложение закрепления после
  первого назначения и восстановление из обычного экрана STAFF без повторной
  игры.

`js/dossier-store.js` по-прежнему работает в режиме `local`: серверная копия
загружается при подтверждённом входе, объединяется с безопасной локальной
копией и затем используется игрой. Непрерывная двусторонняя синхронизация
относится к следующему этапу.

## Таблицы и доступ

### `dossiers`

Одна строка на подтверждённого владельца. Хранит роль, статус, аватар и ссылку
на текущий сеанс. Email отсутствует и остаётся только в `auth.users`.

### `dossier_sessions`

Хранит отдельные прохождения и нормализованный JSON прогресса. Пара
`(owner_user_id, id)` не позволяет повторной отправке создать дубликат.

### `artifact_catalog` и `dossier_artifacts`

Каталог содержит только публичные стабильные ID. Коллекция хранит факт
получения и способ получения, но не принимает разметку, URL или секретный
контент от клиента.

### `dossier_claims`

Одноразовое временное хранилище до подтверждения email. У `anon` и
`authenticated` нет прав чтения или записи. С ним работает только серверный
ключ Edge Function.

На пользовательских таблицах включён RLS. Каждая политика сравнивает
`auth.uid()` с `owner_user_id`. Прямое удаление клиенту не выдано.

## Удалённый проект

CLI авторизован, проект связан через игнорируемый каталог `supabase/.temp`, а
пять миграций присутствуют в локальной и удалённой истории:

```text
20260727054500_create_dossiers.sql
20260727054600_create_dossier_sessions.sql
20260727054700_create_dossier_artifacts.sql
20260727054800_create_dossier_claims.sql
20260727063000_consume_dossier_claim.sql
```

Проверка удалённой схемы:

```sh
supabase migration list
supabase db lint --linked --level warning
```

В `supabase/config.toml` уже зафиксированы:

- `site_url` — `https://detskiyzhir.org/`;
- production redirect — `https://detskiyzhir.org/auth/confirm.html`;
- локальный redirect — `http://127.0.0.1:4173/auth/confirm.html`.

Эта Auth-конфигурация отправлена в связанный проект 27 июля 2026 года.

`auth/confirm.html` опубликован и доступен по
`https://detskiyzhir.org/auth/confirm`. Публичный callback проверен отдельно на
мобильном размере; после обработки он удаляет Auth-параметры из адресной
строки.

Для домена `detskiyzhir.org` подтверждён Resend и настроен Custom SMTP.
Фирменный шаблон из `supabase/templates/magic-link.html` включён в
`config.toml` и отправлен в удалённый Auth 27 июля 2026 года; он использует
одноразовую ссылку Supabase и не содержит пароля.

Для функции используются следующие значения:

```sh
supabase secrets set \
  PUBLIC_SITE_URL=https://detskiyzhir.org/ \
  ALLOWED_SITE_ORIGINS=https://detskiyzhir.org,http://127.0.0.1:4173
```

Секреты установлены, а `begin-dossier-claim`, `consume-dossier-claim`,
`begin-dossier-access` и `restore-dossier` развёрнуты в связанный проект и
имеют статус `ACTIVE` (версия 1).
`begin-dossier-claim` требует publishable credentials даже при
`verify_jwt = false`. `consume-dossier-claim` требует подтверждённый
пользовательский JWT, разрешённый origin и одноразовый transfer secret.
`begin-dossier-access` возвращает одинаковый успешный ответ независимо от
существования адреса, а `restore-dossier` читает только дело владельца
подтверждённого JWT через RLS.

Если сайт размещён под путём, он обязан заканчиваться `/`:

```text
https://example.github.io/analog-horror-site/
```

Команды повторного развёртывания функций:

```sh
supabase functions deploy begin-dossier-claim
supabase functions deploy consume-dossier-claim
supabase functions deploy begin-dossier-access
supabase functions deploy restore-dossier
```

В Auth URL Configuration проверить:

- `Site URL` — настоящий публичный корень сайта;
- redirect URL — точный публичный адрес `auth/confirm.html`;
- локальный redirect — `http://127.0.0.1:4173/auth/confirm.html` только для
  разработки.

Custom SMTP настроен через подтверждённый домен Resend. Реальное письмо
первичного закрепления доставлено и открыто на iPhone 27 июля 2026 года.
Отдельно после публикации нового frontend нужно проверить новое письмо
восстановления на втором устройстве.

## Переменные Edge Function

Supabase автоматически предоставляет серверные и publishable keys. Серверный
ключ нельзя помещать во frontend. Publishable key предназначен для браузера и
используется в `js/app.js` только для вызова публичного начала закрепления.

Проект добавляет только:

- `PUBLIC_SITE_URL` — корень сайта, на котором будет `auth/confirm.html`;
- `ALLOWED_SITE_ORIGINS` — точные допустимые browser origins через запятую.

Файлы с реальными значениями `.env` игнорируются Git.

## Контракт `begin-dossier-claim`

Метод: `POST`.

Функция принимает publishable API key, email, завершённый локальный профиль и
необязательную копию текущего сеанса.

Она:

1. проверяет origin и размер запроса;
2. отбрасывает неизвестные поля, узлы, флаги, файлы, метки и артефакты;
3. требует завершённое назначение и известную роль;
4. ограничивает число запросов на один email hash;
5. сохраняет только SHA-256 email и одноразового секрета;
6. создаёт временную передачу на 24 часа;
7. отправляет magic link на утверждённый callback;
8. удаляет передачу, если письмо не удалось инициировать.

При каждом новом запросе функция также удаляет просроченные передачи.
SQL-функция `private.delete_expired_dossier_claims()` оставлена для будущего
планового обслуживания базы.

В успешном ответе нет email, ID передачи или transfer secret:

```json
{
  "ok": true,
  "expiresInSeconds": 86400
}
```

До публикации `auth/confirm.html` функцию нельзя подключать к публичной кнопке.

## Контракт `consume-dossier-claim`

Метод: `POST`.

Callback получает подтверждённый access token из fragment magic link, сразу
удаляет token, claim ID и transfer secret из адресной строки и отправляет их в
Edge Function. Функция:

1. принимает только production или локальный origin;
2. проверяет JWT через Supabase Auth;
3. сверяет SHA-256 подтверждённого email с временной передачей;
4. передаёт только hashes и `auth.users.id` в SQL-функцию;
5. атомарно блокирует claim, создаёт или обновляет дело, сеансы и артефакты;
6. помечает передачу использованной в той же транзакции;
7. повторный переход того же владельца считает успешным, не создавая дубликаты.

После успеха callback сохраняет минимальную сессию без email под ключом
`tyndex_auth_session_v1`. Незавершённая попытка хранится не дольше 15 минут под
`tyndex_pending_claim_v1`, чтобы сетевую ошибку можно было повторить без нового
письма.

## Восстановление на новом устройстве

Повторное прохождение не требуется. На устройстве без локального сохранения
игрок:

1. открывает обычный `staff.html`;
2. выбирает `ВОССТАНОВИТЬ ЛИЧНОЕ ДЕЛО`;
3. вводит тот же адрес восстановления;
4. открывает новое одноразовое письмо на этом устройстве;
5. возвращается из callback в STAFF с восстановленными ролью, аватаром,
   сеансами и материалами.

`begin-dossier-access` инициирует magic link с `mode=access`, не принимает
игровые данные и не сообщает, существует ли адрес. Callback получает
подтверждённую Auth-сессию и вызывает `restore-dossier`. Функция читает
пользовательские таблицы через RLS, а callback объединяет ответ с локальной
копией через `mergeDossiers()`, сохраняет текущий сеанс и включает режим
сотрудника.

## Локальная проверка

Для полного `supabase start`, применения миграций и локальной почты нужен
работающий Docker Desktop:

```sh
supabase start
supabase db reset
supabase functions serve begin-dossier-claim \
  --env-file supabase/functions/.env
```

Локальные письма появляются в Mailpit по адресу, который выводит
`supabase status`.

Без Docker доступны:

```sh
npx deno check supabase/functions/begin-dossier-claim/index.ts
npx deno check supabase/functions/consume-dossier-claim/index.ts
npx deno check supabase/functions/begin-dossier-access/index.ts
npx deno check supabase/functions/restore-dossier/index.ts
npx deno run --allow-read scripts/check-server-contract.ts
supabase start
```

Пятая команда в такой среде должна дойти до проверки Docker и остановиться с
сообщением о недоступном daemon. Это подтверждает разбор `config.toml`, но не
подтверждает применение SQL.

## Что ещё не реализовано

- публичный тест нового письма восстановления на втором устройстве после
  публикации frontend;
- автоматическое обновление истёкшей Auth-сессии и явный выход;
- непрерывная двусторонняя синхронизация изменений;
- полное разрешение конфликтов между одновременно изменёнными копиями.
