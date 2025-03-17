from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str

@router.post("/login")
async def login(request: LoginRequest):
    if not request.username:
        raise HTTPException(status_code=400, detail="Username is required")
    
    return {"token": "fake-jwt-token", "username": request.username}
