#!/bin/bash

# Attiva la virtualenv
source ./backend/venv/bin/activate
echo "✅ VENV attivato, Python: $(which python)"
ollama serve &

# Assicurati che il modello Mistral sia pronto (verifica se installato, altrimenti lo scarica)
# ollama pull mistral

# Avvia frontend
cd frontend-gim
npm run dev &

# Torna al backend
cd ../backend
uvicorn main:app --reload