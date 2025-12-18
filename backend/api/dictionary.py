from fastapi import APIRouter, Query
from rapidfuzz import process, fuzz

router = APIRouter()

# Charger le dictionnaire
DICTIONARY_FILE = "malagasy_dictionary.txt"
WORDS = set()
try:
    with open(DICTIONARY_FILE, "r", encoding="utf-8") as f:
        for line in f:
            w = line.strip().lower()
            if w:
                WORDS.add(w)
except FileNotFoundError:
    print(f"Fichier {DICTIONARY_FILE} non trouvé !")

@router.get("/dictionary/check", tags=["Dictionary"])
def check_word(word: str = Query(..., description="Mot à vérifier")):
    exists = word.strip().lower() in WORDS
    return {"word": word, "exists": exists}

@router.get("/dictionary/suggestions", tags=["Dictionary"])
def suggest_word(word: str = Query(..., description="Mot pour suggestion"), limit: int = 5):
    """
    Propose des suggestions proches en utilisant RapidFuzz
    """
    word = word.strip().lower()
    suggestions = [match for match, score, *_ in process.extract(word, WORDS, scorer=fuzz.ratio, limit=limit)]
    return {"word": word, "suggestions": suggestions}
