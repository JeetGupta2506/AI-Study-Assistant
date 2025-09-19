from pydantic import BaseModel

class ChatMessage(BaseModel):
    content: str
    context: str

class ChatResponse(BaseModel):
    content: str