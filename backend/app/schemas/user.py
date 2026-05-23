from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: int | None = None
    suspicion_level: int = 0


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: int
    name: str
    email: str
    age: int | None
    suspicion_level: int

    class Config:
        from_attributes = True
