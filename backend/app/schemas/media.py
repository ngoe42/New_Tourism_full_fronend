from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class MediaResponse(BaseModel):
    id: int
    url: str
    public_id: Optional[str] = None
    filename: Optional[str] = None
    file_size: Optional[int] = None
    content_type: Optional[str] = None
    tour_id: Optional[int] = None
    uploaded_by: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MediaUploadResponse(BaseModel):
    id: int
    url: str
    public_id: Optional[str] = None
    filename: Optional[str] = None
