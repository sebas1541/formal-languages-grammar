"""Application configuration module."""
from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables."""

    model_config = SettingsConfigDict(env_prefix="GRAMMAR_", env_file=".env", extra="ignore")

    app_name: str = "Formal Grammar API"
    api_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./app.db"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached settings instance."""

    return Settings()
