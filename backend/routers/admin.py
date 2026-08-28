from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
import jwt
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from database import get_db
from models.product import Category, Product
from models.order import Order, OrderItem
from models.settings import StoreSettings
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
    is_valid = False
    
    if form_data.username == settings.ADMIN_USERNAME:
        try:
            is_valid = verify_password(form_data.password, settings.ADMIN_PASSWORD_HASH)
        except ValueError:
            # Fallback to the valid hash if the environment variable is broken
            fallback_hash = "$2b$12$SJSUXVhU3FcVZtaCahOJHOWxpZetwuvpUII17GrFWiSiQQonS5XwG"
            is_valid = verify_password(form_data.password, fallback_hash)
            
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

from sqlalchemy import delete, update
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

@protected_router.get("/dashboard/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order))
    orders = result.scalars().all()
    
    total_revenue = sum(order.total_price for order in orders if order.status != "CANCELLED")
    
    return {
        "total_revenue": total_revenue,
        "total_orders": len(orders)
    }

@protected_router.get("/imgbb-key")
async def get_imgbb_key():
    return {"key": settings.IMGBB_API_KEY}

@protected_router.post("/upload-image")
async def upload_image(image: UploadFile = File(...)):
    if not settings.IMGBB_API_KEY:
        raise HTTPException(status_code=500, detail="IMGBB_API_KEY is not configured on the server")
        
    image_bytes = await image.read()
    
    async with httpx.AsyncClient() as client:
        # ImgBB expects multipart/form-data
        files = {'image': (image.filename, image_bytes, image.content_type)}
        response = await client.post(
            f"https://api.imgbb.com/1/upload?key={settings.IMGBB_API_KEY}",
            files=files,
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"ImgBB error: {response.text}")
            
        data = response.json()
        if data.get("success"):
            return {"url": data["data"]["url"]}
        else:
            raise HTTPException(status_code=400, detail="Failed to upload to ImgBB")

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
        
    # Unlink from any order items to prevent Foreign Key constraints error
    await db.execute(update(OrderItem).where(OrderItem.product_id == id).values(product_id=None))
    
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

ALLOWED_STATUSES = {"NEW", "REVIEWED", "EDITED", "PACKING", "SHIPPED", "CONFIRMED", "CANCELLED"}

@protected_router.get("/orders", response_model=List[OrderSchema])
async def get_orders(
    status_filter: Optional[str] = None, 
    skip: int = 0, 
    limit: int = 500, 
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
        
    old_status = order.status
    order.status = status_update.status
    if status_update.delivery_cost is not None:
        order.delivery_cost = status_update.delivery_cost
        
    # Return stock if cancelled (only if track_stock is enabled)
    if old_status != "CANCELLED" and order.status == "CANCELLED":
        for item in order.items:
            if item.product and item.product.stock_quantity is not None and getattr(item.product, 'track_stock', False):
                item.product.stock_quantity += item.quantity
                if item.product.stock_quantity > 0:
                    item.product.is_out_of_stock = False
                
    # Deduct stock if un-cancelled
    if old_status == "CANCELLED" and order.status != "CANCELLED":
        for item in order.items:
            if item.product and item.product.stock_quantity is not None and getattr(item.product, 'track_stock', False):
                item.product.stock_quantity -= item.quantity
                
    # Add cashback to user if confirmed
    if old_status != "CONFIRMED" and order.status == "CONFIRMED":
        if order.cashback_earned and order.cashback_earned > 0 and order.user_id:
            from models.user import User
            user = await db.get(User, order.user_id)
            if user:
                user.cashback_balance = (user.cashback_balance or 0.0) + order.cashback_earned

    # Revoke cashback if un-confirmed
    if old_status == "CONFIRMED" and order.status != "CONFIRMED":
        if order.cashback_earned and order.cashback_earned > 0 and order.user_id:
            from models.user import User
            user = await db.get(User, order.user_id)
            if user:
                user.cashback_balance = max(0.0, (user.cashback_balance or 0.0) - order.cashback_earned)
        
    await db.commit()
    await db.refresh(order)
    
    await manager.broadcast("update")
    
    # Send Telegram push notification
    if settings.BOT_TOKEN and order.user_id:
        # Check if notifications are enabled in settings
        notifications_enabled_setting = await db.get(StoreSettings, "notifications_enabled")
        notifications_enabled = notifications_enabled_setting.value.lower() == "true" if notifications_enabled_setting else True
        
        if notifications_enabled:
            status_messages = {
                "REVIEWED": f"✅ Ваше замовлення <b>#{order.order_number}</b> переглянуто. Готуємо для вас!",
                "PACKING": f"🔥 Замовлення <b>#{order.order_number}</b> вже готується! Зовсім скоро...",
                "SHIPPED": f"🎉 Замовлення <b>#{order.order_number}</b> готове! Забирайте 😊",
                "CONFIRMED": f"💚 Замовлення <b>#{order.order_number}</b> підтверджено та оплачено!\n🎁 Нараховано {round(order.cashback_earned or 0, 2)} бонусів на ваш рахунок!" if (order.cashback_earned or 0) > 0 else f"💚 Замовлення <b>#{order.order_number}</b> підтверджено та оплачено!",
                "CANCELLED": f"❌ Замовлення <b>#{order.order_number}</b> на жаль скасовано. Звертайтесь знову!",
            }
            msg = status_messages.get(order.status)
            if msg:
                try:
                    import httpx
                    async with httpx.AsyncClient(timeout=5.0) as client:
                        resp = await client.post(
                            f"https://api.telegram.org/bot{settings.BOT_TOKEN}/sendMessage",
                            json={
                                "chat_id": order.user_id,
                                "text": msg,
                                "parse_mode": "HTML"
                            }
                        )
                        if resp.status_code != 200:
                            print(f"Telegram API error {resp.status_code} sending status to {order.user_id}: {resp.text}")
                except Exception as e:
                    print(f"Failed to send telegram notification: {e}")
            
    return order

from pydantic import BaseModel
class PaymentCardUpdate(BaseModel):
    card_number: str
    master_password: str
    is_enabled: bool = True

class StoreHoursUpdate(BaseModel):
    is_enabled: bool
    open_time: str
    close_time: str

class CashbackSettingsUpdate(BaseModel):
    is_enabled: bool
    percentage: float
    max_pay_percent: float

@router.get("/settings/payment_card")
async def get_payment_card(db: AsyncSession = Depends(get_db)):
    setting = await db.get(StoreSettings, "payment_card")
    enabled_setting = await db.get(StoreSettings, "payment_card_enabled")
    
    is_enabled = True
    if enabled_setting and enabled_setting.value.lower() == "false":
        is_enabled = False
        
    return {
        "card_number": setting.value if setting else "",
        "is_enabled": is_enabled
    }

@protected_router.post("/settings/payment_card")
async def update_payment_card(data: PaymentCardUpdate, db: AsyncSession = Depends(get_db)):
    if data.master_password != settings.MASTER_PASSWORD:
        raise HTTPException(status_code=403, detail="Invalid master password")
        
    setting = await db.get(StoreSettings, "payment_card")
    if not setting:
        setting = StoreSettings(key="payment_card", value=data.card_number)
        db.add(setting)
    else:
        setting.value = data.card_number
        
    enabled_setting = await db.get(StoreSettings, "payment_card_enabled")
    if not enabled_setting:
        enabled_setting = StoreSettings(key="payment_card_enabled", value=str(data.is_enabled).lower())
        db.add(enabled_setting)
    else:
        enabled_setting.value = str(data.is_enabled).lower()
        
    await db.commit()
    return {"status": "success", "card_number": setting.value, "is_enabled": data.is_enabled}

@protected_router.get("/settings/hours")
async def get_store_hours(db: AsyncSession = Depends(get_db)):
    enabled_setting = await db.get(StoreSettings, "working_hours_enabled")
    open_setting = await db.get(StoreSettings, "working_hours_start")
    close_setting = await db.get(StoreSettings, "working_hours_end")
    
    return {
        "is_enabled": enabled_setting.value.lower() == "true" if enabled_setting else False,
        "open_time": open_setting.value if open_setting else "10:00",
        "close_time": close_setting.value if close_setting else "22:00"
    }

@protected_router.post("/settings/hours")
async def update_store_hours(data: StoreHoursUpdate, db: AsyncSession = Depends(get_db)):
    settings_dict = {
        "working_hours_enabled": str(data.is_enabled).lower(),
        "working_hours_start": data.open_time,
        "working_hours_end": data.close_time
    }
    
    for key, value in settings_dict.items():
        setting = await db.get(StoreSettings, key)
        if not setting:
            setting = StoreSettings(key=key, value=value)
            db.add(setting)
        else:
            setting.value = value
            
    await db.commit()
    return {"status": "success"}

@protected_router.get("/settings/cashback")
async def get_cashback_settings(db: AsyncSession = Depends(get_db)):
    enabled_setting = await db.get(StoreSettings, "cashback_enabled")
    percentage_setting = await db.get(StoreSettings, "cashback_percentage")
    max_pay_setting = await db.get(StoreSettings, "cashback_max_pay_percent")
    
    return {
        "is_enabled": enabled_setting.value.lower() == "true" if enabled_setting else False,
        "percentage": float(percentage_setting.value) if percentage_setting else 0.0,
        "max_pay_percent": float(max_pay_setting.value) if max_pay_setting else 100.0
    }

@protected_router.post("/settings/cashback")
async def update_cashback_settings(data: CashbackSettingsUpdate, db: AsyncSession = Depends(get_db)):
    settings_dict = {
        "cashback_enabled": str(data.is_enabled).lower(),
        "cashback_percentage": str(data.percentage),
        "cashback_max_pay_percent": str(data.max_pay_percent)
    }
    
    for key, value in settings_dict.items():
        setting = await db.get(StoreSettings, key)
        if not setting:
            setting = StoreSettings(key=key, value=value)
            db.add(setting)
        else:
            setting.value = value
            
    await db.commit()
    return {"status": "success"}

class UserCashbackUpdate(BaseModel):
    cashback_balance: float

@protected_router.get("/users")
async def get_all_users(db: AsyncSession = Depends(get_db)):
    from models.user import User
    from sqlalchemy.future import select
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()

@protected_router.patch("/users/{user_id}/cashback")
async def update_user_cashback(user_id: int, data: UserCashbackUpdate, db: AsyncSession = Depends(get_db)):
    from models.user import User
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.cashback_balance = data.cashback_balance
    await db.commit()
    return {"status": "success"}

from typing import Any, Dict
import json

class StoreInfoUpdate(BaseModel):
    store_name: str = "VreBRO"
    store_address: str = ""
    store_phone: str = ""
    store_greeting: str = ""
    store_closed_message: str = "На жаль, ми зараз зачинені. Повертайтесь пізніше!"
    min_order_amount: float = 0.0
    avg_cooking_time: int = 30
    free_delivery_from: float = 0.0
    notifications_enabled: bool = True
    emergency_pause: bool = False
    settlement_name: str = "Самовивіз"

STORE_INFO_KEYS = [
    "store_name", "store_address", "store_phone", "store_greeting",
    "store_closed_message", "min_order_amount", "avg_cooking_time",
    "free_delivery_from", "notifications_enabled", "emergency_pause", "settlement_name"
]

@protected_router.get("/settings/store_info")
async def get_store_info(db: AsyncSession = Depends(get_db)):
    result = {}
    defaults = StoreInfoUpdate()
    for key in STORE_INFO_KEYS:
        setting = await db.get(StoreSettings, key)
        default_val = getattr(defaults, key)
        if setting:
            # Try to coerce type based on default
            if isinstance(default_val, bool):
                result[key] = setting.value.lower() == "true"
            elif isinstance(default_val, int):
                result[key] = int(setting.value)
            elif isinstance(default_val, float):
                result[key] = float(setting.value)
            else:
                result[key] = setting.value
        else:
            result[key] = default_val
    return result

@protected_router.post("/settings/store_info")
async def update_store_info(data: StoreInfoUpdate, db: AsyncSession = Depends(get_db)):
    updates = data.model_dump()
    for key, value in updates.items():
        setting = await db.get(StoreSettings, key)
        str_value = str(value).lower() if isinstance(value, bool) else str(value)
        if not setting:
            setting = StoreSettings(key=key, value=str_value)
            db.add(setting)
        else:
            setting.value = str_value
    await db.commit()
    return {"status": "success"}

# --- ANALYTICS ---

from sqlalchemy import func
from datetime import datetime, timedelta

@protected_router.get("/analytics/summary")
async def get_analytics_summary(db: AsyncSession = Depends(get_db)):
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)

    def make_summary(orders_list):
        completed = [o for o in orders_list if o.status not in ("CANCELLED",)]
        return {
            "count": len(completed),
            "revenue": round(sum(o.total_price for o in completed), 2),
            "avg_check": round(sum(o.total_price for o in completed) / len(completed), 2) if completed else 0
        }

    all_result = await db.execute(select(Order))
    all_orders = all_result.scalars().all()

    today_orders = [o for o in all_orders if o.created_at and o.created_at >= today_start]
    week_orders = [o for o in all_orders if o.created_at and o.created_at >= week_start]
    month_orders = [o for o in all_orders if o.created_at and o.created_at >= month_start]

    unique_users = len(set(o.user_id for o in all_orders if o.user_id))

    return {
        "today": make_summary(today_orders),
        "week": make_summary(week_orders),
        "month": make_summary(month_orders),
        "total_customers": unique_users
    }

@protected_router.get("/analytics/top_products")
async def get_top_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(OrderItem.product_name, func.sum(OrderItem.quantity).label("total_qty"), func.count(OrderItem.id).label("order_count"))
        .group_by(OrderItem.product_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(10)
    )
    rows = result.all()
    return [{"name": r.product_name or "Невідомий", "qty": float(r.total_qty or 0), "orders": r.order_count} for r in rows]

@protected_router.get("/analytics/revenue_chart")
async def get_revenue_chart(db: AsyncSession = Depends(get_db)):
    now = datetime.utcnow()
    result = await db.execute(select(Order).where(Order.status != "CANCELLED"))
    orders = result.scalars().all()

    chart = {}
    for i in range(29, -1, -1):
        day = (now - timedelta(days=i)).strftime("%d.%m")
        chart[day] = 0.0

    for order in orders:
        if order.created_at:
            day_str = order.created_at.strftime("%d.%m")
            if day_str in chart:
                chart[day_str] += order.total_price

    return [{"date": k, "revenue": round(v, 2)} for k, v in chart.items()]

router.include_router(protected_router)
