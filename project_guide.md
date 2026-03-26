# 📚 Anavya — Complete Project Guide
### *For everyone, tech or non-tech*

---

## 🌟 What Is This Project?

**Anavya** is an **AI-powered book recommendation website**.

Think of it like Netflix, but for books:
- You **sign up** and tell it what genres you like
- You **search** for any book topic
- The AI **recommends books** you'll probably love

It works in **3 layers** — like a restaurant:

```
👤 Customer (YOU)
        ↓
🍽️  Waiter = Frontend (the website you see)
        ↓
👨‍🍳 Kitchen = Backend (the brains that process your request)
        ↓
🗄️  Pantry = Database & Data Files (where all book info is stored)
```

---

## 🗂️ Project Folder Map

```
anavya/
│
├── 📁 login/           → The WEBSITE (what users see)
├── 📁 Book_recommand/  → The BRAIN (AI + API server)
├── 📁 db_book/         → Data TOOLS (scripts to load data)
├── 📁 data/            → The PANTRY (database + AI data files)
│
├── 📄 Dockerfile       → Recipe to pack app into a box (for cloud)
├── 📄 requirements.txt → List of Python tools needed
└── 📄 start.sh         → One-click startup script
```

---

## 🍽️ LAYER 1 — The Website ([login/](file:///c:/Users/HP/Desktop/anavya/Book_recommand/main.py#310-342) folder)

> This is everything the **user sees and clicks on**.  
> Built with **React** (a modern website framework) + **TypeScript**.

### 📁 `login/src/pages/` — The Screens

| File | What It Does |
|------|-------------|
| `LoginPage.tsx` | The login screen — enter email & password |
| `SignupPage.tsx` | Basic signup form |
| `SignupWizard.tsx` | Step-by-step signup **wizard** — picks your favourite genres |
| `MainPage.tsx` | The **home screen** after login — search + recommendations |
| `ForgotPassword.tsx` | "I forgot my password" screen |
| `ResetPassword.tsx` | Enter new password after reset |

### 📁 `login/src/components/` — Reusable Building Blocks
*(Like LEGO bricks used across multiple screens)*

| File | What It Does |
|------|-------------|
| `Navbar.tsx` | The top navigation bar |
| `SearchSection.tsx` | The search bar + search button |
| `BookCard.tsx` | A single book card (cover, title, author, rating) |
| `RecommendationGrid.tsx` | Grid of recommended book cards |
| `GenreGrid.tsx` | Grid of genre buttons during signup |
| `AuthCard.tsx` | The styled login/signup card container |
| `ErrorAlert.tsx` | Red error popup box |
| `Toast.tsx` | Small pop-up notification (success/error messages) |
| `LoadingShimmer.tsx` | The "skeleton" loading animation while waiting |
| `PasswordInput.tsx` | Password field with show/hide toggle |
| `OtpInput.tsx` | OTP (one-time password) input boxes |
| `ErrorBoundary.tsx` | Safety net — catches crashes so whole page doesn't break |
| `Dashboard.tsx` | Main layout wrapper |

### 📄 Other important files in `login/`

