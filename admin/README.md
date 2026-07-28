# Local Irina dialogue admin (Stage 1 MVP)

**Not for production.** Binds to `127.0.0.1` only via
`scripts/admin-server.js`.

Full agent handoff: [`docs/IRINA_CONTENT_PIPELINE.md`](../docs/IRINA_CONTENT_PIPELINE.md).

## Start

```sh
# repo root
node scripts/admin-server.js
```

| URL | Purpose |
|-----|---------|
| http://127.0.0.1:8787/admin/ | Editor UI |
| http://127.0.0.1:8787/hiring.html | Site preview (same origin) |

Port: `ADMIN_PORT` env or default `8787`.

## What it does

- Browse / search ~116 curator-call nodes
- Edit node fields and static choices
- Preserve choice fields not exposed by the MVP form (for example `image` /
  `imageAlt`) when saving another field
- Edit function fields as JS source (`{ __fn: "..." }` over the wire)
- Create kebab-case draft nodes; delete non-entry nodes
- Validate graph; export `docs/IRINA_DIALOGUES.md`
- Show outbound/inbound edges for selected node

## Save semantics (surgical)

Implemented in `scripts/admin-server.js`:

1. Prefer **in-place scalar property patch** when only strings/numbers/bools change
   and complex fields (`choices`, functions) are deep-equal to previous values.
2. Else rewrite **only that node’s entry** inside `const nodes = { … }`.
3. Never rewrite rewardCopy / files / staffArtifacts / entire file on node save.

The repository `_config.yml` excludes `admin/` and `scripts/` from the
GitHub Pages build. They remain versioned local tools, not public site routes.

If save suddenly reformats the whole `call-content.js`, treat it as a regression.

## Files

| Path | Role |
|------|------|
| `admin/index.html` | Shell |
| `admin/admin.css` | UI |
| `admin/admin.js` | Client |
| `scripts/admin-server.js` | Static server + `/api/*` + surgical writer |
| `content/irina/call-content.js` | Data written by API |

## Out of scope (not built)

- Auth, remote multi-user edit
- Visual graph canvas
- In-admin play-from-node
- Outbound character mail to players
