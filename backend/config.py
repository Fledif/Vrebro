import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "VreBRO Unified Backend"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///vrebro.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD_HASH: str = os.getenv("ADMIN_PASSWORD_HASH", "$2b$12$K1nUaH54sL4n2e3aQJ/YzeR6j/J5D6mC7oV9E8C0aK/lqV/N.8cO") # bcrypt hash for "admin"
    IMGBB_API_KEY: str = os.getenv("IMGBB_API_KEY", "")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super-secret-jwt-key")
    ADMIN_CHAT_ID: str = os.getenv("ADMIN_CHAT_ID", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    PHOTOROOM_API_KEY: str = os.getenv("PHOTOROOM_API_KEY", "sk_pr_vrebro_e95378a892b3dd210abc818f6c793af655f01b9b")
    MASTER_PASSWORD: str = os.getenv("MASTER_PASSWORD", "admin123")
settings = Settings()
