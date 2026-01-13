import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer

# 1. Load Data
df = pd.read_csv('books_data.csv')
model = SentenceTransformer('all-MiniLM-L6-v2')

# 2. Generate Vectors
print("⏳ Generating AI Vectors (384 dimensions)...")
vectors = model.encode(df['plot'].tolist(), show_progress_bar=True)

# 3. Save as Binary (for C++ Speed)
# .astype('float32') is crucial because C++ 'float' is 32-bit
vectors.astype('float32').tofile('vectors.bin')

# 4. Save Metadata for B-Tree (SQLite)
# We will use this to populate our SQL database
df[['id', 'title']].to_csv('metadata_short.csv', index=False)

print("✅ vectors.bin and metadata_short.csv are ready for C++!")