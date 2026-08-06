import os

class Settings:
    PROJECT_NAME: str = "VreBRO Unified Backend"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/vrebro")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD_HASH: str = os.getenv("ADMIN_PASSWORD_HASH", "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW") # default hash for 'admin'
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super-secret-jwt-key")
    ADMIN_CHAT_ID: str = os.getenv("ADMIN_CHAT_ID", "")
settings = Settings()
