import "server-only";
import { wordpressEnvironment } from "../../scripts/wordpress-environment";

export function wordpressConfig() {
  return wordpressEnvironment(process.env);
}
