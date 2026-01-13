import sqlite3

BASE_PATH = r"C:\Users\HP\Desktop\db_book"
DB_PATH = f"{BASE_PATH}\\library_system.db"

# Common book genres
genres = [
    "Fiction",
    "Non-Fiction", 
    "Fantasy",
    "Science Fiction",
    "Mystery",
    "Thriller",
    "Romance",
    "Horror",
    "Biography",
    "History",
    "Self-Help",
    "Poetry",
    "Young Adult",
    "Children",
    "Comics",
    "Philosophy",
    "Religion",
    "Travel",
    "Cooking",
    "Art"
]

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Create genres table if not exists
cursor.execute("""
    CREATE TABLE IF NOT EXISTS genres (
        genre_id INTEGER PRIMARY KEY AUTOINCREMENT,
        genre_name TEXT UNIQUE NOT NULL
    )
""")

# Insert genres
for genre in genres:
    cursor.execute(
        "INSERT OR IGNORE INTO genres (genre_name) VALUES (?)",
        (genre,)
    )

conn.commit()
print(f"✅ Inserted {len(genres)} genres into database")

# Verify
cursor.execute("SELECT * FROM genres")
rows = cursor.fetchall()
print(f"\n📚 Available Genres ({len(rows)}):")
for row in rows:
    print(f"  {row[0]}. {row[1]}")

conn.close()