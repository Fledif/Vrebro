import os

class Settings:
    PROJECT_NAME: str = "VreBRO Unified Backend"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/vrebro")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")
    
settings = Settings()
