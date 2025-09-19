from fastapi import APIRouter, HTTPException
from models.quiz import QuizRequest, Quiz
from services.quiz_service import QuizService

router = APIRouter()
quiz_service = QuizService()

@router.post("/generate")
async def generate_quiz(request: QuizRequest):
    try:
        quiz = await quiz_service.generate_quiz(request.text, request.num_questions)
        return quiz
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/check-answer")
async def check_answer(quiz_id: str, question_id: str, answer: int):
    try:
        result = await quiz_service.check_answer(quiz_id, question_id, answer)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))