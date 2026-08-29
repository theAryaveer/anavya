import { getD1 } from "../../../../db/d1";
import { requireSiteUser } from "../../../../db/reader";

export async function GET(request: Request) {
  const denied = requireSiteUser(request);
  if (denied) return denied;
  const rows = await getD1().prepare(
    "SELECT id, title, authors, genre, rating, ratings_count, color, created_at FROM books ORDER BY id DESC LIMIT 100"
  ).all();
  return Response.json({ books: rows.results });
}

export async function POST(request: Request) {
  const denied = requireSiteUser(request);
  if (denied) return denied;
  try {
    const body = await request.json() as Record<string, unknown>;
    const title = String(body.title ?? "").trim();
    const authors = String(body.authors ?? "").trim();
    const genre = String(body.genre ?? "").trim();
    const description = String(body.description ?? "").trim();
    const keywords = String(body.keywords ?? "").trim();
    const rating = Number(body.rating ?? 4);
    const ratingsCount = Number(body.ratingsCount ?? 0);
    const color = String(body.color ?? "#344a40");
    if (!title || !authors || !genre || !description) {
      return Response.json({ error: "Title, author, genre and description are required." }, { status: 400 });
    }
    const db = getD1();
    const next = await db.prepare("SELECT COALESCE(MAX(id), 0) + 1 AS id FROM books").first<{ id: number }>();
    await db.prepare(
      "INSERT INTO books (id, title, authors, genre, description, keywords, rating, ratings_count, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(next?.id ?? Date.now(), title, authors, genre, description, keywords, rating, ratingsCount, color).run();
    return Response.json({ created: true, id: next?.id }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not add book." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = requireSiteUser(request);
  if (denied) return denied;
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return Response.json({ error: "Valid id required." }, { status: 400 });
    const db = getD1();
    await db.batch([
      db.prepare("DELETE FROM interactions WHERE book_id = ?").bind(id),
      db.prepare("DELETE FROM books WHERE id = ?").bind(id),
    ]);
    return Response.json({ deleted: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not delete book." }, { status: 500 });
  }
}
