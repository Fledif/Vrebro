from sqlalchemy import Column, String
from .base import Base

class StoreSettings(Base):
    __tablename__ = 'store_settings'
    
    key = Column(String, primary_key=True, index=True)
    value = Column(String, nullable=False)
