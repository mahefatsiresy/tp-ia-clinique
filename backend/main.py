from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(title="Éditeur Malagasy - Backend")

# Autoriser frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # à restreindre selon ton frontend
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure toutes les routes
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"status": "Backend OK"}
