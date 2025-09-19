from pydantic import BaseModel
from typing import List

class DocumentSummary(BaseModel):
    quick_notes: List[str]
    key_takeaways: List[str]

class SummarizeRequest(BaseModel):
    text: str