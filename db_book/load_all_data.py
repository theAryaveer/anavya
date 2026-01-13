import pandas as pd
from sentence_transformers import SentenceTransformer
import sqlite3
import struct
import os

def start_pipeline():
    if not os.path.exists('books_data.csv') or not os.path.exists('ratings.csv'):
        print("❌ Error: Files missing!")
        return

    print("🔄 Loading AI Model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')

    print("📊 Calculating average ratings...")
    ratings = pd.read_csv('ratings.csv')
    avg_ratings = ratings.groupby('book_id')['rating'].mean().reset_index()
    
    books = pd.read_csv('books_data.csv')
    final_df = pd.merge(books, avg_ratings, left_on='id', right_on='book_id', how='left')
    final_df['rating'] = final_df['rating'].fillna(0)

    # Database connection
    conn = sqlite3.connect('library_system.db')
    cursor = conn.cursor()

    # Table creation logic inside Python (Backup)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS books (
            book_id INTEGER PRIMARY KEY, 
            title TEXT, 
            avg_rating REAL DEFAULT 0, 
            is_indexed INTEGER DEFAULT 0
        );
    """)

    print(f"📚 Syncing {len(final_df)} books...")

    with open('vectors.bin', 'wb') as f_bin:
        for idx, row in final_df.iterrows():
            # Vectorize
            text = str(row['plot']) if pd.notnull(row['plot']) else str(row['title'])
            vector = model.encode(text).astype('float32')

            # Binary Write
            f_bin.write(struct.pack('i', int(row['id'])))
            f_bin.write(vector.tobytes())

            # SQL Write (Correct Columns)
            cursor.execute("""
                INSERT OR REPLACE INTO books (book_id, title, avg_rating, is_indexed) 
                VALUES (?, ?, ?, 1)
            """, (int(row['id']), row['title'], float(row['rating'])))

            if (idx + 1) % 1000 == 0:
                print(f"✅ {idx + 1} items processed...")

    conn.commit()
    conn.close()
    print("🚀 Done! DB and vectors.bin are perfectly synced.")

if __name__ == "__main__":
    start_pipeline()