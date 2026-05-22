from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    CLERK_SECRET_KEY: str

    ALPHA_VANTAGE_KEY: str

    @property
    def clerk_jwks_url(self) -> str:
        return f"{self.CLERK_ISSUER.rstrip('/')}/.well-known/jwks.json"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
