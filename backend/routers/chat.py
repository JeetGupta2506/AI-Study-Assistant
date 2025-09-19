from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.chat import ChatMessage, ChatResponse
from services.chat_service import ChatService
import json

router = APIRouter()
chat_service = ChatService()

@router.post("/message")
async def send_message(message: ChatMessage):
    try:
        response = await chat_service.generate_response(message.content, message.context)
        return ChatResponse(content=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/message/stream")
async def send_message_stream(message: ChatMessage):
    """Stream chat response using Server-Sent Events"""
    try:
        async def generate_stream():
            try:
                async for chunk in chat_service.generate_response_stream(message.content, message.context):
                    # Format as Server-Sent Events
                    yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
                
                # Send completion signal
                yield f"data: {json.dumps({'type': 'done'})}\n\n"
                
            except Exception as e:
                # Send error signal
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

