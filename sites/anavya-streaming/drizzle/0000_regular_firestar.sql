CREATE TABLE `books` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`authors` text NOT NULL,
	`genre` text NOT NULL,
	`description` text NOT NULL,
	`keywords` text NOT NULL,
	`rating` real NOT NULL,
	`ratings_count` integer NOT NULL,
	`color` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `books_genre_idx` ON `books` (`genre`);--> statement-breakpoint
CREATE TABLE `interactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reader_id` text NOT NULL,
	`book_id` integer NOT NULL,
	`action` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `interactions_reader_book_action_idx` ON `interactions` (`reader_id`,`book_id`,`action`);--> statement-breakpoint
CREATE INDEX `interactions_reader_idx` ON `interactions` (`reader_id`);