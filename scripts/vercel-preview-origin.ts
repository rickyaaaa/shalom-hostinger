// Only platform configuration is trusted here; never request Host/forwarded headers.
export function vercelPreviewOrigins(env: Record<string, string | undefined>) {
  if (env.VERCEL !== "1" || env.VERCEL_ENV !== "preview" || env.VERCEL_PROJECT_ID !== "prj_itkVxGhG7b69Zh3qMQUJh7juh5D1") throw new Error("This build configuration is restricted to the isolated Shalom Vercel Preview project.");
  const host = env.VERCEL_URL || "";
  if (!/^shalom-nextjs-preview-[a-z0-9-]+\.vercel\.app$/.test(host) || host.split(".")[0].length > 63) throw new Error("Vercel must supply the actual Shalom deployment hostname.");
  const origin = "https://" + host;
  return { APP_URL: origin, PUBLIC_SITE_URL: origin };
}
