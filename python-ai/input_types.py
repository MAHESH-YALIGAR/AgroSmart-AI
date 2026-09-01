from pydantic import BaseModel
from typing import Annotated, TypedDict, List, Dict, Any, Optional
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
# 1. Define Request and Response Pydantic Schemas
class ChatRequest(BaseModel):
    userId: str
    prompt: str
    latitude: float
    longitude: float
    language:str
    # custom_model_output:str
    


class ChatResponse(BaseModel):
    status: str
    reply: str
    
    
class MasterGraphState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages] # Maps "messages" key
    latitude: float                                      # Maps "latitude" key
    longitude: float                                     # Maps "longitude" key
    userId: str                                          # Maps "userId" key
    custom_model_output: Optional[Dict[str, Any]]  
    language:str