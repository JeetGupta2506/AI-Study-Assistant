from fastapi import APIRouter, HTTPException
from models.chat import ChatMessage, ChatResponse
from services.chat_service import ChatService

router = APIRouter()
chat_service = ChatService()

@router.post("/message")
async def send_message(message: ChatMessage):
    try:
        response = await chat_service.generate_response(message.content, message.context)
        return ChatResponse(content=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

