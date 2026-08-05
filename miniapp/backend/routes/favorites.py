from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.future import select
from sqlalchemy import delete
from database.engine import async_session_maker
from app.models.favorite import Favorite
from app.models.product import Product
from schemas import ProductSchema
from pydantic import BaseModel

router = APIRouter()

async def get_db():
    async with async_session_maker() as session:
        yield session

class FavoriteRequest(BaseModel):
    user_id: int
    product_id: int

@router.get("/{user_id}", response_model=List[ProductSchema])
async def get_favorites(user_id: int, db = Depends(get_db)):
    stmt = select(Product).join(Favorite, Favorite.product_id == Product.id).where(Favorite.user_id == user_id)
    result = await db.execute(stmt)
    products = result.scalars().all()
    return products

@router.post("/")
async def add_favorite(req: FavoriteRequest, db = Depends(get_db)):
    stmt = select(Favorite).where(Favorite.user_id == req.user_id, Favorite.product_id == req.product_id)
    result = await db.execute(stmt)
    if result.scalars().first():
        return {"status": "already added"}
        
    fav = Favorite(user_id=req.user_id, product_id=req.product_id)
    db.add(fav)
    await db.commit()
    return {"status": "added"}

@router.delete("/")
async def remove_favorite(req: FavoriteRequest, db = Depends(get_db)):
    stmt = delete(Favorite).where(Favorite.user_id == req.user_id, Favorite.product_id == req.product_id)
    await db.execute(stmt)
    await db.commit()
    return {"status": "removed"}
