import sqlite3
import pandas as pd

BASE_PATH = r"C:\Users\HP\Desktop\db_book"
DB_PATH = f"{BASE_PATH}\\library_system.db"
CSV_PATH = "final_mapping.csv"  # Your CSV with book_name, author_name

# Step 1: Add author_name column to existing books table
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Check if column already exists
cursor.execute("PRAGMA table_info(books)")
columns = [col[1] for col in cursor.fetchall()]

if 'author_name' not in columns:
    print("📝 Adding author_name column to books table...")
    cursor.execute("ALTER TABLE books ADD COLUMN author_name TEXT DEFAULT 'Unknown'")
    conn.commit()
    print("✅ Column added successfully!")
else:
    print("⚠️ author_name column already exists, skipping...")

# Step 2: Load author data from CSV
print("\n📖 Loading author data from CSV...")
df = pd.read_csv(CSV_PATH)

# Clean data
df['book_name'] = df['book_name'].str.strip()
df['author_name'] = df['author_name'].str.strip()

print(f"✅ Loaded {len(df)} book-author mappings")

# Step 3: Update books table with author names
updated_count = 0
not_found_count = 0

for _, row in df.iterrows():
    book_name = row['book_name']
    author_name = row['author_name']
    
    # Find matching book by title
    cursor.execute("SELECT book_id FROM books WHERE title = ?", (book_name,))
    result = cursor.fetchone()
    
    if result:
        book_id = result[0]
        cursor.execute("UPDATE books SET author_name = ? WHERE book_id = ?", 
                      (author_name, book_id))
        updated_count += 1
        
        if updated_count % 100 == 0:
            print(f"  Updated {updated_count} books...")
    else:
        not_found_count += 1

conn.commit()
conn.close()

print(f"\n✅ Migration Complete!")
print(f"   📚 Updated: {updated_count} books")
print(f"   ⚠️ Not found in DB: {not_found_count} books")