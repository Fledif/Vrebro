from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CategorySchema(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None
    sort_order: int

    class Config:
        from_attributes = True

class ProductSchema(BaseModel):
    id: int
    category_id: int
    name: str
    description: Optional[str] = None
    price: float
    product_type: str
    photo_id: Optional[str] = None
    stock_quantity: int
    views_count: int
    rating: float
    is_active: bool

    class Config:
        from_attributes = True
        
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: float
    price_at_purchase: float

class OrderCreate(BaseModel):
    user_id: int
    customer_name: str
    phone: str
    address: str
    comment: Optional[str] = ""
    items: List[OrderItemCreate]
    total_price: float
    
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
    user_id: int
    order_number: str
    status: str
    total_price: float
    created_at: datetime
    items: List[OrderItemSchema] = []

    class Config:
        from_attributes = True
