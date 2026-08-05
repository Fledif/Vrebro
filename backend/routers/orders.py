from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db
from models.order import Order, OrderItem
from models.product import Product
from schemas.order_schema import OrderSchema, OrderCreate
import uuid

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
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} is inactive")
            
        validated_items.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price_at_purchase": product.price
        })
        total_price += product.price * item.quantity

    order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    
    new_order = Order(
        user_id=order_data.user_id,
        order_number=order_number,
        total_price=total_price,
        customer_name=order_data.customer_name,
        phone=order_data.phone,
        address=order_data.address,
        comment=order_data.comment,
        status="NEW"
    )
    db.add(new_order)
    await db.flush() # To get the new_order.id
    
    for item_data in validated_items:
        new_item = OrderItem(
            order_id=new_order.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            price_at_purchase=item_data["price_at_purchase"]
        )
        db.add(new_item)
        
    await db.commit()
    await db.refresh(new_order)
    
    # Eager load the items for the response
    from sqlalchemy.orm import selectinload
    from sqlalchemy.future import select
    result = await db.execute(select(Order).options(selectinload(Order.items).selectinload(OrderItem.product)).where(Order.id == new_order.id))
    return result.scalars().first()
