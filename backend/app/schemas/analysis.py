from datetime import datetime

from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    transcript: str
    image_id: str | None = None
    duration_seconds: float | None = None  # 발화 속도 계산용


class AnalysisResult(BaseModel):
    total_words: int
    pronoun_ratio: float
    speech_rate: float
    filler_count: int
    avg_sentence_length: float


class AnalyzeResponse(BaseModel):
    record_id: int
    result: AnalysisResult
    created_at: datetime
