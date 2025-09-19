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
        if not text or len(text.strip()) < 50:
            raise ValueError("Text is too short to generate meaningful quiz questions")

        prompt = (
            f"Generate a quiz with exactly {num_questions} multiple-choice questions based on the following text.\n\n"
            "IMPORTANT FORMATTING REQUIREMENTS:\n"
            "1. Response MUST be a JSON array containing exactly {num_questions} question objects\n"
            "2. Each question object MUST have these exact fields:\n"
            '   - "question": "A clear, specific question about the content"\n'
            '   - "options": ["option1", "option2", "option3", "option4"] (exactly 4 options)\n'
            '   - "correctAnswer": number 0-3 indicating the correct option index\n'
            '   - "explanation": "Clear explanation of why the answer is correct"\n'
            "3. The response must be valid JSON - all strings must use double quotes\n\n"
            "CONTENT REQUIREMENTS:\n"
            "1. Questions should test understanding, not just memorization\n"
            "2. All options should be plausible and related to the topic\n"
            "3. Explanations should be educational and detailed\n"
            "4. Vary the difficulty level of questions\n"
            "5. Focus on key concepts from the text\n\n"
            "Example format:\n"
            '[\n  {\n    "question": "What is X?",\n    "options": ["A", "B", "C", "D"],\n    "correctAnswer": 2,\n    "explanation": "C is correct because..."\n  }\n]\n\n'
            f"Text to analyze:\n{text}"
        )
        
        try:
            response = await self.gemini.generate_text(prompt)
            if not response:
                raise ValueError("No response received from AI model")

            # Try to extract JSON from the response if it's embedded in text
            try:
                # First try direct JSON parsing
                questions_data = json.loads(response)
            except json.JSONDecodeError:
                # If that fails, try to find a JSON array in the response
                import re
                json_match = re.search(r'\[\s*{[^}]*}(?:\s*,\s*{[^}]*})*\s*\]', response)
                if not json_match:
                    print(f"Invalid response format. Response: {response[:200]}...")
                    raise ValueError("Could not extract valid JSON from the response")
                questions_data = json.loads(json_match.group())

            if not isinstance(questions_data, list):
                raise ValueError("Questions data must be an array")

            questions = []
            for i, q_data in enumerate(questions_data):
                # Validate required fields
                required_fields = ["question", "options", "correctAnswer", "explanation"]
                missing_fields = [f for f in required_fields if f not in q_data]
                if missing_fields:
                    raise ValueError(f"Question {i+1} is missing required fields: {missing_fields}")

                # Validate options array
                if not isinstance(q_data["options"], list) or len(q_data["options"]) != 4:
                    raise ValueError(f"Question {i+1} must have exactly 4 options")

                # Validate correctAnswer
                if not isinstance(q_data["correctAnswer"], int) or not (0 <= q_data["correctAnswer"] <= 3):
                    raise ValueError(f"Question {i+1} has invalid correctAnswer (must be 0-3)")

                question = Question(
                    id=str(i + 1),
                    question=q_data["question"],
                    options=q_data["options"],
                    correct_answer=q_data["correctAnswer"],
                    explanation=q_data["explanation"]
                )
                questions.append(question)

            if not questions:
                raise ValueError("No valid questions were generated")

            quiz_id = str(uuid.uuid4())
            quiz = Quiz(id=quiz_id, questions=questions)
            self.quizzes[quiz_id] = quiz
            return quiz

        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {str(e)}")
            raise ValueError(f"Failed to parse quiz questions: {str(e)}")
        except Exception as e:
            print(f"Error generating quiz: {str(e)}")
            raise

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