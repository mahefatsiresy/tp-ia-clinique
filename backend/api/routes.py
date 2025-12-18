from fastapi import APIRouter
from .wikipedia import router as wikipedia_router
from .correctionOrthographe import router as correctionOrthographe_router 

router = APIRouter()

# Routes Wikipedia
router.include_router(wikipedia_router)
router.include_router(correctionOrthographe_router)
