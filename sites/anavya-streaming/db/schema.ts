import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const books = sqliteTable("books", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  genre: text("genre").notNull(),
  description: text("description").notNull(),
  keywords: text("keywords").notNull(),
  rating: real("rating").notNull(),
  ratingsCount: integer("ratings_count").notNull(),
  color: text("color").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("books_genre_idx").on(table.genre),
]);

export const interactions = sqliteTable("interactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  readerId: text("reader_id").notNull(),
  bookId: integer("book_id").notNull().references(() => books.id),
  action: text("action").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("interactions_reader_book_action_idx").on(table.readerId, table.bookId, table.action),
  index("interactions_reader_idx").on(table.readerId),
]);
