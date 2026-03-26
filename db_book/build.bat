@echo off
echo [1/2] Compiling sqlite3.c (as C)...
gcc -c -o sqlite3.o sqlite3.c -DSQLITE_OMIT_LOAD_EXTENSION
if errorlevel 1 (
    echo FAILED: sqlite3 compilation error
    exit /b 1
)

echo [2/2] Compiling and linking hybrid_core.cpp (as C++)...
g++ -std=c++17 -O2 -o hybrid_engine.exe hybrid_core.cpp sqlite3.o
if errorlevel 1 (
    echo FAILED: hybrid_core compilation error
    exit /b 1
)

echo.
echo SUCCESS: hybrid_engine.exe built successfully!
