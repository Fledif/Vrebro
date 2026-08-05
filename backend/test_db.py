import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.base import Base
from models.product import Category, Product
from models.order import Order, OrderItem
from models.user import User, Admin
from config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def test_db():
    # 1. Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # 2. Insert test data
    async with async_session() as session:
        # Category
        cat = Category(name="Burgers")
        session.add(cat)
        await session.commit()
        await session.refresh(cat)

        # Product
        prod = Product(category_id=cat.id, name="Cheeseburger", price=150.0)
        session.add(prod)
        await session.commit()
        await session.refresh(prod)

        # Order
        order = Order(
            customer_name="John", 
            phone="123", 
            address="Street", 
            total_price=150.0,
            status="NEW"
        )
        session.add(order)
        await session.commit()
        await session.refresh(order)

        # Order Item
        item = OrderItem(order_id=order.id, product_id=prod.id, quantity=1, price_at_purchase=150.0)
        session.add(item)
        await session.commit()
        
    # 3. Read back
    async with async_session() as session:
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        
        stmt = select(Order).options(selectinload(Order.items)).where(Order.id == 1)
        result = await session.execute(stmt)
        read_order = result.scalar_one()
        
        print("=== DB TEST SUCCESS ===")
        print(f"Read Order ID: {read_order.id}, Status: {read_order.status}, Customer: {read_order.customer_name}")
        for i in read_order.items:
            print(f" - Item: Product ID {i.product_id}, Qty: {i.quantity}")

if __name__ == "__main__":
    asyncio.run(test_db())
