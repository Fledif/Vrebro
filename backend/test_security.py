import asyncio
import httpx
from main import app
from database import engine
from models.base import Base
from models.product import Product
from models.order import Order
from database import async_session
from sqlalchemy.future import select

async def run_security_test():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Setup Data
        res = await client.post("/api/admin/categories", json={"name": "Drinks"})
        cat_id = res.json()["id"]
        
        # Product 1 - Active, Price 100
        res = await client.post("/api/admin/products", json={
            "name": "Expensive Drink", "price": 100.0, "image_url": "1.jpg", "category_id": cat_id
        })
        prod_active_id = res.json()["id"]
        
        # Product 2 - Inactive, Price 50
        res = await client.post("/api/admin/products", json={
            "name": "Hidden Drink", "price": 50.0, "image_url": "2.jpg", "category_id": cat_id
        })
        prod_inactive_id = res.json()["id"]
        await client.patch(f"/api/admin/products/{prod_inactive_id}/toggle")
        
        print("=== BEFORE ===")
        print("Earlier, users could send 'total_price: 1' and 'price_at_purchase: 1' to bypass the DB price.")
        print("=== AFTER ===")
        print("Now, the client payload does not contain prices. The server computes everything.")
        print("=== SECURITY TEST ===")
        
        # Test 1: Order active product (Should succeed and auto-calculate 100 * 2 = 200)
        res = await client.post("/api/orders/", json={
            "user_id": 1,
            "customer_name": "Alice",
            "phone": "12345",
            "address": "Home",
            "items": [{"product_id": prod_active_id, "quantity": 2}]
        })
        assert res.status_code == 201
        order = res.json()
        if order["total_price"] == 200.0:
            print(f"[PASSED] Server successfully computed total price from DB: {order['total_price']}")
        else:
            print(f"[FAILED] Price computation failed. Got: {order['total_price']}")
            
        # Test 2: Order inactive product (Should 400)
        res = await client.post("/api/orders/", json={
            "user_id": 1,
            "customer_name": "Bob",
            "phone": "12345",
            "address": "Home",
            "items": [{"product_id": prod_inactive_id, "quantity": 1}]
        })
        if res.status_code == 400:
            print(f"[PASSED] Server blocked ordering inactive product (status {res.status_code})")
        else:
            print(f"[FAILED] Server allowed inactive product! Status {res.status_code}")
            
        # Test 3: Order non-existent product (Should 404)
        res = await client.post("/api/orders/", json={
            "user_id": 1,
            "customer_name": "Charlie",
            "phone": "12345",
            "address": "Home",
            "items": [{"product_id": 9999, "quantity": 1}]
        })
        if res.status_code == 404:
            print(f"[PASSED] Server blocked non-existent product (status {res.status_code})")
        else:
            print(f"[FAILED] Server allowed non-existent product! Status {res.status_code}")
            
if __name__ == "__main__":
    asyncio.run(run_security_test())
