import nextEnv from "@next/env";
import { tourSchema, reviewPageSchema, latestReviewsSchema } from "../src/lib/types";
import { z } from "zod";

nextEnv.loadEnvConfig(process.cwd());
const base = process.env.WORDPRESS_API_URL?.replace(/\/$/, "");
if (!base) throw new Error("Set WORDPRESS_API_URL in .env.local.");
const checks = [
  ["/tours", z.object({items:z.array(tourSchema),page:z.number(),per_page:z.number(),total:z.number(),total_pages:z.number()})],
  ["/tours/523", tourSchema],
  ["/tours/523/reviews?page=1", reviewPageSchema],
  ["/latest-reviews?limit=3", latestReviewsSchema],
] as const;
const results = await Promise.all(checks.map(async ([path, schema]) => {
  try {
    const response = await fetch(`${base}${path}`, { headers: { Accept: "application/json", "Cache-Control": "no-cache" }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) return { endpoint: path, ok: false, status: response.status };
    const parsed = schema.safeParse(await response.json());
    return { endpoint: path, ok: parsed.success, status: response.status, ...(parsed.success ? {} : { missingOrInvalid: parsed.error.issues.map(issue => issue.path.join(".")) }) };
  } catch { return { endpoint: path, ok: false, error: "Network request failed" }; }
}));
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), base, results }, null, 2));
if (results.some(result => !result.ok)) process.exitCode = 1;
