from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.analysis import AnalysisRecord
from app.schemas.analysis import AnalyzeRequest, AnalyzeResponse
from app.services.ai_service import analyze_transcript

router = APIRouter()


@router.post("/", response_model=AnalyzeResponse)
def analyze(body: AnalyzeRequest, db: Session = Depends(get_db)):
    try:
        result = analyze_transcript(body.transcript, body.duration_seconds)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    record = AnalysisRecord(
        user_id=1,  # TODO: JWT 인증 연동 후 실제 user_id로 교체
        image_id=body.image_id,
        transcript=body.transcript,
        total_words=result.total_words,
        pronoun_ratio=result.pronoun_ratio,
        speech_rate=result.speech_rate,
        filler_count=result.filler_count,
        avg_sentence_length=result.avg_sentence_length,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return AnalyzeResponse(record_id=record.id, result=result, created_at=record.created_at)
