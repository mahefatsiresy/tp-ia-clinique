import os
import re
from rapidfuzz import process, fuzz
from fastapi import FastAPI
from pydantic import BaseModel
import json

# Chemin relatif vers le dictionnaire
DICTIONARY_PATH = os.path.join(os.path.dirname(__file__), "dictionnaire.txt")

# Charger le dictionnaire
def load_dictionary(path):
    with open(path, "r", encoding="utf-8") as f:
        return [line.strip().lower() for line in f if line.strip()]

dictionary = load_dictionary(DICTIONARY_PATH)
print(f"{len(dictionary)} mots chargés")
print(dictionary[:10])  # aperçu

# Vérifier si un mot est correct
def is_correct(word):
    return word.lower() in dictionary

# Proposer des corrections (Levenshtein)
def suggest_corrections(word, limit=5):
    suggestions = process.extract(
        word,
        dictionary,
        scorer=fuzz.ratio,
        limit=limit
    )
    return [s[0] for s in suggestions]

# Vérification orthographique d'un texte complet
def spell_check_text(text):
    words = re.findall(r"\b\w+\b", text.lower())
    errors = {}

    for word in words:
        if not is_correct(word):
            errors[word] = suggest_corrections(word)

    return errors

# --- API FastAPI ---
app = FastAPI(title="Correction Orthographe Malagasy")

# Modèle de données pour l'API
class Texte(BaseModel):
    texte: str

@app.post("/corriger")
def corriger(input: Texte):
    return spell_check_text(input.texte)

# Test local (optionnel)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("correctionOrthographe:app", host="127.0.0.1", port=8000, reload=True)



from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Correction Orthographe Malagasy")

# Autoriser le frontend
origins = [
    "http://localhost:3000",  # URL de ton frontend React par exemple
    "*",  # tu peux mettre "*" temporairement pour tout autoriser
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
