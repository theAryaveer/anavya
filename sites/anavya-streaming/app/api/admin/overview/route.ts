import { getD1 } from "../../../../db/d1";
import { requireSiteUser } from "../../../../db/reader";

export async function GET(request: Request) {
  const denied = requireSiteUser(request);
  if (denied) return denied;

  try {
    const db = getD1();
    const [books, interactions, readers, recent] = await db.batch([
      db.prepare("SELECT COUNT(*) AS count FROM books"),
      db.prepare("SELECT COUNT(*) AS count FROM interactions"),
      db.prepare("SELECT COUNT(DISTINCT reader_id) AS count FROM interactions"),
      db.prepare("SELECT i.id, i.action, i.created_at, b.title, b.authors FROM interactions i JOIN books b ON b.id = i.book_id ORDER BY i.id DESC LIMIT 12"),
    ]);

    return Response.json({
      stats: {
        books: Number((books.results[0] as { count?: number })?.count ?? 0),
        interactions: Number((interactions.results[0] as { count?: number })?.count ?? 0),
        readers: Number((readers.results[0] as { count?: number })?.count ?? 0),
        status: "healthy",
      },
      recent: recent.results,
      database: {
        engine: "Cloudflare D1 / SQLite",
        binding: "DB",
        region: "Managed by Sites",
        tables: [
          { name: "books", purpose: "Book catalogue and ranking metadata", fields: "id, title, authors, genre, description, keywords, rating, ratings_count, color, created_at" },
          { name: "interactions", purpose: "Per-reader likes and views", fields: "id, reader_id, book_id, action, created_at" },
        ],
      },
      endpoints: [
        { method: "GET", path: "/api/recommendations", purpose: "Search and personalized ranking", access: "User" },
        { method: "POST", path: "/api/activity", purpose: "Toggle likes and record views", access: "User" },
        { method: "GET", path: "/api/health", purpose: "Backend health check", access: "User" },
        { method: "GET/POST/DELETE", path: "/api/admin/books", purpose: "Manage catalogue records", access: "Owner" },
        { method: "GET", path: "/api/admin/export", purpose: "Download database backup", access: "Owner" },
      ],
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Admin overview failed." }, { status: 500 });
  }
}
