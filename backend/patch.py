with open('c:\\VreBRO\\backend\\routers\\admin.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('@router.', '@protected_router.')

imports = """from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
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

router = APIRouter()
protected_router = APIRouter(dependencies=[Depends(get_current_admin)])

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
"""

content = content.split('router = APIRouter()')[1]

with open('c:\\VreBRO\\backend\\routers\\admin.py', 'w', encoding='utf-8') as f:
    f.write(imports + content + '\nrouter.include_router(protected_router)\n')
