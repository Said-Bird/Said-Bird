from datetime import datetime
from typing import List

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
    risk_level: int                        # 0=정상, 1=주의, 2=경계, 3=위험
    risk_description: str                  # 위험도 설명
    recommended_activities: List[str]      # 추천 활동 목록


class AnalyzeResponse(BaseModel):
    record_id: int
    result: AnalysisResult
    created_at: datetime
