from fastapi import APIRouter, Depends, HTTPException
from typing import List
from database.engine import async_session_maker
from app.repositories.product import ProductRepository, CategoryRepository
from schemas import ProductSchema, CategorySchema

router = APIRouter()

async def get_db():
    async with async_session_maker() as session:
        yield session

@router.get("/categories", response_model=List[CategorySchema])
async def get_categories(db = Depends(get_db)):
    repo = CategoryRepository(db)
    categories = await repo.get_all()
    return categories

@router.get("/products", response_model=List[ProductSchema])
async def get_products(category_id: int = None, db = Depends(get_db)):
    repo = ProductRepository(db)
    if category_id:
        products = await repo.get_by_category(category_id)
    else:
        products = await repo.get_all()
    return products

@router.get("/products/{product_id}", response_model=ProductSchema)
async def get_product(product_id: int, db = Depends(get_db)):
    repo = ProductRepository(db)
    product = await repo.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.views_count += 1
    await db.commit()
    return product
