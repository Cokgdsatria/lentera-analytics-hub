from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="LENTERA_",
        extra="ignore",
    )

    app_name: str = "Lentera Analytics Hub API"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./lentera.db"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    jwt_secret_key: str = Field(default="dev-secret-change-me")
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 12

    admin_email: str = "admin@resolv.com"
    admin_password: str = "admin123"

    upload_dir: str = "./storage/evidence"
    max_upload_size_mb: int = 10
    allowed_upload_types: str = "application/pdf,image/png,image/jpeg"

    sklearn_pipeline_path: str | None = None

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def allowed_upload_type_set(self) -> set[str]:
        return {
            content_type.strip()
            for content_type in self.allowed_upload_types.split(",")
            if content_type.strip()
        }

    @property
    def upload_dir_path(self) -> Path:
        return Path(self.upload_dir).expanduser().resolve()


@lru_cache
def get_settings() -> Settings:
    return Settings()
