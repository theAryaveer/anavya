import { getD1 } from "../../../db/d1";
import { getReaderId } from "../../../db/reader";

type BookRow = {
  id: number;
  title: string;
  authors: string;
  genre: string;
  description: string;
  keywords: string;
  rating: number;
  ratings_count: number;
  color: string;
};

const catalog = [
  [1, "The Hobbit", "J. R. R. Tolkien", "Fantasy", "A quiet homebody is pulled into a daring journey across a dangerous, wondrous land.", "adventure dragon quest magic friendship journey", 4.28, 3900000, "#416b57"],
  [2, "Pride and Prejudice", "Jane Austen", "Classics", "Sharp observations, family pressure, and a slowly changing first impression shape this social classic.", "romance society family wit relationships england", 4.29, 4200000, "#b65e52"],
  [3, "1984", "George Orwell", "Dystopian", "A man questions truth and power inside a society built on surveillance and control.", "politics surveillance future rebellion power society", 4.19, 4700000, "#465563"],
  [4, "The Book Thief", "Markus Zusak", "Historical", "A young reader finds courage and connection through words during a time of war.", "war books family courage germany friendship", 4.39, 2600000, "#9b6b45"],
  [5, "The Alchemist", "Paulo Coelho", "Adventure", "A hopeful traveler follows a dream and discovers how purpose changes along the way.", "journey dream destiny desert philosophy inspiration", 3.91, 3300000, "#d0923c"],
  [6, "The Silent Patient", "Alex Michaelides", "Thriller", "A therapist becomes consumed by the mystery of a patient who refuses to explain her crime.", "psychological mystery crime secrets therapist suspense", 4.18, 2300000, "#754f5b"],
  [7, "Dune", "Frank Herbert", "Science Fiction", "Politics, ecology, and destiny collide on a desert planet at the center of an empire.", "space desert politics empire ecology prophecy", 4.28, 1500000, "#b4773d"],
  [8, "The Midnight Library", "Matt Haig", "Contemporary", "A magical library opens paths into the lives that might have been.", "choices life books hope magical reflective", 3.99, 2200000, "#344f72"],
  [9, "Atomic Habits", "James Clear", "Self Growth", "A practical framework for building better routines through small, repeatable changes.", "habits productivity behavior goals practical growth", 4.35, 1100000, "#4b6661"],
  [10, "Sapiens", "Yuval Noah Harari", "Nonfiction", "A wide-angle exploration of how human societies, beliefs, and systems developed.", "history humanity society evolution ideas civilization", 4.36, 1100000, "#8d6550"],
  [11, "The Name of the Wind", "Patrick Rothfuss", "Fantasy", "A gifted storyteller recounts a life shaped by music, magic, loss, and legend.", "magic music school legend adventure mystery", 4.52, 980000, "#783f3a"],
  [12, "Gone Girl", "Gillian Flynn", "Thriller", "A disappearance exposes a marriage built from performance, resentment, and competing stories.", "mystery marriage crime twist suspense psychological", 4.14, 3100000, "#5b5964"],
  [13, "Project Hail Mary", "Andy Weir", "Science Fiction", "A lone scientist wakes in deep space and must solve an urgent problem with unexpected help.", "space science survival friendship problem solving", 4.51, 820000, "#396b73"],
  [14, "Educated", "Tara Westover", "Memoir", "A determined learner remakes her world through education and difficult personal choices.", "education family resilience identity memoir learning", 4.46, 1600000, "#725a46"],
  [15, "A Man Called Ove", "Fredrik Backman", "Contemporary", "An isolated neighbor finds his carefully ordered life changed by an insistent community.", "community friendship grief humor heartwarming neighbors", 4.38, 1100000, "#4e6d6a"],
  [16, "And Then There Were None", "Agatha Christie", "Mystery", "Ten strangers on a remote island realize a hidden judge is among them.", "island murder crime puzzle suspense classic mystery", 4.28, 1400000, "#4d5155"],
  [17, "The Seven Husbands of Evelyn Hugo", "Taylor Jenkins Reid", "Historical", "A celebrated actor chooses an unknown writer to reveal the private story behind a public life.", "hollywood fame secrets relationships interview history", 4.42, 3300000, "#8d6744"],
  [18, "The Psychology of Money", "Morgan Housel", "Nonfiction", "Short lessons explore how behavior and emotion influence financial decisions.", "money behavior decisions finance psychology lessons", 4.31, 690000, "#4b6253"],
] as const;

