import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const target = resolve(".pilotdeck-source");
const revision = "cfc4d1779228f91fececc5d6705c14dab5b7ef2f";

if (existsSync(resolve(target, "src/context/memory/edgeclaw-memory-core/src/core/file-memory.ts"))) {
  console.log("PilotDeck source is already available.");
  process.exit(0);
}

const clone = spawnSync("git", ["clone", "--filter=blob:none", "https://github.com/OpenBMB/PilotDeck.git", target], {
  stdio: "inherit",
});
if (clone.status !== 0) process.exit(clone.status ?? 1);

const checkout = spawnSync("git", ["-C", target, "checkout", revision], { stdio: "inherit" });
process.exit(checkout.status ?? 1);
