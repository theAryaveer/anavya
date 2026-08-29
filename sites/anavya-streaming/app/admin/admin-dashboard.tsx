"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  Activity, ArrowLeft, BookOpen, CheckCircle2, Code2, Database,
  Download, LoaderCircle, Plus, Server, Trash2, Users,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Overview = {
  stats: { books: number; interactions: number; readers: number; status: string };
  recent: { id: number; action: string; created_at: string; title: string; authors: string }[];
  database: {
    engine: string; binding: string; region: string;
    tables: { name: string; purpose: string; fields: string }[];
  };
  endpoints: { method: string; path: string; purpose: string; access: string }[];
};

type AdminBook = {
  id: number; title: string; authors: string; genre: string;
  rating: number; ratings_count: number; color: string; created_at: string;
};

const emptyForm = {
  title: "", authors: "", genre: "", description: "", keywords: "",
  rating: "4.0", ratingsCount: "0", color: "#345f50",
};

export default function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingBook, setDeletingBook] = useState<AdminBook | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [overviewResponse, booksResponse] = await Promise.all([
        fetch("/api/admin/overview", { cache: "no-store" }),
        fetch("/api/admin/books", { cache: "no-store" }),
      ]);
      const overviewData = await overviewResponse.json();
      const booksData = await booksResponse.json();
      if (!overviewResponse.ok) throw new Error(overviewData.error || "Could not load backend overview.");
      if (!booksResponse.ok) throw new Error(booksData.error || "Could not load books.");
      setOverview(overviewData);
      setBooks(booksData.books);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Admin data unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function addBook(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          rating: Number(form.rating),
          ratingsCount: Number(form.ratingsCount),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not add book.");
      setForm(emptyForm);
      setMessage("Book added to the live catalogue.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not add book.");
    } finally {
      setSaving(false);
    }
  }

  async function removeBook(book: AdminBook) {
    setError("");
    const response = await fetch(`/api/admin/books?id=${book.id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Could not delete book.");
      return;
    }
    setMessage("Book deleted.");
    setDeletingBook(null);
    await load();
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div><span className="admin-logo"><BookOpen size={20} /></span><strong>Anavya Console</strong><em>OWNER</em></div>
        <a href="/"><ArrowLeft size={16} /> Back to reader app</a>
      </header>

      <section className="admin-main">
        <div className="admin-title-row">
          <div><p>BACKEND & DATABASE</p><h1>Operations console</h1><span>Manage catalogue data, inspect usage and access the live API.</span></div>
          <div className="admin-actions">
            <a href="/api/health" target="_blank"><Server size={15} /> Health JSON</a>
            <a href="/api/admin/export"><Download size={15} /> Export database</a>
          </div>
        </div>

        {error ? <div className="admin-alert error">{error}</div> : null}
        {message ? <div className="admin-alert success"><CheckCircle2 size={16} />{message}</div> : null}

        {loading || !overview ? (
          <div className="admin-loading"><LoaderCircle className="spin" size={28} /> Loading backend…</div>
        ) : (
          <>
            <div className="stat-grid">
              <article><span><BookOpen size={18} /> Catalogue</span><strong>{overview.stats.books}</strong><small>books in database</small></article>
              <article><span><Activity size={18} /> Activity</span><strong>{overview.stats.interactions}</strong><small>saved interactions</small></article>
              <article><span><Users size={18} /> Readers</span><strong>{overview.stats.readers}</strong><small>personal taste profiles</small></article>
              <article><span><Server size={18} /> API status</span><strong className="healthy">LIVE</strong><small>all services operational</small></article>
            </div>

            <section className="admin-panel database-panel">
              <div className="panel-heading"><div><Database size={19} /><span><strong>Database details</strong><small>Managed persistent storage</small></span></div><em>{overview.database.engine}</em></div>
              <div className="db-summary">
                <div><span>Logical binding</span><code>{overview.database.binding}</code></div>
                <div><span>Runtime</span><strong>{overview.database.region}</strong></div>
                <div><span>Access model</span><strong>Server-side only</strong></div>
                <div><span>Backup</span><strong>JSON export enabled</strong></div>
              </div>
              <Table className="admin-table">
                <TableHeader><TableRow><TableHead>Table</TableHead><TableHead>Purpose</TableHead><TableHead>Columns</TableHead></TableRow></TableHeader>
                <TableBody>{overview.database.tables.map((table) => (
                  <TableRow key={table.name}><TableCell><code>{table.name}</code></TableCell><TableCell>{table.purpose}</TableCell><TableCell className="field-cell">{table.fields}</TableCell></TableRow>
                ))}</TableBody>
              </Table>
            </section>

            <div className="admin-two-col">
              <section className="admin-panel">
                <div className="panel-heading"><div><Code2 size={19} /><span><strong>API access</strong><small>Live production endpoints</small></span></div></div>
                <div className="endpoint-list">{overview.endpoints.map((endpoint) => (
                  <div className="endpoint" key={endpoint.path + endpoint.method}>
                    <span className={endpoint.method.includes("POST") ? "method write" : "method"}>{endpoint.method}</span>
                    <code>{endpoint.path}</code>
                    <p>{endpoint.purpose}</p>
                    <em>{endpoint.access}</em>
                  </div>
                ))}</div>
              </section>

              <section className="admin-panel">
                <div className="panel-heading"><div><Activity size={19} /><span><strong>Recent activity</strong><small>Latest database events</small></span></div></div>
                <div className="activity-list">{overview.recent.length ? overview.recent.map((item) => (
                  <div key={item.id}><span className="activity-icon">{item.action === "like" ? "♥" : "↗"}</span><div><strong>{item.title}</strong><small>{item.action} · {new Date(item.created_at).toLocaleString()}</small></div></div>
                )) : <p className="no-data">No reader activity yet.</p>}</div>
              </section>
            </div>

            <section className="admin-panel catalogue-panel">
              <div className="panel-heading"><div><BookOpen size={19} /><span><strong>Catalogue records</strong><small>Add or remove live recommendation data</small></span></div><em>{books.length} rows</em></div>
              <div className="catalogue-layout">
                <form className="add-book-form" onSubmit={addBook}>
                  <h3><Plus size={17} /> Add a book</h3>
                  <label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
                  <label>Author<input required value={form.authors} onChange={(e) => setForm({ ...form, authors: e.target.value })} /></label>
                  <div className="form-row"><label>Genre<input required value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} /></label><label>Keywords<input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} /></label></div>
                  <label>Description<textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
                  <div className="form-row"><label>Rating<input type="number" min="0" max="5" step=".01" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} /></label><label>Ratings count<input type="number" min="0" value={form.ratingsCount} onChange={(e) => setForm({ ...form, ratingsCount: e.target.value })} /></label></div>
                  <label>Cover colour<input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></label>
                  <button type="submit" disabled={saving}>{saving ? <LoaderCircle className="spin" size={16} /> : <Plus size={16} />} Add to database</button>
                </form>
                <div className="records-table">
                  <Table className="admin-table">
                    <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Book</TableHead><TableHead>Genre</TableHead><TableHead>Rating</TableHead><TableHead>Readers</TableHead><TableHead /></TableRow></TableHeader>
                    <TableBody>{books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell>{book.id}</TableCell>
                        <TableCell><strong>{book.title}</strong><small>{book.authors}</small></TableCell>
                        <TableCell>{book.genre}</TableCell>
                        <TableCell>{Number(book.rating).toFixed(2)}</TableCell>
                        <TableCell>{Number(book.ratings_count).toLocaleString()}</TableCell>
                        <TableCell><button className="delete-record" type="button" onClick={() => setDeletingBook(book)} aria-label={`Delete ${book.title}`}><Trash2 size={14} /></button></TableCell>
                      </TableRow>
                    ))}</TableBody>
                  </Table>
                </div>
              </div>
            </section>
          </>
        )}
      </section>

      <AlertDialog open={Boolean(deletingBook)} onOpenChange={(open) => { if (!open) setDeletingBook(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this book?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingBook ? `“${deletingBook.title}” and its saved reader interactions will be permanently removed.` : "This record will be removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => deletingBook && void removeBook(deletingBook)}>Delete book</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
