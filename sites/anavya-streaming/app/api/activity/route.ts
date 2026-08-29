import { getD1 } from "../../../db/d1";
import { getReaderId } from "../../../db/reader";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { bookId?: number; action?: "like" | "view" };
    if (!Number.isInteger(body.bookId) || !["like", "view"].includes(body.action ?? "")) {
      return Response.json({ error: "A valid bookId and action are required." }, { status: 400 });
    }

    const db = getD1();
    const readerId = await getReaderId(request);
    if (body.action === "like") {
      const existing = await db
        .prepare("SELECT id FROM interactions WHERE reader_id = ? AND book_id = ? AND action = 'like'")
        .bind(readerId, body.bookId)
        .first();
      if (existing) {
        await db.prepare("DELETE FROM interactions WHERE reader_id = ? AND book_id = ? AND action = 'like'")
          .bind(readerId, body.bookId).run();
        return Response.json({ liked: false });
      }
    }

    await db.prepare(
      "INSERT OR IGNORE INTO interactions (reader_id, book_id, action) VALUES (?, ?, ?)"
    ).bind(readerId, body.bookId, body.action).run();
    return Response.json({ liked: body.action === "like" });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not save activity." }, { status: 500 });
  }
}
