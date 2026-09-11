# Later

Later keeps the original evidence for physical belongings, extracts explicit dates with a multimodal model, asks the user to confirm them, and monitors the confirmed deadlines.

The MVP has four spaces: `Expiry`, `Warranty`, `Return`, and `Proof`. Its main path is:

`upload → recognition → confirmation → Files → Memory → daily risk scan → one recommendation → original evidence`

## Run locally

Requirements: Node.js 22.13 or newer.

1. Copy `.dev.vars.example` to `.dev.vars` and add the model API key.
2. Run `npm ci`.
3. Run `npm run pilotdeck:setup` once. This fetches the pinned official [OpenBMB/PilotDeck](https://github.com/OpenBMB/PilotDeck) source used by the local memory and scheduling bridge.
4. Run `npm run db:generate` and apply the generated migration to the local D1 preview.
5. Start `npm run dev` and `npm run pilotdeck` in separate terminals.

The browser app uses D1 for `Item`, `Evidence`, and `Alert` metadata, and R2 for original files. The local PilotDeck bridge writes confirmed item facts through PilotDeck's `FileMemoryStore`, keeps one isolated memory/file area per Later space, and schedules a daily 09:00 Asia/Shanghai scan with PilotDeck's cron scheduler. If the bridge is offline, confirmed data remains safe in Later and the interface shows that PilotDeck sync is pending.

## Model behavior

The server uses `deepseek-v4-flash-vision-exp` through an OpenAI-compatible endpoint. Documents are treated as untrusted data. The extraction schema accepts only explicit dates; missing dates stay `null`, and no default warranty or return policy is assumed. A user must confirm editable fields before an item is stored.

## Checks

Run `npm test`, `npx tsc --noEmit`, and `npm run build`.

## License note

The optional local bridge loads source from the official PilotDeck repository at a pinned revision. PilotDeck is licensed under AGPL-3.0; consult its bundled `LICENSE` after setup when redistributing or modifying that integration.
