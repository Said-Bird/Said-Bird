import json

from fastapi import APIRouter, Depends

from app.api.v1.auth import serialize_user
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserProfile

router = APIRouter()


@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    return UserProfile(**serialize_user(current_user))
