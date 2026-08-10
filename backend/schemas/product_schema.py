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
    image_url: Optional[str] = Field(default=None, max_length=255)
    is_active: Optional[bool] = True
    is_promo: Optional[bool] = False
    promo_price: Optional[float] = Field(default=None, gt=0)
    is_weighted: Optional[bool] = False
    weight_step: Optional[int] = None
    stock_quantity: Optional[float] = None
    is_out_of_stock: Optional[bool] = False

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductSchema(ProductBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
