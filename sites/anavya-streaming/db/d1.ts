import { env } from "cloudflare:workers";

export function getD1(): D1Database {
  if (!env.DB) {
    throw new Error("The recommendation database is not available.");
  }
  return env.DB;
}
