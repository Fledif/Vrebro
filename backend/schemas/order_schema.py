from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from .product_schema import ProductSchema

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: float

class OrderCreate(BaseModel):
    user_id: int
    customer_name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=1, max_length=30)
    address: str = Field(..., min_length=1, max_length=255)
    comment: Optional[str] = Field(default="", max_length=1000)
    items: List[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status: str

class OrderItemSchema(BaseModel):
    id: int
    product_id: int
    quantity: float
    price_at_purchase: float
    product: Optional[ProductSchema] = None

    class Config:
        from_attributes = True

class OrderSchema(BaseModel):
    id: int
    user_id: Optional[int] = None
    order_number: str
    status: str
    total_price: float
    customer_name: str
    phone: str
    address: str
    comment: Optional[str] = None
    created_at: datetime
    items: List[OrderItemSchema] = []

    class Config:
        from_attributes = True
