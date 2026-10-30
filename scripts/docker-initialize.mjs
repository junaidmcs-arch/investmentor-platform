import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

// This initializer is deliberately limited to the disposable local Compose stack.
if (process.env.NODE_ENV !== "development" || new URL(process.env.DATABASE_URL).hostname !== "database") {
  throw new Error("Use this initializer only with the local Docker Compose configuration.");
}

await mkdir("/local-state", { recursive: true });
try {
  await writeFile("/local-state/auth-secret", randomBytes(48).toString("hex"), { flag: "wx", mode: 0o600 });
} catch (error) {
  if (error.code !== "EEXIST") throw error;
}

for (const task of ["db:migrate", "db:seed"]) {
  const result = spawnSync("pnpm", [task], { stdio: "inherit", env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log("Local database and authentication secret are ready.");
