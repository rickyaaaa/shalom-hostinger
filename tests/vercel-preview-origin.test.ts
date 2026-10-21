import assert from "node:assert/strict";
import test from "node:test";
import { vercelPreviewOrigins } from "../scripts/vercel-preview-origin";
const valid = { VERCEL: "1", VERCEL_ENV: "preview", VERCEL_PROJECT_ID: "prj_itkVxGhG7b69Zh3qMQUJh7juh5D1", VERCEL_URL: "shalom-nextjs-preview-abc123-rickyaaaas-projects.vercel.app" };
test("Preview pins both origins to the platform-assigned deployment, ignoring stale configured URLs", () => {
 assert.deepEqual(vercelPreviewOrigins({ ...valid, APP_URL: "https://stale.example", PUBLIC_SITE_URL: "https://stale.example" }), { APP_URL: "https://" + valid.VERCEL_URL, PUBLIC_SITE_URL: "https://" + valid.VERCEL_URL });
});
test("Preview origin configuration rejects production, another project and malformed/unrelated hosts", () => {
 for (const override of [{ VERCEL_ENV: "production" }, { VERCEL: "" }, { VERCEL_PROJECT_ID: "another" }, ...["", "evil.example", "shalom-nextjs-preview-abc.vercel.app.evil.example", "https://shalom-nextjs-preview-abc.vercel.app", "shalom-nextjs-preview-abc.vercel.app/path", "shalom-nextjs-preview-abc.vercel.app:443", "other-project-abc.vercel.app"].map(VERCEL_URL => ({ VERCEL_URL }))]) assert.throws(() => vercelPreviewOrigins({ ...valid, ...override }));
});
