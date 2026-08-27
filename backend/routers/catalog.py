from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from sqlalchemy import or_

from database import get_db
from models.product import Category, Product
from schemas.product_schema import CategorySchema, ProductSchema
from models.settings import StoreSettings
from datetime import datetime
import zoneinfo

router = APIRouter()

@router.get("/categories", response_model=List[CategorySchema])
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.sort_order))
    return result.scalars().all()

@router.get("/products", response_model=List[ProductSchema])
async def get_products(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(Product).where(Product.is_active == True)
    
    if category_id:
        query = query.where(Product.category_id == category_id)
        
    if search:
        query = query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%")
            )
        )
        
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/products/{id}", response_model=ProductSchema)
async def get_product(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == id, Product.is_active == True))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or inactive")
    return product

@router.get("/store_status")
async def get_store_status(db: AsyncSession = Depends(get_db)):
    enabled_setting = await db.get(StoreSettings, "working_hours_enabled")
    open_setting = await db.get(StoreSettings, "working_hours_start")
    close_setting = await db.get(StoreSettings, "working_hours_end")
    
    is_enabled = enabled_setting.value.lower() == "true" if enabled_setting else False
    open_time = open_setting.value if open_setting else "10:00"
    close_time = close_setting.value if close_setting else "22:00"
    
    is_open = True
    
    if is_enabled:
        try:
            tz = zoneinfo.ZoneInfo("Europe/Kiev")
            now = datetime.now(tz)
            
            open_h, open_m = map(int, open_time.split(":"))
            close_h, close_m = map(int, close_time.split(":"))
            
            current_minutes = now.hour * 60 + now.minute
            open_minutes = open_h * 60 + open_m
            close_minutes = close_h * 60 + close_m
            
            if close_minutes < open_minutes:
                # crosses midnight
                if current_minutes >= open_minutes or current_minutes < close_minutes:
                    is_open = True
                else:
                    is_open = False
            else:
                # normal day
                if open_minutes <= current_minutes < close_minutes:
                    is_open = True
                else:
                    is_open = False
        except Exception as e:
            print(f"Error evaluating store hours: {e}")
            pass
            
    return {
        "is_open": is_open,
        "open_time": open_time,
        "close_time": close_time,
        "is_enabled": is_enabled
    }
