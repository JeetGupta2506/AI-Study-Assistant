from pydantic import BaseModel
from typing import List

class QuizRequest(BaseModel):
    text: str
    num_questions: int = 5

class Question(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer: int
    explanation: str

class Quiz(BaseModel):
    id: str
    questions: List[Question]

class AnswerResult(BaseModel):
    correct: bool
    explanation: str