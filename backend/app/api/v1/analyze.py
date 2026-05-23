import json
import logging
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

logger = logging.getLogger(__name__)
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.analysis import AnalysisRecord
from app.models.user import User
from app.schemas.analysis import AnalysisResult, AnalyzeRequest, AnalyzeResponse
from app.services.ai_service import analyze_audio, analyze_transcript

router = APIRouter()


@router.post("/", response_model=AnalyzeResponse)
def analyze(
    body: AnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = analyze_transcript(body.transcript, body.duration_seconds)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    record = AnalysisRecord(
        user_id=current_user.id,
        image_id=body.image_id,
        transcript=body.transcript,
        total_words=result.total_words,
        pronoun_ratio=result.pronoun_ratio,
        speech_rate=result.speech_rate,
        filler_count=result.filler_count,
        avg_sentence_length=result.avg_sentence_length,
        risk_level=result.risk_level,
        risk_description=result.risk_description,
        recommended_activities=json.dumps(result.recommended_activities, ensure_ascii=False),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return AnalyzeResponse(record_id=record.id, transcript=body.transcript, result=result, created_at=record.created_at)


@router.post("/audio", response_model=AnalyzeResponse)
async def analyze_audio_endpoint(
    audio: UploadFile = File(...),
    image_id: str = Form(None),
    duration_seconds: float = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="오디오 데이터가 없습니다")

    # 코덱 정보 제거 (예: audio/webm;codecs=opus → audio/webm)
    raw_mime = audio.content_type or "audio/webm"
    mime_type = raw_mime.split(";")[0].strip()

    logger.info("audio upload: size=%d mime=%s", len(audio_bytes), mime_type)

    try:
        transcript, result = analyze_audio(audio_bytes, mime_type, duration_seconds)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    record = AnalysisRecord(
        user_id=current_user.id,
        image_id=image_id,
        transcript=transcript,
        total_words=result.total_words,
        pronoun_ratio=result.pronoun_ratio,
        speech_rate=result.speech_rate,
        filler_count=result.filler_count,
        avg_sentence_length=result.avg_sentence_length,
        risk_level=result.risk_level,
        risk_description=result.risk_description,
        recommended_activities=json.dumps(result.recommended_activities, ensure_ascii=False),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return AnalyzeResponse(record_id=record.id, transcript=transcript, result=result, created_at=record.created_at)


@router.get("/history", response_model=List[AnalyzeResponse])
def get_history(
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = (
        db.query(AnalysisRecord)
        .filter(AnalysisRecord.user_id == current_user.id)
        .order_by(AnalysisRecord.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [
        AnalyzeResponse(
            record_id=r.id,
            result=AnalysisResult(
                total_words=r.total_words,
                pronoun_ratio=r.pronoun_ratio,
                speech_rate=r.speech_rate,
                filler_count=r.filler_count,
                avg_sentence_length=r.avg_sentence_length,
                risk_level=r.risk_level,
                risk_description=r.risk_description,
                recommended_activities=json.loads(r.recommended_activities or "[]"),
            ),
            created_at=r.created_at,
        )
        for r in records
    ]
