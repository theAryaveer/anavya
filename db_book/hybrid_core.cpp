#include <iostream>
#include <string>
#include <vector>
#include <fstream>
#include <chrono>
#include <thread>

// ==========================================
// 🛡️ ROBUST MINGW COMPATIBILITY LAYER
// ==========================================
#ifdef _WIN32
    #include <windows.h>
    #define SLEEP_MS(ms) Sleep(ms)
    const std::string DATA_DIR = "data/";

    // Fix for older MinGW missing mutex support
    #ifndef _GLIBCXX_HAS_GTHREADS
        namespace std {
            struct defer_lock_t { };
            struct dummy_mutex {
                void lock() {}
                void unlock() {}
                void lock_shared() {}
                void unlock_shared() {}
            };
            typedef dummy_mutex mutex;
            typedef dummy_mutex recursive_mutex;
            template <typename T>
            class unique_lock {
            public:
                unique_lock(T& m) {}
                unique_lock(T& m, defer_lock_t d) {}
                void lock() {}
                void unlock() {}
            };
            static constexpr defer_lock_t defer_lock {};
        }
        #define _GLIBCXX_MUTEX 1
        #define _GLIBCXX_THREAD 1
    #endif
#else
    #include <unistd.h>
    #define SLEEP_MS(ms) std::this_thread::sleep_for(std::chrono::milliseconds(ms))
    const std::string DATA_DIR = "data/";
#endif

#include "sqlite3.h"
#include "hnswlib.h"

using namespace std;

class BookDB {
private:
    sqlite3* db;
    hnswlib::HierarchicalNSW<float>* vector_index;
    hnswlib::L2Space* space;
    int dim = 384; 

    void run_sql(const char* sql) {
        char* errMsg = 0;
        int rc = sqlite3_exec(db, sql, 0, 0, &errMsg);
        if (rc != SQLITE_OK) {
            cerr << "❌ SQL Error: " << errMsg << endl;
            sqlite3_free(errMsg);
        }
    }

public:
    BookDB() {
        string db_path = DATA_DIR + "library_system.db";
        if (sqlite3_open(db_path.c_str(), &db)) {
            cerr << "❌ DB Open Fail at " << db_path << endl;
            return;
        }
        create_tables();
        space = new hnswlib::L2Space(dim);
        vector_index = new hnswlib::HierarchicalNSW<float>(space, 15000, 16, 200); 
        cout << "✅ Hybrid Engine Online." << endl;
    }

    ~BookDB() {
        sqlite3_close(db);
        delete vector_index;
        delete space;
    }

    void create_tables() {
        run_sql("CREATE TABLE IF NOT EXISTS genres (genre_id INTEGER PRIMARY KEY AUTOINCREMENT, genre_name TEXT UNIQUE NOT NULL);");
        run_sql("CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, genre_id INTEGER, password TEXT);");
        run_sql("CREATE TABLE IF NOT EXISTS books (book_id INTEGER PRIMARY KEY, title TEXT, author_name TEXT, avg_rating REAL DEFAULT 0, is_indexed INTEGER DEFAULT 0);");
    }

    void load_vectors(string filename) {
        ifstream input(filename, ios::binary);
        if (!input) {
            cerr << "❌ Could not open vectors file: " << filename << endl;
            return;
        }
        int id;
        float vec[384];
        int count = 0;
        while (input.read((char*)&id, sizeof(int))) {
            input.read((char*)vec, sizeof(float) * 384);
            vector_index->addPoint(vec, (size_t)id); 
            count++;
        }
        cout << "🚀 Loaded " << count << " books into AI Brain." << endl;
        input.close();
    }

    void process_search(float* query_vec, int k, string output_path) {
        auto result = vector_index->searchKnn(query_vec, k); 
        ofstream res_file(output_path, ios::binary);
        while (!result.empty()) {
            int b_id = result.top().second;
            res_file.write((char*)&b_id, sizeof(int));
            result.pop();
        }
        res_file.close();
    }
};

int main() {
    BookDB engine;
    string v_path = DATA_DIR + "vectors.bin";
    string q_path = DATA_DIR + "query.bin";
    string r_path = DATA_DIR + "results.bin";

    engine.load_vectors(v_path);
    cout << "\n👂 Listening for Python Queries at: " << q_path << endl;

    while (true) {
        ifstream q_file(q_path, ios::binary); 
        if (q_file) {
            float q_vec[384];
            q_file.read((char*)q_vec, sizeof(float) * 384);
            q_file.close();
            remove(q_path.c_str()); 
            engine.process_search(q_vec, 5, r_path); 
            cout << "✨ Search results written to " << r_path << endl;
        }
        SLEEP_MS(100); 
    }
    return 0;
}