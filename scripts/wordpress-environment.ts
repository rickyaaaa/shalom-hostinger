// Shared by the Node build config and server-only adapter. Never import into client code.
type Environment = Readonly<Record<string, string | undefined>>;

export function wordpressEnvironment(env: Environment) {
  if (Object.keys(env).some(name => name.startsWith("NEXT_PUBLIC_WORDPRESS_"))) {
    throw new Error("WordPress configuration must use server-only WORDPRESS_ variables.");
  }
  function configuredUrl(name: string) {
    const value = env[name];
    if (!value) throw new Error("Set " + name + " in the server environment before starting Shalom Next.");
    let url: URL;
    try { url = new URL(value); }
    catch { throw new Error(name + " must be a valid base URL."); }
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash) {
      throw new Error(name + " must not contain credentials, query parameters or a fragment.");
    }
    if (url.protocol !== "https:" && !(local && url.protocol === "http:")) {
      throw new Error(name + " must use HTTPS (HTTP is allowed for localhost development).");
    }
    return url;
  }
  const site = configuredUrl("WORDPRESS_SITE_URL");
  const api = configuredUrl("WORDPRESS_API_URL");
  if (site.pathname !== "/") throw new Error("WORDPRESS_SITE_URL must be an origin without a subpath.");
  if (api.origin !== site.origin || api.pathname.replace(/\/$/, "") !== "/wp-json/shalom/v1") {
    throw new Error("WORDPRESS_API_URL must use the WordPress origin and /wp-json/shalom/v1 path.");
  }
  return { site: site.origin, api: api.toString().replace(/\/$/, "") };
}
