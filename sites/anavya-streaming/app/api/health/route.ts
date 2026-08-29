import { getD1 } from "../../../db/d1";

export async function GET() {
  try {
    const row = await getD1().prepare("SELECT COUNT(*) AS count FROM books").first<{ count: number }>();
    return Response.json({ status: "ok", service: "anavya-recommendation-api", books: row?.count ?? 0 });
  } catch (error) {
    return Response.json({ status: "error", message: error instanceof Error ? error.message : "Backend unavailable" }, { status: 500 });
  }
}
