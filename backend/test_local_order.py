import asyncio
import os
os.environ["BOT_TOKEN"] = "1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi"
from database import engine
from models.base import Base
from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

async def setup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

asyncio.run(setup())

# Create a dummy category and product
from models.product import Category, Product
from database import SessionLocal
import datetime

async def seed():
    async with SessionLocal() as db:
        c = Category(name="TestCat")
        db.add(c)
        await db.commit()
        await db.refresh(c)
        
        p = Product(name="TestProd", price=100.0, category_id=c.id)
        db.add(p)
        await db.commit()
        await db.refresh(p)
        return p.id

prod_id = asyncio.run(seed())

order_data = {
    "user_id": 123456789,
    "customer_name": "Test Name",
    "phone": "+380501234567",
    "address": "Kyiv",
    "comment": "Test comment",
    "items": [
        {"product_id": prod_id, "quantity": 1}
    ]
}

response = client.post("/api/orders/", json=order_data)
print("STATUS:", response.status_code)
print("BODY:", response.text)
