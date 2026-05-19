"""Configuration settings for the backend application."""

from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Palmo Backend"
    debug: bool = True
    database_url: str = "sqlite:///./test.db"


settings = Settings()
