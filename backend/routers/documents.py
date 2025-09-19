from fastapi import APIRouter, UploadFile, HTTPException, Body
from services.document_service import DocumentService
from models.document import DocumentSummary, SummarizeRequest

router = APIRouter()
document_service = DocumentService()

@router.post("/upload")
async def upload_document(file: UploadFile):
    try:
        text = await document_service.extract_text(file)
        return {"text": text, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/summarize")
async def summarize_text(request: SummarizeRequest):
    try:
        summary = await document_service.generate_summary(request.text)
        return summary
    except ValueError as e:
        # Handle known validation errors with 400 status code
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log unexpected errors for debugging
        print(f"Unexpected error in summarize_text: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="An unexpected error occurred while generating the summary. Please try again later."
        )

