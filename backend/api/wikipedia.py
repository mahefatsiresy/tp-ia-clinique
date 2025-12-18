import requests
from fastapi import APIRouter, Query, HTTPException

router = APIRouter()

WIKIPEDIA_URL = "https://mg.wikipedia.org/w/api.php"

HEADERS = {
    "User-Agent": "FastAPI-Wikipedia-MG/1.0 (rasolofomanananjakatahiana@gmail.com)"
}

@router.get("/wikipedia/search", tags=["Wikipedia MG"])
def search_wikipedia(q: str = Query(..., description="Mot à rechercher en malgache")):
    params = {
        "action": "query",
        "list": "search",
        "srsearch": q,
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

    results = [
        {
            "title": item["title"],
            "snippet": item["snippet"]
        }
        for item in data.get("query", {}).get("search", [])
    ]

    return {
        "lang": "mg",
        "query": q,
        "results": results
    }
