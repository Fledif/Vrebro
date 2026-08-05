from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.engine import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from schemas import OrderSchema
from pydantic import BaseModel
from typing import List

router = APIRouter()

class OrderItemUpdate(BaseModel):
    id: int
    quantity: float

class OrderUpdate(BaseModel):
    status: str
    items: List[OrderItemUpdate]

@router.get("/orders", response_model=List[OrderSchema])
def get_admin_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return orders

@router.put("/orders/{order_id}", response_model=OrderSchema)
def update_order(order_id: int, update_data: OrderUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update status
    order.status = update_data.status
    
    # Update items weight/quantity and recalculate total
    new_total = 0
    for update_item in update_data.items:
        db_item = db.query(OrderItem).filter(OrderItem.id == update_item.id, OrderItem.order_id == order_id).first()
        if db_item:
            db_item.quantity = update_item.quantity
            new_total += db_item.quantity * db_item.price_at_purchase
            
    order.total_price = new_total
    
    db.commit()
    db.refresh(order)
    return order