| File | What It Does |
|------|-------------|
| `index.html` | The single HTML page (React lives inside this) |
| `package.json` | List of all JavaScript packages needed |
| `vite.config.ts` | Settings for Vite (the tool that runs the website) |
| `.env` | Secret settings (like database URL) — never shared publicly |
| `tailwind.config.js` | CSS styling settings |
| `dist/` folder | The **built/compiled** version ready for production |
| `node_modules/` | Downloaded JavaScript packages (auto-generated, don't touch) |

---

## 👨‍🍳 LAYER 2 — The Brain (`Book_recommand/` folder)

> This is the **server** — it receives requests from the website,  
> runs the AI, and sends back answers.  
> Built with **FastAPI** (a Python web framework).

### 📄 `main.py` — The Heart of the Backend ⭐

This is the **most important file** in the whole project. It does everything:

1. **Starts the server** on port 8000
2. **Loads the AI model** (`SentenceTransformer`) — converts text to numbers
3. **Loads book vectors** from `vectors.bin` into a search index
4. **Trains the SVD recommendation model** from ratings data
5. **Handles all API requests** from the website:

| Endpoint | What Happens |
|----------|-------------|
| `GET /health` | "Is the server alive?" check |
| `GET /genres` | Returns list of all book genres |
| `POST /signup` | Creates a new user account |
| `POST /login` | Checks email + password, logs user in |
| `GET /search?query=...` | AI-powered book search |
| `GET /recommend/{user_id}` | Personalized book recommendations |
| `POST /activity` | Records what books a user viewed/liked |

### 🤖 How AI Search Works (in plain English)

```
You type: "mystery thriller crime"
         ↓
AI Model converts your words into 384 numbers (called a "vector")
e.g. [0.23, -0.45, 0.12, ... (384 numbers)]
         ↓
These numbers represent the "meaning" of your search
         ↓
Python finds the books whose numbers are closest to yours
         ↓
Returns the top 5 most similar books!
```

### 📄 Other files in `Book_recommand/`

| File | What It Does |
|------|-------------|
| `books_data.csv` | Raw book data (title, author, rating) — 1.9 MB |
| `ratings.csv` | 72MB of user ratings data — used to train recommendations |
| `svd_model.pkl` | Pre-saved recommendation model (168MB) |
| `book_vectors.index` | Pre-built HNSW vector index file (15MB) |
| `app.py` | Older version — the original Streamlit demo app |
| `pipeline.ipynb` | Jupyter notebook — where the AI was originally built & tested |
| `main.ipynb` | Testing notebook for main.py logic |
| `populate_genres.py` | Script to fill in genres table in database |

---

## 🗄️ LAYER 3 — The Data (`data/` folder)

> This is the **pantry** — all the stored data the brain uses.

| File | What It Is | Size |
|------|-----------|------|
| `library_system.db` | The main **SQLite database** — stores users, books, genres, activity | 780 KB |
| `ratings.csv` | 6+ million book ratings from real users | 72 MB |
| `vectors.bin` | Every book converted to 384 numbers (AI format) | 15 MB |

### 📊 What's inside the database?

```
library_system.db
│
├── 👤 users      → user_id, name, email, password, genre_id
├── 📚 books      → book_id, title, author_name, avg_rating
├── 🏷️  genres    → genre_id, genre_name (Fiction, Thriller, etc.)
└── 📝 activity   → who viewed/liked what book
```

---

## 🛠️ LAYER 4 — Data Tools (`db_book/` folder)

> These are **one-time setup scripts** — run once to prepare the data.  
> Not needed when the app is running normally.

| File | What It Does |
|------|-------------|
| `load_all_data.py` | Reads `books_data.csv` and loads all books into the database |
| `load_vectors.py` | Reads CSV and creates the `vectors.bin` AI data file |
| `prepare_data.py` | Cleans and prepares raw book data |
| `migrate_add_authors.py` | One-time script to add author info to database |
| `final_mapping.csv` | Maps book IDs between different datasets |
| `build.bat` | (Was for C++ build — now obsolete) |

---

## ⚙️ Configuration & Deployment Files

| File | What It Does |
|------|-------------|
| `Dockerfile` | Instructions to pack the whole app into a **Docker container** (like a shipping box for cloud deployment) |
| `.dockerignore` | Tells Docker which files to skip (like `.gitignore` but for Docker) |
| `requirements.txt` | List of all Python packages needed (`pip install -r requirements.txt`) |
| `start.sh` | Shell script to start both backend and C++ engine at once |
| `.gitignore` | Files that should NOT be uploaded to GitHub (passwords, big files) |
| `backend.log` / `.err.log` | Log files — history of what the server did and any errors |

---

## 🔄 How It All Works Together — Full Journey

```
1. 👤 User opens http://localhost:5173 in browser
           ↓
2. 🍽️  React website loads (login/ folder)
           ↓
3. 👤 User signs up → website sends data to http://localhost:8000/signup
           ↓
4. 👨‍🍳 FastAPI (main.py) receives it → saves to library_system.db
           ↓
5. 👤 User searches "romantic fantasy books"
           ↓
6. 🍽️  Website sends GET /search?query=romantic+fantasy+books
           ↓
7. 🤖 AI converts "romantic fantasy books" → 384 numbers
           ↓
8. 🔍 Python searches vectors.bin for the closest matching books
           ↓
9. 📚 Finds top 5 matches → looks up titles in database
           ↓
10. 🍽️  Website displays beautiful BookCards to the user ✨
```

---

## 🚀 How to Start the Project

### Start Backend (AI Server):
```bash
cd Book_recommand
python -m uvicorn main:app --reload --port 8000
```

### Start Frontend (Website):
```bash
cd login
npm run dev
```

Then open **http://localhost:5173** in your browser! 🎉

---

## 📦 Tech Stack Summary

| Layer | Technology | Why |
|-------|-----------|-----|
| Website UI | React + TypeScript + Vite | Fast, modern web app |
| Styling | Tailwind CSS | Beautiful design quickly |
| Backend API | FastAPI (Python) | Fast, easy to build AI APIs |
| AI Search | SentenceTransformer + sklearn | Converts text to numbers + finds similar books |
| Recommendations | SVD (Matrix Factorization) | Classic recommendation algorithm used by Netflix |
| Database | SQLite | Simple, no-server database — stores users & books |
| Data Format | CSV + Binary (.bin) | Efficient storage for large datasets |
