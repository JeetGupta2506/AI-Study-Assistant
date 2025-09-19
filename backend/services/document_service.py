import PyPDF2
from io import BytesIO
from fastapi import UploadFile, HTTPException
from models.document import DocumentSummary
from services.gemini_service import GeminiService

class DocumentService:
    def __init__(self):
        self.gemini = GeminiService()

    async def extract_text(self, file: UploadFile) -> str:
        content = await file.read()
        
        if not content:
            raise ValueError("Empty file uploaded")
            
        if file.filename.endswith('.pdf'):
            try:
                pdf_reader = PyPDF2.PdfReader(BytesIO(content))
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
                
                if not text.strip():
                    raise ValueError("No text content extracted from PDF. The file might be scanned images or corrupted.")
                    
                return text
            except Exception as e:
                raise ValueError(f"Failed to read PDF file: {str(e)}")
        elif file.filename.endswith('.txt'):
            try:
                text = content.decode('utf-8')
                if not text.strip():
                    raise ValueError("Empty text file uploaded")
                return text
            except UnicodeDecodeError:
                raise ValueError("Invalid text file encoding. Please ensure the file is UTF-8 encoded.")
        else:
            raise ValueError("Unsupported file type. Only PDF and TXT files are supported.")

    async def generate_summary(self, text: str) -> DocumentSummary:
        if not text or len(text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Text is too short or empty. Please provide more content for summarization."
            )

        format_instructions = """
        Analyze the provided text and create a comprehensive summary with two sections:
        1. Quick Notes: Concise bullet points of main concepts and facts
        2. Key Takeaways: Deeper analysis and important implications

        Format your response EXACTLY as follows:
        Quick Notes:
        - [concise point about main concept]
        - [important fact or definition]
        (include 5-7 bullet points)

        Key Takeaways:
        - [detailed insight with explanation]
        - [important implication or connection]
        (include 3-5 detailed takeaways)

        Note: Each bullet point should be clear and complete. Quick notes should be concise (1-2 lines) while takeaways can be more detailed (2-3 lines).
        """

        prompt = f"Text to analyze:\n{text}"
        
        try:
            response = await self.gemini.generate_structured_text(prompt, format_instructions)
            
            # Process the response to extract quick notes and key takeaways
            parts = response.split("Key Takeaways:")
            if len(parts) != 2:
                raise ValueError("Invalid response format from AI")
                
            notes_section = parts[0].replace("Quick Notes:", "").strip()
            quick_notes = [
                note.strip("- ").strip()
                for note in notes_section.split("\n")
                if note.strip() and note.strip("- ").strip()
            ]
            
            takeaways_section = parts[1].strip()
            key_takeaways = [
                takeaway.strip("- ").strip()
                for takeaway in takeaways_section.split("\n")
                if takeaway.strip() and takeaway.strip("- ").strip()
            ]
            
            if not quick_notes or not key_takeaways:
                raise ValueError("Empty summary sections generated")
                
            return DocumentSummary(
                quick_notes=quick_notes,
                key_takeaways=key_takeaways
            )
        except Exception as e:
            print(f"Error generating summary: {e}")
            raise HTTPException(
                status_code=500,
                detail="Failed to generate summary. Please try again with a different text or contact support."
            )

