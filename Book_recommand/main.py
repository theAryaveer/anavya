import pandas as pd
import numpy as np
import uvicorn
import sqlite3
import os
import struct
from fastapi import FastAPI, HTTPException
from sentence_transformers import SentenceTransformer
from sklearn.decomposition import TruncatedSVD
from sklearn.neighbors import NearestNeighbors
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext

# ========================================
# 1. PATH CONFIGURATION
# ========================================
BASE_PATH = r"C:\Users\HP\Desktop\db_book"
DB_PATH = os.path.join(BASE_PATH, "library_system.db")
VECTORS_BIN = os.path.join(BASE_PATH, "vectors.bin")

os.makedirs(BASE_PATH, exist_ok=True)

print(f"🗂️  BASE_PATH : {BASE_PATH}")
print(f"📁 VECTORS_BIN: {VECTORS_BIN}")
print(f"💾 DB_PATH    : {DB_PATH}")

# ========================================
# 2. INITIALIZE FASTAPI & MODEL
# ========================================
app = FastAPI()
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================================
# 3. PYDANTIC MODELS
# ========================================
class SignupRequest(BaseModel):
    name: str
    email: str
    genre_id: int
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ActivityRequest(BaseModel):
    user_id: int
    book_id: int
    action: str

# ========================================
# 4. SVD ENGINE CLASS
# ========================================
class SVDEngine:
    def __init__(self):
        self.user_item_matrix = None
        self.preds_matrix = None
        self.is_trained = False

    def train(self, ratings_df):
        try:
            print("⏳ Training SVD model...")
            top_users = ratings_df['user_id'].value_counts().head(2000).index
            ratings_small = ratings_df[ratings_df['user_id'].isin(top_users)]
            self.user_item_matrix = ratings_small.pivot(
                index='user_id', 
                columns='book_id', 
                values='rating'
            ).fillna(0)
            
            svd = TruncatedSVD(n_components=20, random_state=42)
            user_features = svd.fit_transform(self.user_item_matrix)
            self.preds_matrix = np.dot(user_features, svd.components_)
            
            self.is_trained = True
            print("✅ SVD Engine Ready!")
        except Exception as e:
            print(f"❌ SVD Training failed: {e}")

    def get_prediction(self, user_id, book_id):
        if not self.is_trained:
            return 0.0
        try:
            u_idx = self.user_item_matrix.index.get_loc(user_id)
            b_idx = self.user_item_matrix.columns.get_loc(book_id)
            return self.preds_matrix[u_idx, b_idx]
        except:
            return 0.0

svd_engine = SVDEngine()

# ========================================
# 5. PYTHON VECTOR SEARCH ENGINE
# ========================================
nn_index: NearestNeighbors | None = None
nn_book_ids: list[int] = []          # position → book_id mapping
nn_vectors: np.ndarray | None = None # (N, 384) float32


def load_vectors_into_index(vectors_bin_path: str):
    """Load vectors.bin (int id + float[384] per record) into sklearn NearestNeighbors."""
    global nn_index, nn_book_ids, nn_vectors

    if not os.path.exists(vectors_bin_path):
        print(f"⚠️  vectors.bin not found at {vectors_bin_path}")
        return

    record_size = 4 + 384 * 4          # int32 + 384 × float32
    book_ids = []
    vecs = []

    with open(vectors_bin_path, 'rb') as f:
        while True:
            chunk = f.read(record_size)
            if len(chunk) < record_size:
                break
            book_id = struct.unpack_from('i', chunk, 0)[0]
            vec = np.frombuffer(chunk, dtype=np.float32, count=384, offset=4)
            book_ids.append(book_id)
            vecs.append(vec.copy())

    if not vecs:
        print("⚠️  No vectors loaded.")
        return

    nn_book_ids = book_ids
    nn_vectors  = np.stack(vecs)           # (N, 384)

    nn_index = NearestNeighbors(n_neighbors=10, algorithm='ball_tree',
                                metric='euclidean', n_jobs=-1)
    nn_index.fit(nn_vectors)
    print(f"🚀 Python vector index ready — {len(nn_book_ids)} books indexed.")


def python_vector_search(query_text: str, k: int = 5) -> list[int]:
    """Encode query and return top-k book_ids via in-process kNN search."""
    if nn_index is None:
        print("❌ Vector index not loaded.")
        return []

    print(f"📡 Vectorising query: {query_text!r}")
    query_vec = embedding_model.encode(query_text).astype('float32').reshape(1, -1)

    n_neighbors = min(k, len(nn_book_ids))
    distances, indices = nn_index.kneighbors(query_vec, n_neighbors=n_neighbors)

    result_ids = [nn_book_ids[i] for i in indices[0]]
    print(f"✅ Found {len(result_ids)} results.")
    return result_ids



