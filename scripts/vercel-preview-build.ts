import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { vercelPreviewOrigins } from "./vercel-preview-origin";
if (process.env.ALLOW_INDEXING !== "false") throw new Error("Preview must explicitly disable indexing.");
const env = { ...process.env, ...vercelPreviewOrigins(process.env), NODE_ENV: "production" as const };
const tests = readdirSync("tests").filter(name => name.endsWith(".test.ts")).map(name => "tests/" + name);
const steps = [
 ["node_modules/tsx/dist/cli.mjs", "scripts/check-deployment-env.ts", "--https"],
 ["node_modules/tsx/dist/cli.mjs", "--test", ...tests],
 ["node_modules/next/dist/bin/next", "build"],
 ["node_modules/typescript/bin/tsc", "--noEmit"],
];
console.log("Building isolated Preview for " + env.APP_URL + "; indexing disabled. Secret values are not logged.");
for (const args of steps) {
 const result = spawnSync(process.execPath, args, { env, stdio: "inherit" });
 if (result.error) throw new Error("Preview build process could not start.");
 if (result.status !== 0) process.exit(result.status ?? 1);
}
