from services.gemini_service import GeminiService

class ChatService:
    def __init__(self):
        self.gemini = GeminiService()

    async def generate_response(self, message: str, context: str) -> str:
        prompt = (
            "You are a helpful study assistant. Your role is to help students understand "
            "the content they are studying. Use the provided context to answer the "
            "question thoroughly and clearly. If you cannot answer based on the context, "
            "say so.\n\n"
            f"Context: {context}\n\n"
            f"Question: {message}"
        )
        
        response = await self.gemini.analyze_with_context(message, context)
        return response

