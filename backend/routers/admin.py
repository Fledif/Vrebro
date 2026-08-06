from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordRequestForm
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from database import get_db
from models.product import Category, Product
from models.order import Order, OrderItem
from schemas.product_schema import CategorySchema, CategoryCreate, CategoryUpdate, ProductSchema, ProductCreate, ProductUpdate
from schemas.order_schema import OrderSchema, OrderStatusUpdate
from auth import get_current_admin, verify_password, create_access_token
from config import settings
from bot import bot
from websocket_manager import manager

router = APIRouter()
protected_router = APIRouter(dependencies=[Depends(get_current_admin)])

@router.websocket("/ws/orders")
async def websocket_orders(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        token = await websocket.receive_text()
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        if payload.get("sub") != settings.ADMIN_USERNAME:
            raise Exception("Invalid token")
        while True:
            await websocket.receive_text()
    except Exception:
        manager.disconnect(websocket)

@router.post("/login")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username != settings.ADMIN_USERNAME or not verify_password(form_data.password, settings.ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

from sqlalchemy import delete
from models.user import User

@protected_router.post("/purge")
async def purge_db(db: AsyncSession = Depends(get_db)):
    await db.execute(delete(OrderItem))
    await db.execute(delete(Order))
    await db.execute(delete(Product))
    await db.execute(delete(Category))
    await db.execute(delete(User))
    await db.commit()
    return {"message": "All data cleared"}


# --- CATEGORY CRUD ---

@protected_router.post("/categories", response_model=CategorySchema, status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryCreate, db: AsyncSession = Depends(get_db)):
    if not category.name.strip():
        raise HTTPException(status_code=400, detail="Category name cannot be empty")
        
    result = await db.execute(select(Category).where(Category.name == category.name))
    existing_category = result.scalars().first()
    if existing_category:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
        
    new_category = Category(**category.model_dump())
    db.add(new_category)
    await db.commit()
    await db.refresh(new_category)
    return new_category

@protected_router.get("/categories", response_model=List[CategorySchema])
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.sort_order))
    return result.scalars().all()

@protected_router.get("/categories/{id}", response_model=CategorySchema)
async def get_category(id: int, db: AsyncSession = Depends(get_db)):
    category = await db.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@protected_router.put("/categories/{id}", response_model=CategorySchema)
async def update_category(id: int, category_update: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    category = await db.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    if not category_update.name.strip():
        raise HTTPException(status_code=400, detail="Category name cannot be empty")
        
    if category.name != category_update.name:
        result = await db.execute(select(Category).where(Category.name == category_update.name))
        existing_category = result.scalars().first()
        if existing_category:
            raise HTTPException(status_code=400, detail="Category with this name already exists")
            
    for key, value in category_update.model_dump().items():
        setattr(category, key, value)
        
    await db.commit()
    await db.refresh(category)
    return category

@protected_router.delete("/categories/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(id: int, db: AsyncSession = Depends(get_db)):
    category = await db.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    result = await db.execute(select(Product).where(Product.category_id == id))
    products = result.scalars().all()
    if products:
        raise HTTPException(status_code=400, detail="Cannot delete category with associated products")
        
    await db.delete(category)
    await db.commit()
    return None

# --- PRODUCT CRUD ---

@protected_router.post("/products", response_model=ProductSchema, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate, db: AsyncSession = Depends(get_db)):
    if not product.name.strip():
        raise HTTPException(status_code=400, detail="Product name cannot be empty")
    if not product.image_url.strip():
        raise HTTPException(status_code=400, detail="Image URL cannot be empty")
    if product.price <= 0:
        raise HTTPException(status_code=400, detail="Price must be greater than 0")
        
    category = await db.get(Category, product.category_id)
    if not category:
        raise HTTPException(status_code=400, detail="Category does not exist")
        
    new_product = Product(**product.model_dump())
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return new_product

@protected_router.get("/products", response_model=List[ProductSchema])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))
    return result.scalars().all()

@protected_router.get("/products/{id}", response_model=ProductSchema)
async def get_product(id: int, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@protected_router.put("/products/{id}", response_model=ProductSchema)
async def update_product(id: int, product_update: ProductUpdate, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if not product_update.name.strip():
        raise HTTPException(status_code=400, detail="Product name cannot be empty")
    if not product_update.image_url.strip():
        raise HTTPException(status_code=400, detail="Image URL cannot be empty")
    if product_update.price <= 0:
        raise HTTPException(status_code=400, detail="Price must be greater than 0")
        
    if product.category_id != product_update.category_id:
        category = await db.get(Category, product_update.category_id)
        if not category:
            raise HTTPException(status_code=400, detail="Category does not exist")
            
    for key, value in product_update.model_dump().items():
        setattr(product, key, value)
        
    await db.commit()
    await db.refresh(product)
    return product

@protected_router.delete("/products/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(id: int, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    await db.delete(product)
    await db.commit()
    return None

@protected_router.patch("/products/{id}/toggle", response_model=ProductSchema)
async def toggle_product(id: int, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product.is_active = not product.is_active
    await db.commit()
    await db.refresh(product)
    return product

# --- ORDER MANAGEMENT ---

ALLOWED_STATUSES = {"NEW", "ACCEPTED", "COOKING", "READY", "DELIVERING", "COMPLETED", "CANCELLED"}

@protected_router.get("/orders", response_model=List[OrderSchema])
async def get_orders(
    status_filter: Optional[str] = None, 
    skip: int = 0, 
    limit: int = 50, 
    db: AsyncSession = Depends(get_db)
):
    query = select(Order).options(selectinload(Order.items).selectinload(OrderItem.product)).order_by(Order.created_at.desc())
    if status_filter:
        query = query.where(Order.status == status_filter)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@protected_router.get("/orders/{id}", response_model=OrderSchema)
async def get_order(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).options(selectinload(Order.items).selectinload(OrderItem.product)).where(Order.id == id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@protected_router.patch("/orders/{id}/status", response_model=OrderSchema)
async def update_order_status(id: int, status_update: OrderStatusUpdate, db: AsyncSession = Depends(get_db)):
    if status_update.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {', '.join(ALLOWED_STATUSES)}")
        
    result = await db.execute(select(Order).options(selectinload(Order.items).selectinload(OrderItem.product)).where(Order.id == id))
    order = result.scalars().first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = status_update.status
    await db.commit()
    await db.refresh(order)
    
    await manager.broadcast("update")
    
    if bot and order.user_id:
        try:
            await bot.send_message(
                chat_id=order.user_id, 
                text=f"📦 Ваше замовлення #{order.order_number} змінило статус на: *{order.status}*",
                parse_mode="Markdown"
            )
        except Exception as e:
            print(f"Failed to send telegram notification: {e}")
            
    return order

router.include_router(protected_router)
