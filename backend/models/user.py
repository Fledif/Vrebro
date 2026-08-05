from sqlalchemy import Column, Integer, String, DateTime
import datetime
from .base import Base

class User(Base):
    __tablename__ = 'users'
    
    telegram_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=True)
    username = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Admin(Base):
    __tablename__ = 'admins'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
