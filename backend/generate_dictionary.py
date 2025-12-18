import requests
import re
import time

WIKI_MG_API = "https://mg.wikipedia.org/w/api.php"
HEADERS = {"User-Agent": "Python-Dictionary-Complete/1.0"}

# Pages de départ (SEEDS) pour explorer un maximum de vocabulaire
SEEDS = [
    "Madagasikara", "Antananarivo", "Firenena", "Tantara", "Olona",
    "Zava-maniry", "Zavatra", "Kolontsaina", "Fiainana", "Fampianarana"
]

# Nombre maximal de pages à explorer
MAX_PAGES = 2000

# Longueur minimale d'un mot pour être inclus
MIN_WORD_LENGTH = 2

# Temps entre les requêtes pour éviter surcharge API (en secondes)
REQUEST_DELAY = 0.2

# Nettoyage et extraction des mots
def clean_text(text):
    text = re.sub(r"<.*?>", "", text)         # retirer balises HTML
    text = re.sub(r"[^\w\s'-]", "", text)    # retirer ponctuation
    words = [w.lower() for w in text.split() if len(w) >= MIN_WORD_LENGTH]
    return words

# Récupérer extrait et liens internes d'une page
def fetch_page(title):
    params = {
        "action": "query",
        "titles": title,
        "prop": "extracts|links",
        "explaintext": 1,
        "pllimit": "max",
        "format": "json"
    }
    res = requests.get(WIKI_MG_API, params=params, headers=HEADERS, timeout=10)
    res.raise_for_status()
    data = res.json()
    page_id = next(iter(data["query"]["pages"]))
    page = data["query"]["pages"][page_id]

    # Extraire mots
    extract_words = clean_text(page.get("extract", ""))

    # Extraire liens internes
    links = [link["title"] for link in page.get("links", []) if "title" in link]

    return extract_words, links

# Construction du dictionnaire complet
def build_dictionary():
    dictionary = set()
    visited = set()
    queue = list(SEEDS)

    while queue and len(visited) < MAX_PAGES:
        current = queue.pop(0)
        if current in visited:
            continue
        try:
            words, links = fetch_page(current)
            dictionary.update(words)
            # Ajouter liens non visités à la queue
            for link in links:
                if link not in visited:
                    queue.append(link)
            visited.add(current)
            print(f"Pages visitées: {len(visited)} | Mots uniques: {len(dictionary)} | Page: {current}")
            time.sleep(REQUEST_DELAY)
        except Exception as e:
            print(f"Erreur sur {current}: {e}")

    return dictionary

if __name__ == "__main__":
    print("Génération du dictionnaire malagasy complet...")
    dict_words = build_dictionary()
    
    # Sauvegarde dans un fichier
    with open("malagasy_dictionary.txt", "w", encoding="utf-8") as f:
        for word in sorted(dict_words):
            f.write(word + "\n")

    print(f"Dictionnaire généré avec {len(dict_words)} mots.")
