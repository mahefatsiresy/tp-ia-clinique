from fastapi import APIRouter
from .dictionary import router as dictionary_router
from .wikipedia import router as wikipedia_router

router = APIRouter()

router.include_router(dictionary_router)
router.include_router(wikipedia_router)
