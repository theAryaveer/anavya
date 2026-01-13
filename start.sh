#!/bin/bash
echo "🔧 Starting Hybrid Recommendation System..."

# 1. Start C++ Engine in background
./hybrid_engine &
echo "🚀 C++ Engine is running in background..."

sleep 5

# 2. Start Python Backend with CORRECT path
echo "🌐 Starting Python Backend..."
python3 "/app/Book_recommendation_system - Copy/main.py"