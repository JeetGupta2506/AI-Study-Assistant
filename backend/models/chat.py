from pydantic import BaseModel
from typing import List

class ChatMessage(BaseModel):
    content: str
    context: str

class ChatResponse(BaseModel):
    content: str

