import json
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import TokenResponse, UserLogin, UserProfile, UserRegister

MAX_ATTEMPTS = 5
LOCK_MINUTES = 15

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


def serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "age": user.age,
        "suspicion_level": user.suspicion_level,
        "interests": json.loads(user.interests) if user.interests else [],
    }


@router.post("/register", response_model=UserProfile)
def register(body: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다")

    user = User(
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        age=body.age,
        suspicion_level=body.suspicion_level,
        interests=json.dumps(body.interests, ensure_ascii=False),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserProfile(**serialize_user(user))


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다")

    if user.locked_until and datetime.utcnow() < user.locked_until:
        raise HTTPException(status_code=403, detail="계정이 잠겼습니다. 15분 후 시도해주세요")

    if not verify_password(body.password, user.hashed_password):
        user.failed_attempts += 1
        if user.failed_attempts >= MAX_ATTEMPTS:
            user.locked_until = datetime.utcnow() + timedelta(minutes=LOCK_MINUTES)
        db.commit()
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다")

    user.failed_attempts = 0
    user.locked_until = None
    db.commit()

    return TokenResponse(access_token=create_access_token(str(user.id)))
