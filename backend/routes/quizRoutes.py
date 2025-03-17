from fastapi import APIRouter
from backend.controllers.quizController import generate_quiz

router = APIRouter()

router.post("/generate")(generate_quiz)

@router.get("/")
async def home():
    return {"message": "Quiz API is running!"}
