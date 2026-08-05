from fastapi import APIRouter, Depends, HTTPException
from typing import List
from database.engine import async_session_maker
from app.repositories.order import OrderRepository
from app.models.order import Order, OrderItem
from schemas import OrderCreate, OrderSchema
import datetime

router = APIRouter()

async def get_db():
    async with async_session_maker() as session:
        yield session

@router.post("/", response_model=OrderSchema)
async def create_order(order_data: OrderCreate, db = Depends(get_db)):
    repo = OrderRepository(db)
    
    order = Order(
        user_id=order_data.user_id,
        order_number=f"M-{int(datetime.datetime.now().timestamp())}",
        status="NEW",
        total_price=order_data.total_price
    )
    
    db.add(order)
    await db.commit()
    await db.refresh(order)
    
    for item in order_data.items:
        db_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_purchase=item.price_at_purchase
        )
        db.add(db_item)
    
    await db.commit()
    await db.refresh(order)
    
    return order

@router.get("/{user_id}", response_model=List[OrderSchema])
async def get_user_orders(user_id: int, db = Depends(get_db)):
    repo = OrderRepository(db)
    # the existing repo might not have get_by_user_id with eager loading items
    # let's just use existing or query directly
    orders = await repo.get_user_orders(user_id)
    return orders
