from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    icon: Optional[str] = Field(default=None, max_length=100)
    sort_order: int = 0

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategorySchema(CategoryBase):
    id: int

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    category_id: int
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: float = Field(..., gt=0)
    image_url: str = Field(..., min_length=1, max_length=255)
    is_active: bool = True
    is_promo: bool = False
    promo_price: Optional[float] = Field(default=None, gt=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductSchema(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
