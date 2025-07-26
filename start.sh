#!/bin/bash

# Attiva la virtualenv
source ./backend/venv/bin/activate
echo "✅ VENV attivato, Python: $(which python)"
ollama serve &

# Avvia frontend
cd frontend-gim
npm run dev &

# Torna alla root e avvia backend con percorso modulare
cd ..
uvicorn backend.main:app --reload