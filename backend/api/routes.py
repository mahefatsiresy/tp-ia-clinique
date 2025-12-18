from fastapi import APIRouter
from .wikipedia import router as wikipedia_router

router = APIRouter()

# Routes Wikipedia
router.include_router(wikipedia_router)
