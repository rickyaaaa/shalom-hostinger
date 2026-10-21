import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { wordpressEnvironment } from "../scripts/wordpress-environment";

const configuration = (site = "https://cms.future.example") => ({
  WORDPRESS_SITE_URL: site,
  WORDPRESS_API_URL: site + "/wp-json/shalom/v1",
});

test("backend hostname changes require environment values only", () => {
  for (const host of ["https://cms.future.example", "https://different-backend.example:8443", "http://127.0.0.1:8793"]) {
    assert.deepEqual(wordpressEnvironment(configuration(host)), {site: host, api: host + "/wp-json/shalom/v1"});
  }
  assert.deepEqual(wordpressEnvironment({WORDPRESS_SITE_URL:"https://cms.future.example/",WORDPRESS_API_URL:"https://cms.future.example/wp-json/shalom/v1/"}), {site:"https://cms.future.example",api:"https://cms.future.example/wp-json/shalom/v1"});
});

test("missing backend configuration fails instead of using a temporary-domain fallback", () => {
  assert.throws(() => wordpressEnvironment({}), /WORDPRESS_SITE_URL/);
  assert.throws(() => wordpressEnvironment({WORDPRESS_SITE_URL:configuration().WORDPRESS_SITE_URL}), /WORDPRESS_API_URL/);
});

test("backend configuration rejects unsafe origins, mismatched hosts and incorrect REST paths", () => {
  for (const overrides of [
    {WORDPRESS_SITE_URL:"http://cms.future.example"},
    {WORDPRESS_SITE_URL:"https://cms.future.example/wordpress"},
    {WORDPRESS_API_URL:"https://other.example/wp-json/shalom/v1"},
    {WORDPRESS_API_URL:"https://cms.future.example/wp-json/wp/v2"},
    {WORDPRESS_API_URL:"https://user:private@cms.future.example/wp-json/shalom/v1"},
    {WORDPRESS_API_URL:"https://cms.future.example/wp-json/shalom/v1?token=private"},
    {WORDPRESS_API_URL:"https://cms.future.example/wp-json/shalom/v1#fragment"},
  ]) assert.throws(() => wordpressEnvironment({...configuration(), ...overrides}));
  const secret = "should-never-appear-in-a-config-error";
  assert.throws(() => wordpressEnvironment({...configuration(),WORDPRESS_SITE_URL:secret}), error => error instanceof Error && !error.message.includes(secret));
});

test("backend configuration cannot be placed in the browser environment namespace", () => {
  assert.throws(() => wordpressEnvironment({...configuration(), NEXT_PUBLIC_WORDPRESS_SITE_URL:configuration().WORDPRESS_SITE_URL}), /server-only/);
});

test("Next image allowlist follows a new backend environment without embedding backend variables in Next env", () => {
  const code = 'import config from "./next.config.ts"; process.stdout.write(JSON.stringify({images:config.images,env:config.env}));';
  const result = spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "-e", code], {
    cwd:process.cwd(), encoding:"utf8", env:{...process.env,...configuration(),VERCEL_ENV:"",NODE_ENV:"production"},
  });
  assert.equal(result.status, 0, "Next config loads with an arbitrary future backend origin");
  const config = JSON.parse(result.stdout);
  assert.deepEqual(config.images.remotePatterns, [{protocol:"https",hostname:"cms.future.example",port:"",pathname:"/wp-content/uploads/**",search:""}]);
  assert.equal(config.env, undefined);
});
