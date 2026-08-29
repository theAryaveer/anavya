"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen, Check, ChevronRight, CircleUserRound, GitBranch, Heart,
  Info, LoaderCircle, Plus, Search, Server, Sparkles, Star, X,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type Book = {
  id: number;
  title: string;
  authors: string;
  genre: string;
  description: string;
  rating: number;
  ratings_count: number;
  color: string;
  liked: boolean;
  match: number;
  reason: string;
};

type ApiResponse = {
  books: Book[];
  taste: { name: string; count: number }[];
  likedCount: number;
  engine: string;
  error?: string;
};

const coverIsbn: Record<number, string> = {
  1: "9780547928227", 2: "9780141439518", 3: "9780451524935",
  4: "9780375842207", 5: "9780062315007", 6: "9781250301697",
  7: "9780441172719", 8: "9780525559474", 9: "9780735211292",
  10: "9780062316097", 11: "9780756404741", 12: "9780307588371",
  13: "9780593135204", 14: "9780399590504", 15: "9781476738024",
  16: "9780062073488", 17: "9781501161933", 18: "9780857197689",
};

function coverFor(book: Book) {
  const isbn = coverIsbn[book.id];
  return isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : "";
}

function compact(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function BookTile({ book, onOpen, onLike, saving }: {
  book: Book;
  onOpen: (book: Book) => void;
  onLike: (book: Book) => void;
  saving: boolean;
}) {
  const cover = coverFor(book);
  return (
    <article className="stream-tile">
      <button className="tile-art" type="button" onClick={() => onOpen(book)} aria-label={`View ${book.title}`}>
        {cover ? <img src={cover} alt={`${book.title} cover`} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : null}
        <span className="tile-fallback" style={{ background: book.color }}><BookOpen size={26} />{book.title}</span>
        <span className="match-badge">{book.match}% match</span>
        <span className="tile-shade" />
      </button>
      <div className="tile-meta">
        <div>
          <h3>{book.title}</h3>
          <p>{book.authors}</p>
        </div>
        <button
          className={book.liked ? "round-action active" : "round-action"}
          type="button"
          onClick={() => onLike(book)}
          disabled={saving}
          aria-label={book.liked ? `Remove ${book.title} from My List` : `Add ${book.title} to My List`}
        >
          {saving ? <LoaderCircle className="spin" size={16} /> : book.liked ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>
      <div className="tile-tags"><span>{book.rating.toFixed(1)} ★</span><span>{book.genre}</span></div>
    </article>
  );
}

function BookRail({ title, subtitle, books, onOpen, onLike, savingId, id }: {
  title: string;
  subtitle?: string;
  books: Book[];
  onOpen: (book: Book) => void;
  onLike: (book: Book) => void;
  savingId: number | null;
  id?: string;
}) {
  if (!books.length) return null;
  return (
    <section className="rail-section" id={id}>
      <div className="rail-heading">
        <div><h2>{title}</h2>{subtitle ? <p>{subtitle}</p> : null}</div>
        <span>Explore all <ChevronRight size={15} /></span>
      </div>
      <div className="book-rail">
        {books.map((book) => (
          <BookTile key={book.id} book={book} onOpen={onOpen} onLike={onLike} saving={savingId === book.id} />
        ))}
      </div>
    </section>
  );
}

export default function BookApp() {
  const [books, setBooks] = useState<Book[]>([]);
  const [taste, setTaste] = useState<ApiResponse["taste"]>([]);
  const [likedCount, setLikedCount] = useState(0);
  const [engine, setEngine] = useState("quality-ranking");
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Book | null>(null);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/recommendations?q=${encodeURIComponent(activeQuery)}&genre=All`, { cache: "no-store" });
      const data = await response.json() as ApiResponse;
      if (!response.ok) throw new Error(data.error || "Recommendation service unavailable.");
      setBooks(data.books);
      setTaste(data.taste);
      setLikedCount(data.likedCount);
      setEngine(data.engine);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load your books.");
    } finally {
      setLoading(false);
    }
  }, [activeQuery]);

  useEffect(() => { void loadBooks(); }, [loadBooks]);

  const featured = books.find((book) => book.id === 13) ?? books[0];
  const trending = useMemo(() => [...books].sort((a, b) => b.ratings_count - a.ratings_count).slice(0, 10), [books]);
  const myList = useMemo(() => books.filter((book) => book.liked), [books]);
  const fantasy = useMemo(() => books.filter((book) => ["Fantasy", "Science Fiction", "Dystopian"].includes(book.genre)), [books]);
  const suspense = useMemo(() => books.filter((book) => ["Mystery", "Thriller"].includes(book.genre)), [books]);
  const ideas = useMemo(() => books.filter((book) => ["Nonfiction", "Self Growth", "Memoir"].includes(book.genre)), [books]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setActiveQuery(query.trim());
  }

  async function toggleLike(book: Book) {
    setSavingId(book.id);
    try {
      const response = await fetch("/api/activity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookId: book.id, action: "like" }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not update My List.");
      await loadBooks();
      setSelected((current) => current?.id === book.id ? { ...current, liked: !current.liked } : current);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update My List.");
    } finally {
      setSavingId(null);
    }
  }

  function openBook(book: Book) {
    setSelected(book);
    void fetch("/api/activity", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookId: book.id, action: "view" }),
    });
  }

  return (
    <main className="stream-app">
      <header className="stream-header">
        <a className="stream-brand" href="/" aria-label="Anavya home"><BookOpen size={23} /><strong>ANAVYA</strong></a>
        <nav>
          <a href="#home">Home</a>
          <a href="#my-list">My List</a>
          <a href="#discover">Browse</a>
        </nav>
        <form className="header-search" onSubmit={submitSearch}>
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Titles, authors, moods" aria-label="Search books" />
          {query ? <button type="button" onClick={() => { setQuery(""); setActiveQuery(""); }} aria-label="Clear search"><X size={15} /></button> : null}
        </form>
        <a className="admin-link" href="/admin"><CircleUserRound size={21} /><span>Admin</span></a>
      </header>

      <section className="cinematic-hero" id="home">
        <img className="hero-backdrop" src="/anavya-hero.png" alt="" />
        <div className="hero-vignette" />
        <div className="hero-content">
          <p className="hero-kicker"><Sparkles size={14} /> Featured for you</p>
          <h1>{featured?.title ?? "Stories that find you."}</h1>
          <p className="hero-author">{featured?.authors ?? "Anavya recommendations"}</p>
          <div className="hero-stats">
            <span className="green">{featured?.match ?? 96}% match</span>
            <span><Star size={13} fill="currentColor" /> {featured?.rating.toFixed(2) ?? "4.5"}</span>
            <span>{featured?.genre ?? "Personalized"}</span>
          </div>
          <p className="hero-description">{featured?.description ?? "A personalized library powered by your searches, likes and reading interests."}</p>
          <div className="hero-actions">
            <button className="primary-action" type="button" onClick={() => featured && openBook(featured)}><Info size={19} /> More info</button>
            <button className="secondary-action" type="button" onClick={() => featured && void toggleLike(featured)}>
              {featured?.liked ? <Check size={19} /> : <Plus size={19} />} {featured?.liked ? "In My List" : "My List"}
            </button>
          </div>
          <div className="engine-line"><Server size={13} /><span>Live {engine.replaceAll("-", " ")} · {likedCount} saved · {taste[0]?.name ?? "learning your taste"}</span></div>
        </div>
      </section>

      <div className="content-stage" id="discover">
        {error ? <div className="stream-error"><strong>Backend error:</strong> {error}<button type="button" onClick={() => void loadBooks()}>Retry</button></div> : null}
        {loading ? (
          <div className="loading-stage"><LoaderCircle className="spin" size={30} /><span>Building your shelves…</span></div>
        ) : activeQuery ? (
          <>
            <div className="search-result-title"><p>Search results for</p><h2>“{activeQuery}”</h2></div>
            <BookRail title="Best matches" subtitle="Ranked by search meaning, taste and reader quality" books={books} onOpen={openBook} onLike={(book) => void toggleLike(book)} savingId={savingId} />
          </>
        ) : (
          <>
            <BookRail title="Top picks for you" subtitle="Your personal ranking updates after every like" books={books.slice(0, 10)} onOpen={openBook} onLike={(book) => void toggleLike(book)} savingId={savingId} />
            <BookRail title="My List" subtitle={myList.length ? "Books you saved across sessions" : "Add books to build your personal shelf"} books={myList} onOpen={openBook} onLike={(book) => void toggleLike(book)} savingId={savingId} id="my-list" />
            <BookRail title="Trending now" books={trending} onOpen={openBook} onLike={(book) => void toggleLike(book)} savingId={savingId} />
            <BookRail title="Epic worlds & future visions" books={fantasy} onOpen={openBook} onLike={(book) => void toggleLike(book)} savingId={savingId} />
            <BookRail title="Mysteries worth staying up for" books={suspense} onOpen={openBook} onLike={(book) => void toggleLike(book)} savingId={savingId} />
            <BookRail title="Ideas that stay with you" books={ideas} onOpen={openBook} onLike={(book) => void toggleLike(book)} savingId={savingId} />
          </>
        )}
      </div>

      <footer className="stream-footer">
        <div><span className="stream-brand mini"><BookOpen size={18} /><strong>ANAVYA</strong></span><p>AI-powered book discovery by Aryaveer Sharma.</p></div>
        <div><a href="/admin">Backend console</a><a href="https://github.com/theAryaveer/anavya" target="_blank" rel="noreferrer"><GitBranch size={14} /> GitHub source</a></div>
      </footer>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="book-dialog" showCloseButton>
          {selected ? (
            <div className="dialog-layout">
              <div className="dialog-cover" style={{ background: selected.color }}>
                {coverFor(selected) ? <img src={coverFor(selected)} alt={`${selected.title} cover`} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <BookOpen size={42} />}
              </div>
              <div className="dialog-copy">
                <DialogHeader>
                  <p className="dialog-eyebrow">{selected.genre} · {selected.match}% match</p>
                  <DialogTitle>{selected.title}</DialogTitle>
                  <DialogDescription>{selected.authors}</DialogDescription>
                </DialogHeader>
                <div className="dialog-stats"><span><Star size={14} fill="currentColor" /> {selected.rating.toFixed(2)}</span><span>{compact(selected.ratings_count)} ratings</span></div>
                <p className="dialog-description">{selected.description}</p>
                <p className="why-line"><Sparkles size={14} /> Why Anavya picked it: {selected.reason}</p>
                <button className={selected.liked ? "dialog-list active" : "dialog-list"} type="button" onClick={() => void toggleLike(selected)}>
                  {selected.liked ? <Check size={18} /> : <Plus size={18} />} {selected.liked ? "Saved to My List" : "Add to My List"}
                </button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}
