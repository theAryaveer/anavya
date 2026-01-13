import pandas as pd
from sentence_transformers import SentenceTransformer
import numpy as np
import struct
import os

def generate_vectors():
    # 1. AI Model Load karo (Size: ~80MB)
    print("🔄 Loading AI Model (all-MiniLM-L6-v2)...")
    model = SentenceTransformer('all-MiniLM-L6-v2')

    # 2. CSV Load karo
    csv_file = 'books_data.csv'
    if not os.path.exists(csv_file):
        print(f"❌ Error: {csv_file} nahi mili! Pehle CSV file folder me rakho.")
        return

    df = pd.read_csv(csv_file)
    print(f"📚 {len(df)} books ka data mila. Processing shuru...")

    # 3. Binary file mein save karo (Fast loading ke liye)
    with open('vectors.bin', 'wb') as f:
        for index, row in df.iterrows():
            # Plot column ko vector me badlo
            # Plot empty ho toh handle karo
            plot_text = str(row['plot']) if pd.notnull(row['plot']) else ""
            vector = model.encode(plot_text).astype('float32')
            
            # Format: [ID (int: 4 bytes)] + [384 Floats (384*4 bytes)]
            book_id = int(row['id'])
            f.write(struct.pack('i', book_id)) # ID pack karo
            f.write(vector.tobytes())          # Vector bytes pack karo
            
            if (index + 1) % 500 == 0:
                print(f"✅ {index + 1} books processed...")

    print("\n🚀 Done! 'vectors.bin' tayyar hai.")

if __name__ == "__main__":
    generate_vectors()