from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class AdminRead(BaseModel):
    id: int
    email: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminRead
