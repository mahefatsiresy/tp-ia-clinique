from fastapi import APIRouter, Query

router = APIRouter()

PREFIX_RULES = {
    "man": {"n": "t", "m": "p", "ng": "k"},
    "mam": {"m": "p"},
    "mang": {"ng": "k"},
    "mi": {},
    "ma": {}
}

def lemmatize(word: str) -> str:
    word = word.lower()

    for prefix, rules in PREFIX_RULES.items():
        if word.startswith(prefix):
            stem = word[len(prefix):]

            # règle spéciale ng
            if stem.startswith("ng"):
                return rules.get("ng", "") + stem[2:]

            # règle normale
            if stem and stem[0] in rules:
                return rules[stem[0]] + stem[1:]

            # fallback simple
            return stem

    return word

@router.get("/lemmatize", tags=["Lemmatization"])
def lemmatize_api(word: str = Query(...)):
    return {
        "word": word,
        "lemma": lemmatize(word)
    }
