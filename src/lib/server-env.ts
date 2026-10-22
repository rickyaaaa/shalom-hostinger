// Hosting panels and CRLF .env imports can append whitespace or "\r" to values.
// Trim before validation so a strict format check never fails on invisible characters.
export function serverEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}
