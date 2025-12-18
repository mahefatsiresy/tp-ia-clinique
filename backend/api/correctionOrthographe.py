import os
import re

from fastapi import APIRouter
from pydantic import BaseModel
from rapidfuzz import fuzz, process

# Chemin vers le dictionnaire
DICTIONARY_PATH = os.path.join(os.path.dirname(__file__), "dictionnaire.txt")


def load_dictionary(path):
    with open(path, "r", encoding="utf-8") as f:
        return [line.strip().lower() for line in f if line.strip()]


dictionary = load_dictionary(DICTIONARY_PATH)


def is_correct(word):
    return word.lower() in dictionary


def suggest_corrections(word, limit=5):
    suggestions = process.extract(word, dictionary, scorer=fuzz.ratio, limit=limit)
    return [s[0] for s in suggestions]


def spell_check_text(text):
    errors = []
    for match in re.finditer(r"\b\w+\b", text):
        word = match.group()
        start_index = match.start()
        length = len(word)

        if not is_correct(word):
            if word not in errors:  # éviter doublons
                errors.append(
                    {
                        "word": word,
                        "index": start_index,
                        "length": length,
                        "suggestions": suggest_corrections(word),
                    }
                )

    return {"errors": errors}


# --- API ---
router = APIRouter()


class Texte(BaseModel):
    texte: str


@router.post("/corriger")
def corriger(input: Texte):
    return spell_check_text(input.texte)
