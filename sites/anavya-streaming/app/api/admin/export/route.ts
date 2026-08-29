import { getD1 } from "../../../../db/d1";
import { requireSiteUser } from "../../../../db/reader";

export async function GET(request: Request) {
  const denied = requireSiteUser(request);
  if (denied) return denied;
  const db = getD1();
  const [books, interactions] = await db.batch([
    db.prepare("SELECT * FROM books ORDER BY id"),
    db.prepare("SELECT * FROM interactions ORDER BY id"),
  ]);
  return new Response(JSON.stringify({
    exportedAt: new Date().toISOString(),
    books: books.results,
    interactions: interactions.results,
  }, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": "attachment; filename=anavya-database-backup.json",
    },
  });
}
