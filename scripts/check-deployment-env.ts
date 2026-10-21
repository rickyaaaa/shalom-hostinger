// Configuration-only preflight. Never prints secret values or makes requests.
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd(),false);
const production=process.argv.includes("--production");
const https=process.argv.includes("--https")||production;
const failures:string[]=[];
function url(name:string,originOnly=false){
 try{const u=new URL(process.env[name]||"");const local=["localhost","127.0.0.1","[::1]"].includes(u.hostname);
 if(u.username||u.password||u.search||u.hash||(u.protocol!=="https:"&&!(local&&!https&&u.protocol==="http:"))||(originOnly&&u.pathname!=="/"))throw Error();
 if(https&&u.hostname.endsWith(".example"))throw Error();return u;
 }catch{failures.push(`${name}: set a valid ${https?"real HTTPS":"HTTPS or loopback HTTP"} ${originOnly?"origin":"URL"} without credentials/query/hash`);return null;}
}
const site=url("WORDPRESS_SITE_URL",true),api=url("WORDPRESS_API_URL"),app=url("APP_URL",true),canonical=url("PUBLIC_SITE_URL",true);
if(site&&api&&(site.origin!==api.origin||api.pathname!=="/wp-json/shalom/v1"))failures.push("WORDPRESS_API_URL must use the WordPress origin and /wp-json/shalom/v1 path");
if(app&&canonical&&app.origin!==canonical.origin)failures.push("APP_URL and PUBLIC_SITE_URL must match for this single-origin deployment");
const key=process.env.SESSION_ENCRYPTION_KEY||"";
if(!/^[a-f0-9]{64}$/i.test(key)||new Set(key.toLowerCase()).size<4)failures.push("SESSION_ENCRYPTION_KEY must be a private cryptographically random 32-byte hex key, not a placeholder");
if(!["true","false"].includes(process.env.ALLOW_INDEXING||""))failures.push("ALLOW_INDEXING must be explicitly true or false");
if(https&&!production&&process.env.ALLOW_INDEXING!=="false")failures.push("HTTPS PREVIEW must keep ALLOW_INDEXING=false; production indexing needs a separate approved release");
if(production&&process.env.ALLOW_INDEXING!=="true")failures.push("Approved production-cutover configuration must explicitly enable public indexing");
if(https&&process.env.NODE_ENV!=="production")failures.push("Hosted HTTPS configuration must set NODE_ENV=production");
if(Object.keys(process.env).some(name=>name.startsWith("NEXT_PUBLIC_")&&/SECRET|PASSWORD|PRIVATE|ENCRYPTION|TOKEN|SIGNING/i.test(name)))failures.push("Remove secret-like NEXT_PUBLIC_ variables from the browser namespace");
if(Object.keys(process.env).some(name=>name.startsWith("NEXT_PUBLIC_WORDPRESS_")))failures.push("Keep WordPress backend configuration in server-only WORDPRESS_ variables");
const headlessKey=process.env.SHALOM_HEADLESS_SIGNING_KEY||"";
if(https&&(process.env.HEADLESS_RATE_LIMIT_MODE!=="signed"||!/^[a-f0-9]{64}$/i.test(headlessKey)||new Set(headlessKey.toLowerCase()).size<4||headlessKey===key))failures.push("HTTPS requires signed headless rate identity and a separate private random SHALOM_HEADLESS_SIGNING_KEY configured identically on staging WordPress");
console.log(JSON.stringify({mode:production?"production-cutover-configuration":https?"https-preview":"local",passed:!failures.length,checks:["server origins","WordPress API origin/path","canonical origin","private session key format","explicit indexing policy","no secret-like NEXT_PUBLIC variables"],failures,notice:"Configuration validation is not deployment, TLS, email or authenticated business acceptance. Secret values are never printed."},null,2));
if(failures.length)process.exitCode=1;
