import requests
from fastapi import APIRouter, Query, HTTPException
import re

router = APIRouter()

WIKIPEDIA_URL = "https://mg.wikipedia.org/w/api.php"
HEADERS = {"User-Agent": "FastAPI-Wikipedia-MG/1.0 (contact@email.com)"}

@router.get("/wikipedia/translate", tags=["Wikipedia MG"])
def translate_word(word: str = Query(..., description="Mot à traduire ou définir")):
    params = {
        "action": "query",
        "list": "search",
        "srsearch": word,
        "format": "json",
        "utf8": 1
    }

    try:
        response = requests.get(
            WIKIPEDIA_URL,
            params=params,
            headers=HEADERS,
            timeout=5  #  empêche le blocage
        )
        response.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=str(e))

    data = response.json()
    search_results = data.get("query", {}).get("search", [])

    if not search_results:
        return {"word": word, "translation": "Aucune définition trouvée."}

    snippet = search_results[0]["snippet"]
    snippet = re.sub(r"<.*?>", "", snippet)  # nettoyer HTML
    return {"word": word, "translation": snippet}
