from services.gemini_service import GeminiService
from typing import AsyncGenerator

class ChatService:
    def __init__(self):
        self.gemini = GeminiService()

    async def generate_response(self, message: str, context: str) -> str:
        prompt = (
            "You are a helpful study assistant. Your role is to help students understand "
            "the content they are studying. Format your responses using Markdown for better readability.\n\n"
            "FORMATTING GUIDELINES:\n"
            "- Use **bold** for important terms and concepts\n"
            "- Use bullet points or numbered lists for multiple items\n"
            "- Use headers (## or ###) to organize sections if needed\n"
            "- Use code blocks for technical content or examples\n"
            "- Keep paragraphs short and well-organized\n\n"
            "Answer the question thoroughly and clearly using the provided context. "
            "If you cannot answer based on the context, say so.\n\n"
            f"Context: {context}\n\n"
            f"Question: {message}"
        )
        
        response = await self.gemini.analyze_with_context(message, context)
        return response

    async def generate_response_stream(self, message: str, context: str) -> AsyncGenerator[str, None]:
        """Generate streaming response for chat"""
        prompt = (
            "You are a helpful study assistant. Your role is to help students understand "
            "the content they are studying. Format your responses using Markdown for better readability.\n\n"
            "FORMATTING GUIDELINES:\n"
            "- Use **bold** for important terms and concepts\n"
            "- Use bullet points or numbered lists for multiple items\n"
            "- Use headers (## or ###) to organize sections if needed\n"
            "- Use code blocks for technical content or examples\n"
            "- Keep paragraphs short and well-organized\n\n"
            "Answer the question thoroughly and clearly using the provided context. "
            "If you cannot answer based on the context, say so.\n\n"
            f"Context: {context}\n\n"
            f"Question: {message}"
        )
        
        async for chunk in self.gemini.analyze_with_context_stream(message, context):
            yield chunk

