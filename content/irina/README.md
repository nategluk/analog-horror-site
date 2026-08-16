# Irina call content (Stage 0 + Stage 1 MVP)

**Полный handoff для агента:** [`docs/IRINA_CONTENT_PIPELINE.md`](../../docs/IRINA_CONTENT_PIPELINE.md)  
**Механика звонка:** [`docs/IRINA_CALL_GAME.md`](../../docs/IRINA_CALL_GAME.md)  
**Канон персонажа:** `~/md_lore/irina.md` (вне этого каталога)

## Source of truth

| File | Role |
|------|------|
| `call-content.js` | **Единственный** source of truth для узлов, files, staff messages, artifact catalog, node→artifact map |

Не редактировать диалоги в `js/app.js`. Не править `docs/IRINA_DIALOGUES.md` вручную.

## Edit workflow (recommended)

```sh
# from repo root
node scripts/admin-server.js
# open http://127.0.0.1:8787/admin/  Copy Desk
# nodes inspector: http://127.0.0.1:8787/admin/nodes.html
# playtest: http://127.0.0.1:8787/hiring.html  (staff mode + ID 0091-A)
```

Admin: list/search nodes, edit text & choices, create/delete drafts, validate,
export MD. **Localhost only** — do not ship `/admin` public without auth.

### Surgical save

- Scalar-only change (`text`, `step`, …) → patches **one property** in place;
  `choices` formatting stays byte-identical.
- Complex change / create / delete → rewrites **only that node entry** inside
  `const nodes = { … }`.
- Catalogs and other nodes are not reformatted.

### Manual workflow

1. Edit `content/irina/call-content.js`
2. `node scripts/validate-irina-call-content.js`
3. `node scripts/export-irina-dialogues.js`
4. `node scripts/smoke-irina-call.js`
5. Deploy as usual (pages load this module **before** `js/app.js`)

## Runtime contracts

```js
// Loaded first — data
window.TyndexIrinaCallContent = {
  version: 1,
  curatorId: "0091-A",
  mediaBase: "assets/staff/curators/irina/",
  rewardCopy,
  files,
  staffMessages,
  staffArtifacts,
  nodeArtifacts,
  nodes, // former curatorNodes
}

// Set by js/app.js — classification helpers used by function text/choices
window.TyndexIrinaRuntime = {
  readStaffProfile,
  getCuratorAssignment,
  getAssignmentCallbacks,
  isCloseClassification,
}
```

Function fields in nodes (e.g. `name-ack`, `assignment`) **must** go through
the runtime bridge. Without it the call throws on those nodes.

## Why JS, not JSON?

Some `text` / `choices` are functions of `progress`. Declarative conditions are
a later stage. Until then this stays a JS data module.

## Do not re-run extract

`node scripts/extract-irina-call-content.js` was a **one-time** Stage 0 migration
from inline `curatorNodes` in `app.js`. That tree is gone from app.js; re-running
extract intentionally fails. Edit `call-content.js` or use admin instead.

## Script tags

Every page that loads `js/app.js` must load content first, e.g.:

```html
<script src="js/dossier-store.js"></script>
<script src="content/irina/call-content.js"></script>
<script src="js/app.js"></script>
```