async function ensureCatalog(db: D1Database) {
  const row = await db.prepare("SELECT COUNT(*) AS count FROM books").first<{ count: number }>();
  if ((row?.count ?? 0) > 0) return;

  const statement = "INSERT OR IGNORE INTO books (id, title, authors, genre, description, keywords, rating, ratings_count, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  await db.batch(catalog.map((book) => db.prepare(statement).bind(...book)));
}

function tokens(value: string) {
  return value.toLowerCase().match(/[a-z0-9]+/g)?.filter((token) => token.length > 2) ?? [];
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = (url.searchParams.get("q") ?? "").trim();
    const genre = (url.searchParams.get("genre") ?? "All").trim();
    const db = getD1();
    const readerId = await getReaderId(request);
    await ensureCatalog(db);

    const [bookResult, likeResult] = await Promise.all([
      db.prepare("SELECT id, title, authors, genre, description, keywords, rating, ratings_count, color FROM books").all<BookRow>(),
      db.prepare(
        "SELECT b.id, b.genre, b.keywords FROM interactions i JOIN books b ON b.id = i.book_id WHERE i.reader_id = ? AND i.action = 'like'"
      ).bind(readerId).all<{ id: number; genre: string; keywords: string }>(),
    ]);

    const liked = likeResult.results;
    const likedIds = new Set(liked.map((item) => item.id));
    const genreTaste = new Map<string, number>();
    const keywordTaste = new Map<string, number>();
    for (const item of liked) {
      genreTaste.set(item.genre, (genreTaste.get(item.genre) ?? 0) + 1);
      for (const word of tokens(item.keywords)) keywordTaste.set(word, (keywordTaste.get(word) ?? 0) + 1);
    }

    const queryTokens = new Set(tokens(query));
    const ranked = bookResult.results
      .filter((book) => genre === "All" || book.genre === genre)
      .map((book) => {
        const searchable = new Set(tokens(`${book.title} ${book.authors} ${book.genre} ${book.description} ${book.keywords}`));
        let textMatches = 0;
        queryTokens.forEach((word) => { if (searchable.has(word)) textMatches += 1; });
        const semantic = queryTokens.size ? textMatches / queryTokens.size : 0;
        const taste = (genreTaste.get(book.genre) ?? 0) * 0.18 +
          tokens(book.keywords).reduce((sum, word) => sum + Math.min(keywordTaste.get(word) ?? 0, 2) * 0.025, 0);
        const quality = (book.rating - 3.7) / 1.1;
        const popularity = Math.min(Math.log10(book.ratings_count + 1) / 7, 1);
        const score = queryTokens.size
          ? semantic * 0.68 + taste * 0.17 + quality * 0.1 + popularity * 0.05
          : taste * 0.52 + quality * 0.3 + popularity * 0.18;
        const reasons = [];
        if (queryTokens.size && textMatches) reasons.push(`matches ${textMatches} search signal${textMatches === 1 ? "" : "s"}`);
        if (genreTaste.has(book.genre)) reasons.push(`fits your ${book.genre.toLowerCase()} taste`);
        if (!reasons.length) reasons.push(book.rating >= 4.4 ? "exceptional reader rating" : "strong reader favorite");
        return {
          ...book,
          liked: likedIds.has(book.id),
          match: Math.max(67, Math.min(98, Math.round(72 + score * 24))),
          reason: reasons.slice(0, 2).join(" · "),
        };
      })
      .sort((a, b) => b.match - a.match || b.rating - a.rating)
      .slice(0, 30);

    const taste = [...genreTaste.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
    return Response.json({
      books: ranked,
      taste,
      likedCount: liked.length,
      query,
      engine: queryTokens.size ? "hybrid-search" : liked.length ? "personalized-ranking" : "quality-ranking",
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Recommendation service failed." }, { status: 500 });
  }
}
