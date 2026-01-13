FROM python:3.11-slim

# 1. Install build tools and SQLite System Library
RUN apt-get update && apt-get install -y \
    build-essential \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Install Python dependencies (CPU-only version for fast build)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --retries 10 --default-timeout=1000 -r requirements.txt

# 3. Copy everything from your local folder
COPY . .

# 4. Compile C++ Engine (Using System SQLite - No conflict error)
# Note: We use -lsqlite3 to link the library installed in step 1
RUN g++ -O3 db_book/hybrid_core.cpp -o hybrid_engine -lsqlite3 -lpthread -I db_book

# 5. Create data folder for DB and Vectors
RUN mkdir -p data

# 6. Make start script executable
RUN chmod +x start.sh

EXPOSE 8000
CMD ["./start.sh"]