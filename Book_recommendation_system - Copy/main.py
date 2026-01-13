import pandas as pd
import numpy as np
import uvicorn
import sqlite3
import os
import time
import struct
from fastapi import FastAPI, HTTPException
from sentence_transformers import SentenceTransformer
from sklearn.decomposition import TruncatedSVD
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext

# ========================================
# 1. PATH CONFIGURATION
# ========================================
import os
# ... (baaki saare imports same rahenge)

# ========================================
# 1. PATH CONFIGURATION (CRITICAL CHANGE FOR DEPLOYMENT)
# ========================================
# Docker aur Cloud ke liye relative path use karna zaroori hai
BASE_PATH = "data" 
DB_PATH = os.path.join(BASE_PATH, "library_system.db")
QUERY_BIN = os.path.join(BASE_PATH, "query.bin")
RESULTS_BIN = os.path.join(BASE_PATH, "results.bin")

# Folder agar nahi hai toh bana lo
if not os.path.exists(BASE_PATH):
    os.makedirs(BASE_PATH, exist_ok=True)

print(f"🗂️ BASE_PATH set to: {BASE_PATH}")
# ... (baaki poora code, SVD engine, FastAPI endpoints bilkul SAME rahenge)

# print(f"🗂️ BASE_PATH: {BASE_PATH}")
print(f"📁 QUERY_BIN: {QUERY_BIN}")
print(f"📁 RESULTS_BIN: {RESULTS_BIN}")
print(f"💾 DB_PATH: {DB_PATH}")

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
# 5. C++ BRIDGE FUNCTION
# ========================================
def call_cpp_search(query_text, k=5):
    print(f"\n📡 Vectorizing query: {query_text}")
    query_vec = embedding_model.encode(query_text).astype('float32')
    
    with open(QUERY_BIN, 'wb') as f:
        f.write(query_vec.tobytes())
    
    if not os.path.exists(QUERY_BIN):
        print(f"❌ ERROR: File not found at {QUERY_BIN}")
        return None
    
    print("⏳ Waiting for C++ engine...")
    timeout = 10
    start_time = time.time()
    
    while os.path.exists(QUERY_BIN):
        if time.time() - start_time > timeout:
            print("❌ Timeout: C++ engine not responding!")
            os.remove(QUERY_BIN)
            return None
        time.sleep(0.05)
    
    print("✅ C++ engine processed query!")
    
    book_ids = []
    if os.path.exists(RESULTS_BIN):
        with open(RESULTS_BIN, 'rb') as f:
            while chunk := f.read(4):
                book_ids.append(struct.unpack('i', chunk)[0])
        os.remove(RESULTS_BIN)
        print(f"📚 Found {len(book_ids)} book IDs")
    
    return book_ids

# ========================================
# 6. DATABASE INITIALIZATION
# ========================================
def initialize_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
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
    
    # Add password column if not exists
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN password TEXT")
        print("✅ Password column added to users table")
    except sqlite3.OperationalError:
        print("⚠️ Password column already exists")
    
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
            print("⚠️ ratings.csv not found!")
        
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
    
    ids = call_cpp_search(query, k)
    if not ids:
        raise HTTPException(status_code=504, detail="C++ Engine timeout")
    
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