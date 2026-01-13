import streamlit as st
import pandas as pd
import numpy as np
import faiss
import pickle
from sentence_transformers import SentenceTransformer
import requests

# --- CONFIGURATION ---
st.set_page_config(page_title="BookAI", layout="wide")
DATA_FILE = 'books_data.csv'
INDEX_FILE = 'book_vectors.index'
SVD_MODEL_FILE = 'svd_model.pkl'

# --- 1. LOAD BRAINS (Cached for Speed) ---
@st.cache_resource
def load_data():
    df = pd.read_csv(DATA_FILE)
    index = faiss.read_index(INDEX_FILE)
    model = SentenceTransformer('all-MiniLM-L6-v2')
    with open(SVD_MODEL_FILE, 'rb') as f:
        svd = pickle.load(f)
    return df, index, model, svd

try:
    df_books, index, model, svd_model = load_data()
    st.success("✅ AI Models Loaded Successfully!")
except Exception as e:
    st.error(f"Error loading files: {e}")
    st.stop()

# --- 2. HELPER: GET COVER IMAGE ---
def get_cover_url(book_title):
    # This is a trick: We use Open Library Search API to find a cover
    # In a real app, you would store ISBNs in your DB to make this faster.
    try:
        base_url = "https://openlibrary.org/search.json"
        params = {'title': book_title, 'limit': 1}
        r = requests.get(base_url, params=params).json()
        if r['docs'] and 'cover_i' in r['docs'][0]:
            cover_id = r['docs'][0]['cover_i']
            return f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"
    except:
        pass
    return "https://via.placeholder.com/150x220.png?text=No+Cover"

# --- 3. THE UI ---
st.title("📚 BookAI: The Intelligent Recommender")

# Sidebar: User Login Simulation
st.sidebar.header("👤 User Profile")
user_id = st.sidebar.number_input("User ID", min_value=1, value=1)
if st.sidebar.button("Get Personal Recommendations"):
    st.header(f"❤️ Top Picks for User {user_id}")
    
    # SVD Prediction Logic
    candidate_ids = df_books['book_id'].unique()[:50] # Scan first 50 books for speed
    preds = []
    for bid in candidate_ids:
        est = svd_model.predict(uid=user_id, iid=bid).est
        preds.append((bid, est))
    preds.sort(key=lambda x: x[1], reverse=True)
    
    # Display in Columns
    cols = st.columns(5)
    for idx, (bid, score) in enumerate(preds[:5]):
        book = df_books[df_books['book_id'] == bid].iloc[0]
        with cols[idx]:
            st.image(get_cover_url(book['title']), use_container_width=True)
            st.caption(f"⭐ {score:.1f}/5")
            st.markdown(f"**{book['title']}**")

st.divider()

# Main Area: AI Search
st.header("🔍 Semantic Book Search")
query = st.text_input("Describe a book (e.g., 'A boy goes to wizard school')")

if query:
    # FAISS Search Logic
    vec = model.encode([query])
    D, I = index.search(np.array(vec).astype('float32'), 5)
    
    st.subheader(f"Results for: '{query}'")
    for i in range(5):
        idx = I[0][i]
        book = df_books.iloc[idx]
        
        # Layout: Image on Left, Text on Right
        c1, c2 = st.columns([1, 4])
        with c1:
            st.image(get_cover_url(book['title']), width=100)
        with c2:
            st.markdown(f"### {book['title']}")
            st.write(book['plot'][:300] + "...")
            st.info(f"Match Score: {D[0][i]:.2f}")
