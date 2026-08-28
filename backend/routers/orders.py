from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db
from models.order import Order, OrderItem
from models.product import Product
from models.settings import StoreSettings
from schemas.order_schema import OrderSchema, OrderCreate
import uuid
from config import settings
from bot import bot
from websocket_manager import manager

router = APIRouter()

@router.post("/", response_model=OrderSchema, status_code=status.HTTP_201_CREATED)
async def create_order(order_data: OrderCreate, db: AsyncSession = Depends(get_db)):
    if not order_data.items:
        raise HTTPException(status_code=400, detail="Order must have items")
        
    total_price = 0.0
    validated_items = []
    
    for item in order_data.items:
        product = await db.get(Product, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product {product.name} is inactive")
        if product.is_out_of_stock:
            raise HTTPException(status_code=400, detail=f"Товар {product.name} закінчився")
        
        # Check stock quantity if it's set
        if product.stock_quantity is not None:
            if item.quantity > product.stock_quantity:
                raise HTTPException(status_code=400, detail=f"Недостатньо товару {product.name}. В наявності: {product.stock_quantity}")
            # Deduct stock
            product.stock_quantity -= item.quantity
            
        actual_price = product.promo_price if product.is_promo and product.promo_price is not None else product.price
        validated_items.append({
            "product_id": item.product_id,
            "product_name": product.name,
            "quantity": item.quantity,
            "price_at_purchase": actual_price
        })
        total_price += actual_price * item.quantity

    from models.user import User
    
    # Upsert user
    user = await db.get(User, order_data.user_id)
    if not user:
        user = User(telegram_id=order_data.user_id, first_name=order_data.customer_name)
        db.add(user)
        await db.flush()
        
    cashback_enabled_setting = await db.get(StoreSettings, "cashback_enabled")
    cashback_percentage_setting = await db.get(StoreSettings, "cashback_percentage")
    cashback_max_pay_setting = await db.get(StoreSettings, "cashback_max_pay_percent")
    
    cb_enabled = cashback_enabled_setting.value.lower() == "true" if cashback_enabled_setting else False
    cb_percentage = float(cashback_percentage_setting.value) if cashback_percentage_setting else 0.0
    cb_max_pay = float(cashback_max_pay_setting.value) if cashback_max_pay_setting else 100.0

    cashback_used = 0.0
    cashback_earned = 0.0
    
    if cb_enabled:
        if order_data.use_cashback_amount and order_data.use_cashback_amount > 0:
            if order_data.use_cashback_amount > (user.cashback_balance or 0.0):
                raise HTTPException(status_code=400, detail="Not enough cashback balance")
            
            max_allowed = total_price * (cb_max_pay / 100.0)
            if order_data.use_cashback_amount > max_allowed:
                raise HTTPException(status_code=400, detail=f"Cannot pay more than {cb_max_pay}% with cashback")
                
            cashback_used = order_data.use_cashback_amount
            user.cashback_balance = (user.cashback_balance or 0.0) - cashback_used
            total_price -= cashback_used
            if total_price < 0: total_price = 0.0
            
        cashback_earned = total_price * (cb_percentage / 100.0)
        
    order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    
    new_order = Order(
        user_id=order_data.user_id,
        order_number=order_number,
        total_price=total_price,
        customer_name=order_data.customer_name,
        phone=order_data.phone,
        address=order_data.address,
        comment=order_data.comment,
        cashback_used=cashback_used,
        cashback_earned=cashback_earned,
        status="NEW"
    )
    db.add(new_order)
    await db.flush() # To get the new_order.id
    
    for item_data in validated_items:
        new_item = OrderItem(
            order_id=new_order.id,
            product_id=item_data["product_id"],
            product_name=item_data["product_name"],
            quantity=item_data["quantity"],
            price_at_purchase=item_data["price_at_purchase"]
        )
        db.add(new_item)
        
    await db.commit()
    await db.refresh(new_order)
    
    await manager.broadcast("update")
    
    # Send admin notifications
    if settings.BOT_TOKEN:
        try:
            items_text = "\n".join([f"- {i['product_name']} x{i['quantity']} ({i['price_at_purchase']} грн)" for i in validated_items])
            msg = f"🚨 <b>НОВЕ ЗАМОВЛЕННЯ {new_order.order_number}</b>\n\n" \
                  f"👤 Ім'я: {new_order.customer_name}\n" \
                  f"📞 Тел: {new_order.phone}\n" \
                  f"📍 Адреса: {new_order.address}\n" \
                  f"💬 Комент: {new_order.comment or '-'}\n\n" \
                  f"🛒 Товари:\n{items_text}\n\n" \
                  f"💰 Сума: <b>{new_order.total_price} грн</b>"
                  
            # Get all admins from DB
            from sqlalchemy import text
            res = await db.execute(text("SELECT telegram_id FROM users WHERE role IN ('admin', 'superadmin')"))
            admins = res.fetchall()
            
            import httpx
            async with httpx.AsyncClient(timeout=5.0) as client:
                for admin_row in admins:
                    if admin_row[0]:
                        try:
                            await client.post(
                                f"https://api.telegram.org/bot{settings.BOT_TOKEN}/sendMessage",
                                json={"chat_id": admin_row[0], "text": msg, "parse_mode": "HTML"}
                            )
                        except Exception as e:
                            print(f"Failed to send to admin {admin_row[0]}: {e}")
        except Exception as e:
            print(f"Failed to process admin notifications: {e}")
            
    # Send customer notification
    if settings.BOT_TOKEN and new_order.user_id:
        try:
            customer_msg = f"✅ Ваше замовлення <b>{new_order.order_number}</b> успішно оформлено!\n\n" \
                           f"💰 Сума до оплати: <b>{new_order.total_price} грн</b>\n" \
                           f"Статус замовлення можна відстежувати у вашому профілі."
            import httpx
            async with httpx.AsyncClient(timeout=5.0) as client:
                await client.post(
                    f"https://api.telegram.org/bot{settings.BOT_TOKEN}/sendMessage",
                    json={"chat_id": new_order.user_id, "text": customer_msg, "parse_mode": "HTML"}
                )
        except Exception as e:
            print(f"Failed to send customer notification: {e}")
    
    # Eager load the items for the response
    from sqlalchemy.orm import selectinload
    from sqlalchemy.future import select
    result = await db.execute(select(Order).options(selectinload(Order.items).selectinload(OrderItem.product)).where(Order.id == new_order.id))
    return result.scalars().first()

@router.get("/user/{user_id}", response_model=List[OrderSchema])
async def get_user_orders(user_id: int, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import selectinload
    from sqlalchemy.future import select
    
    query = select(Order).options(selectinload(Order.items).selectinload(OrderItem.product)).where(Order.user_id == user_id).order_by(Order.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/user_profile/{user_id}")
async def get_user_profile(user_id: int, db: AsyncSession = Depends(get_db)):
    from models.user import User
    user = await db.get(User, user_id)
    if not user:
        return {"cashback_balance": 0.0}
    return {"cashback_balance": user.cashback_balance or 0.0}
