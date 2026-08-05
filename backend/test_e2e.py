import asyncio
import httpx
from main import app
from database import engine
from models.base import Base

async def run_audit():
    # Reset DB
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("=== E2E AUDIT START ===")
        
        # 1. Create Category
        res = await client.post("/api/admin/categories", json={"name": "Ребра"})
        assert res.status_code == 201
        cat_id = res.json()["id"]
        
        # 2. Create Products
        products = [
            {"name": "Ребра BBQ", "price": 15.5, "image_url": "ribs.jpg", "description": "Smoked BBQ ribs", "category_id": cat_id},
            {"name": "Стейк Рібай", "price": 25.0, "image_url": "steak.jpg", "description": "Juicy ribeye", "category_id": cat_id},
            {"name": "Картопля фрі", "price": 4.5, "image_url": "fries.jpg", "description": "Crispy fries", "category_id": cat_id},
            {"name": "Кола", "price": 2.0, "image_url": "cola.jpg", "description": "Cold drink", "category_id": cat_id}
        ]
        
        prod_ids = []
        for p in products:
            res = await client.post("/api/admin/products", json=p)
            assert res.status_code == 201
            prod_ids.append(res.json()["id"])
            
        print("[PASSED] Created Category and 4 Products")
        
        # 3. Test Errors
        # - Invalid image_url (empty)
        res = await client.post("/api/admin/products", json={
            "name": "Invalid Prod", "price": 10.0, "image_url": "", "category_id": cat_id
        })
        if res.status_code == 400:
            print("[PASSED] Validation: Empty image_url correctly blocked")
        else:
            print(f"[FAILED] Validation: Empty image_url allowed (status {res.status_code})")
            
        # - Product without category (invalid category id)
        res = await client.post("/api/admin/products", json={
            "name": "No Cat", "price": 10.0, "image_url": "a.jpg", "category_id": 999
        })
        if res.status_code == 400:
            print("[PASSED] Validation: Product without valid category correctly blocked")
        else:
            print(f"[FAILED] Validation: Product without valid category allowed (status {res.status_code})")
            
        # 4. Catalog view check
        res = await client.get("/api/catalog/products")
        assert len(res.json()) == 4
        print("[PASSED] Catalog returned all 4 active products")
        
        # 5. Order Creation (simulating Cart -> Checkout)
        # Assuming missing phone/name is handled by frontend or Pydantic
        res = await client.post("/api/orders/", json={
            "user_id": 123,
            "customer_name": "", # empty name
            "phone": "123456789",
            "address": "Test",
            "items": [{"product_id": prod_ids[0], "quantity": 1, "price_at_purchase": 15.5}],
            "total_price": 15.5
        })
        if res.status_code == 422 or res.status_code == 400:
            print("[PASSED] Validation: Missing/Empty customer name blocked")
        else:
            print(f"[FAILED] Validation: Empty name allowed (status {res.status_code})")
            
        res = await client.post("/api/orders/", json={
            "user_id": 123,
            "customer_name": "John",
            "phone": "", # empty phone
            "address": "Test",
            "items": [{"product_id": prod_ids[0], "quantity": 1, "price_at_purchase": 15.5}],
            "total_price": 15.5
        })
        if res.status_code == 422 or res.status_code == 400:
            print("[PASSED] Validation: Missing/Empty phone blocked")
        else:
            print(f"[FAILED] Validation: Empty phone allowed (status {res.status_code})")
            
        # Empty cart
        res = await client.post("/api/orders/", json={
            "user_id": 123,
            "customer_name": "John",
            "phone": "123456",
            "address": "Test",
            "items": [], # empty cart
            "total_price": 0.0
        })
        if res.status_code == 400 or res.status_code == 422:
            print("[PASSED] Validation: Empty cart correctly blocked")
        else:
            print(f"[FAILED] Validation: Empty cart allowed (status {res.status_code})")
            
        # Valid order
        res = await client.post("/api/orders/", json={
            "user_id": 123,
            "customer_name": "Valid John",
            "phone": "123456789",
            "address": "Valid Address",
            "items": [
                {"product_id": prod_ids[0], "quantity": 2, "price_at_purchase": 15.5},
                {"product_id": prod_ids[1], "quantity": 1, "price_at_purchase": 25.0}
            ],
            "total_price": 56.0
        })
        assert res.status_code == 201
        print("[PASSED] Valid Order created in DB")
        
if __name__ == "__main__":
    asyncio.run(run_audit())
