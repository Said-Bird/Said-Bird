from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./saidbird.db"
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
