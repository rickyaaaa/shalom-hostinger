import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { z } from "zod";
import { serverEnv } from "./server-env";

const sessionSchema = z.object({ cookie: z.string().regex(/^wordpress_logged_in_[a-f0-9]+=[^;\r\n]+$/), nonce: z.string().min(1).max(100), expires: z.number().int() }).strict();
export type CustomerSession = z.infer<typeof sessionSchema>;

function key() {
  const value = serverEnv("SESSION_ENCRYPTION_KEY");
  if (!value || !/^[a-f0-9]{64}$/i.test(value)) throw new Error("Set SESSION_ENCRYPTION_KEY to 32 random bytes encoded as hex.");
  return Buffer.from(value, "hex");
}
export function sealSession(session: CustomerSession): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(Buffer.from("shalom-customer-session-v1"));
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(sessionSchema.parse(session))), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}
export function openSession(value: string): CustomerSession | null {
  if (value.length > 3800) return null;
  try {
    const bytes = Buffer.from(value, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key(), bytes.subarray(0, 12));
    decipher.setAAD(Buffer.from("shalom-customer-session-v1"));
    decipher.setAuthTag(bytes.subarray(12, 28));
    const session = sessionSchema.parse(JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString()));
    return session.expires > Date.now() ? session : null;
  } catch { return null; }
}
