from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator, model_validator
from typing import List, Optional
import secrets


class Settings(BaseSettings):
    APP_NAME: str = "Nelson Tour and Safari API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DATABASE_URL: str
    DATABASE_URL_SYNC: Optional[str] = None

    REDIS_URL: Optional[str] = None

    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    AWS_BUCKET_NAME: Optional[str] = None

    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    FIRST_ADMIN_EMAIL: str = "admin@nelsontoursandsafari.com"
    FIRST_ADMIN_PASSWORD: str = "ChangeMe123!"

    RESEND_API_KEY: Optional[str] = None
    EMAIL_FROM: str = "Nelson Tours & Safari <onboarding@resend.dev>"

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: str) -> str:
        return v

    @model_validator(mode="after")
    def normalise_db_urls(self) -> "Settings":
        def _to_asyncpg(url: str) -> str:
            if url.startswith("postgres://"):
                return "postgresql+asyncpg://" + url[len("postgres://"):]
            if url.startswith("postgresql://"):
                return "postgresql+asyncpg://" + url[len("postgresql://"):]
            return url

        def _to_psycopg2(url: str) -> str:
            if url.startswith("postgres://"):
                return "postgresql+psycopg2://" + url[len("postgres://"):]
            if url.startswith("postgresql://"):
                return "postgresql+psycopg2://" + url[len("postgresql://"):]
            if url.startswith("postgresql+asyncpg://"):
                return "postgresql+psycopg2://" + url[len("postgresql+asyncpg://"):]
            return url

        self.DATABASE_URL = _to_asyncpg(self.DATABASE_URL)
        if not self.DATABASE_URL_SYNC:
            self.DATABASE_URL_SYNC = _to_psycopg2(self.DATABASE_URL)
        else:
            self.DATABASE_URL_SYNC = _to_psycopg2(self.DATABASE_URL_SYNC)
        return self

    def get_allowed_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
