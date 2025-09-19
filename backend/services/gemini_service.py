import google.generativeai as genai
from config import settings
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import AsyncGenerator
import json

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.MODEL_NAME)
        self._executor = ThreadPoolExecutor()

    async def generate_text(self, prompt: str) -> str:
        """Generate text using Gemini API"""
        try:
            if not prompt or len(prompt.strip()) == 0:
                raise ValueError("Empty prompt provided")

            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                self._executor,
                lambda: self.model.generate_content(prompt)
            )
            
            if not response:
                raise ValueError("No response received from Gemini API")
                
            if not hasattr(response, 'text'):
                raise ValueError(f"Unexpected response format: {response}")
                
            return response.text
        except Exception as e:
            print(f"Error generating text: {str(e)}")
            if "API key not available" in str(e):
                raise ValueError("Gemini API key not configured properly")
            elif "Rate limit exceeded" in str(e):
                raise ValueError("Gemini API rate limit exceeded. Please try again later")
            else:
                raise ValueError(f"Error generating text: {str(e)}")

    async def generate_structured_text(self, prompt: str, format_instructions: str) -> str:
        """Generate text with specific formatting instructions"""
        full_prompt = (
            f"{format_instructions}\n\n"
            f"Important: Format your response exactly as requested. Do not include any additional text.\n\n"
            f"{prompt}"
        )
        return await self.generate_text(full_prompt)

    async def analyze_with_context(self, prompt: str, context: str) -> str:
        """Generate text with given context"""
        full_prompt = (
            f"Context:\n{context}\n\n"
            f"Task:\n{prompt}\n\n"
            f"Important: Provide a detailed, accurate response based on the context provided."
        )
        return await self.generate_text(full_prompt)

    async def generate_text_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        """Generate text using Gemini API with streaming"""
        try:
            if not prompt or len(prompt.strip()) == 0:
                raise ValueError("Empty prompt provided")

            loop = asyncio.get_event_loop()
            
            def _stream_generate():
                response = self.model.generate_content(prompt, stream=True)
                return response

            response_stream = await loop.run_in_executor(self._executor, _stream_generate)
            
            for chunk in response_stream:
                if hasattr(chunk, 'text') and chunk.text:
                    yield chunk.text
                    
        except Exception as e:
            print(f"Error generating streaming text: {str(e)}")
            if "API key not available" in str(e):
                raise ValueError("Gemini API key not configured properly")
            elif "Rate limit exceeded" in str(e):
                raise ValueError("Gemini API rate limit exceeded. Please try again later")
            else:
                raise ValueError(f"Error generating streaming text: {str(e)}")

    async def analyze_with_context_stream(self, prompt: str, context: str) -> AsyncGenerator[str, None]:
        """Generate streaming text with given context"""
        full_prompt = (
            f"Context:\n{context}\n\n"
            f"Task:\n{prompt}\n\n"
            f"Important: Provide a detailed, accurate response based on the context provided."
        )
        async for chunk in self.generate_text_stream(full_prompt):
            yield chunk