from pydantic import BaseModel


# 1. Define Request and Response Pydantic Schemas
class ChatRequest(BaseModel):
    userId: str
    prompt: str
    latitude: float
    longitude: float


class ChatResponse(BaseModel):
    status: str
    reply: str
    
