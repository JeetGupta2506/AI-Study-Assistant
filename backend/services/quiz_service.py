import uuid
import json
from typing import List
from services.gemini_service import GeminiService
from models.quiz import Quiz, Question, AnswerResult

class QuizService:
    def __init__(self):
        self.gemini = GeminiService()
        self.quizzes = {}  # In-memory storage, replace with database in production

    async def generate_quiz(self, text: str, num_questions: int) -> Quiz:
        prompt = (
            f"Generate a quiz with {num_questions} multiple-choice questions based on "
            "the following text. Format your response as a JSON array of questions. "
            "Each question should have the following structure:\n"
            "{\n"
            '  "question": "The question text",\n'
            '  "options": ["option1", "option2", "option3", "option4"],\n'
            '  "correctAnswer": 0,  // Index of correct option (0-3)\n'
            '  "explanation": "Explanation of the correct answer"\n'
            "}\n\n"
            f"Text to create questions from:\n{text}"
        )
        
        response = await self.gemini.generate_text(prompt)
        
        try:
            # Parse the JSON response
            questions_data = json.loads(response)
            questions = []
            
            for i, q_data in enumerate(questions_data):
                question = Question(
                    id=str(i + 1),
                    question=q_data["question"],
                    options=q_data["options"],
                    correct_answer=q_data["correctAnswer"],
                    explanation=q_data["explanation"]
                )
                questions.append(question)
            
            quiz_id = str(uuid.uuid4())
            quiz = Quiz(id=quiz_id, questions=questions)
            self.quizzes[quiz_id] = quiz
            return quiz
            
        except json.JSONDecodeError:
            raise ValueError("Failed to parse quiz questions")

    async def check_answer(self, quiz_id: str, question_id: str, answer: int) -> AnswerResult:
        quiz = self.quizzes.get(quiz_id)
        if not quiz:
            raise ValueError("Quiz not found")
            
        question = next((q for q in quiz.questions if q.id == question_id), None)
        if not question:
            raise ValueError("Question not found")
            
        is_correct = answer == question.correct_answer
        return AnswerResult(
            correct=is_correct,
            explanation=question.explanation
        )