from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text

from app.db.database import Base


class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    image_id = Column(String, nullable=True)
    transcript = Column(Text, nullable=False)

    # 5가지 임상 지표
    total_words = Column(Integer, nullable=True)
    pronoun_ratio = Column(Float, nullable=True)
    speech_rate = Column(Float, nullable=True)
    filler_count = Column(Integer, nullable=True)
    avg_sentence_length = Column(Float, nullable=True)

    # 위험도 및 추천
    risk_level = Column(Integer, nullable=True)
    risk_description = Column(Text, nullable=True)
    recommended_activities = Column(Text, nullable=True)  # JSON 문자열로 저장

    created_at = Column(DateTime, default=datetime.utcnow)
