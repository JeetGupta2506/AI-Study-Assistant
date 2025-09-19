from fastapi import APIRouter, HTTPException
import json
from models.quiz import QuizRequest, Quiz
from services.quiz_service import QuizService

router = APIRouter()
quiz_service = QuizService()

@router.post("/generate")
async def generate_quiz(request: QuizRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="No text provided for quiz generation")
    
    try:
        quiz = await quiz_service.generate_quiz(request.text, request.num_questions)
        return quiz
    except ValueError as e:
        # Handle validation errors
        raise HTTPException(status_code=400, detail=str(e))
    except json.JSONDecodeError as e:
        # Handle JSON parsing errors
        raise HTTPException(status_code=500, detail="Failed to generate quiz: Invalid response format")
    except Exception as e:
        # Log unexpected errors
        print(f"Error generating quiz: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="An unexpected error occurred while generating the quiz. Please try again."
        )

@router.post("/check-answer")
async def check_answer(quiz_id: str, question_id: str, answer: int):
    try:
        result = await quiz_service.check_answer(quiz_id, question_id, answer)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))