# ========================================
# 6. DATABASE INITIALIZATION
# ========================================
def initialize_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Genres table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS genres (
            genre_id INTEGER PRIMARY KEY AUTOINCREMENT,
            genre_name TEXT UNIQUE NOT NULL
        )
    """)
    
    # Seed genres if empty
    cursor.execute("SELECT COUNT(*) FROM genres")
    if cursor.fetchone()[0] == 0:
        genres = [
            "Fiction", "Non-Fiction", "Fantasy", "Science Fiction",
            "Mystery", "Thriller", "Romance", "Horror",
            "Biography", "History", "Self-Help", "Poetry",
            "Young Adult", "Children", "Comics", "Philosophy",
            "Religion", "Travel", "Cooking", "Art"
        ]
        for genre in genres:
            cursor.execute("INSERT OR IGNORE INTO genres (genre_name) VALUES (?)", (genre,))
        print(f"✅ Seeded {len(genres)} genres")
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            genre_id INTEGER,
            password TEXT,
            FOREIGN KEY (genre_id) REFERENCES genres(genre_id)
        )
    """)
    
    # Activity table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activity (
            activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            book_id INTEGER NOT NULL,
            action_type TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (book_id) REFERENCES books(book_id)
        )
    """)
    
    conn.commit()
    conn.close()
    print("✅ Database initialized!")

# ========================================
# 7. STARTUP EVENT
# ========================================
@app.on_event("startup")
def startup_event():
    try:
        initialize_database()

        # Load vector index (replaces C++ HNSW engine)
        load_vectors_into_index(VECTORS_BIN)

        ratings_path = os.path.join(BASE_PATH, 'ratings.csv')
        if os.path.exists(ratings_path):
            print(f"📊 Loading ratings from: {ratings_path}")
            df_ratings = pd.read_csv(ratings_path)
            svd_engine.train(df_ratings)
        elif os.path.exists('ratings.csv'):
            print("📊 Loading ratings.csv from current directory")
            df_ratings = pd.read_csv('ratings.csv')
            svd_engine.train(df_ratings)
        else:
            print("⚠️  ratings.csv not found!")

        print("🚀 Server Started and Ready!")
    except Exception as e:
        print(f"❌ Startup Error: {e}")

# ========================================
# 8. API ENDPOINTS
# ========================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected" if os.path.exists(DB_PATH) else "missing",
        "svd_model": "trained" if svd_engine.is_trained else "not_trained"
    }

@app.get("/genres")
def get_genres():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT genre_id, genre_name FROM genres ORDER BY genre_name")
        rows = cursor.fetchall()
        conn.close()
        
        if not rows:
            return {"error": "No genres found"}
        
        return [{"id": r[0], "name": r[1]} for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/signup")
def signup(request: SignupRequest):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check duplicate email
        cursor.execute("SELECT user_id FROM users WHERE email = ?", (request.email,))
        if cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password and insert
        hashed_password = pwd_context.hash(request.password)
        cursor.execute(
            "INSERT INTO users (name, email, genre_id, password) VALUES (?, ?, ?, ?)",
            (request.name, request.email, request.genre_id, hashed_password)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        print(f"✅ New user: {request.name} (ID: {user_id})")
        return {
            "status": "success", 
            "user_id": user_id, 
            "name": request.name,
            "message": "User registered successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
def login(request: LoginRequest):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT user_id, name, genre_id, password FROM users WHERE email = ?", 
            (request.email,)
        )
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=404, detail="Email not found")
        
        # Verify password
        if not pwd_context.verify(request.password, user[3]):
            raise HTTPException(status_code=401, detail="Incorrect password")
        
        print(f"✅ Login: {user[1]} (ID: {user[0]})")
        return {
            "status": "success",
            "user_id": user[0],
            "name": user[1],
            "genre_id": user[2],
            "message": "Login successful"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search")
def search_books(query: str, k: int = 5):
    if not query:
        raise HTTPException(status_code=400, detail="Query empty")

    ids = python_vector_search(query, k)
    if not ids:
        raise HTTPException(status_code=503, detail="Vector index not ready or no results")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    placeholders = ','.join(['?'] * len(ids))
    cursor.execute(
        f"SELECT book_id, title, author_name, avg_rating FROM books WHERE book_id IN ({placeholders})",
        ids
    )
    rows = cursor.fetchall()
    conn.close()

    return {
        "query": query,
        "results": [{"book_id": r[0], "title": r[1], "author": r[2], "rating": r[3]} for r in rows]
    }

@app.get("/recommend/{user_id}")
def recommend(user_id: int):
    if not svd_engine.is_trained:
        raise HTTPException(status_code=500, detail="Model not ready")
    
    conn = sqlite3.connect(DB_PATH)
    df_books = pd.read_sql("SELECT book_id, title, author_name FROM books LIMIT 500", conn)
    conn.close()
    
    predictions = []
    for b_id in df_books['book_id'].tolist():
        score = svd_engine.get_prediction(user_id, b_id)
        book_row = df_books[df_books['book_id'] == b_id].iloc[0]
        predictions.append((b_id, score, book_row['title'], book_row['author_name']))
    
    predictions.sort(key=lambda x: x[1], reverse=True)
    
    return {
        "user_id": user_id,
        "recommendations": [
            {"book_id": p[0], "title": p[2], "author": p[3], "score": round(float(p[1]), 2)}
            for p in predictions[:5]
        ]
    }

@app.post("/activity")
def log_activity(request: ActivityRequest):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO activity (user_id, book_id, action_type) VALUES (?, ?, ?)",
            (request.user_id, request.book_id, request.action)
        )
        conn.commit()
        conn.close()
        print(f"📝 Activity: User {request.user_id} -> Book {request.book_id}")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Frontend ke build folder ka rasta
frontend_dist = os.path.join(os.getcwd(), "login", "dist")

# Agar dist folder exist karta hai tabhi mount karein
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        # API requests ko chhod kar baaki sab React ko bhejein
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
# ========================================
# 9. RUN SERVER
# ========================================
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)