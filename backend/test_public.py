import asyncio
import httpx
from main import app
from database import engine
from models.base import Base

async def test_public_api():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("=== SELF TEST ===")
        # 1. Admin creates category and products
        resp = await client.post("/api/admin/categories", json={"name": "Burgers"})
        assert resp.status_code == 201
        category_id = resp.json()["id"]
        
        resp = await client.post("/api/admin/products", json={
            "name": "Classic Burger",
            "price": 10.0,
            "image_url": "burger.jpg",
            "category_id": category_id
        })
        assert resp.status_code == 201
        product_id = resp.json()["id"]

        resp = await client.post("/api/admin/products", json={
            "name": "Hidden Burger",
            "price": 12.0,
            "image_url": "hidden.jpg",
            "category_id": category_id
        })
        assert resp.status_code == 201
        hidden_product_id = resp.json()["id"]
        
        # Hide the second product
        await client.patch(f"/api/admin/products/{hidden_product_id}/toggle")

        # 2. Test Catalog (Public)
        resp = await client.get("/api/catalog/categories")
        assert resp.status_code == 200
        print(f"Catalog Categories: {len(resp.json())}")

        resp = await client.get("/api/catalog/products")
        assert resp.status_code == 200
        products = resp.json()
        print(f"Catalog Products (Active Only): {len(products)}")
        assert len(products) == 1, "Should only see 1 active product"
        assert products[0]["id"] == product_id

        # 3. Test Order Creation
        order_data = {
            "user_id": 1,
            "customer_name": "Test Cust",
            "phone": "999888777",
            "address": "123 Main St",
            "items": [
                {"product_id": product_id, "quantity": 2, "price_at_purchase": 10.0}
            ],
            "total_price": 20.0
        }
        resp = await client.post("/api/orders/", json=order_data)
        if resp.status_code != 201:
            print("Failed to create order:", resp.text)
        assert resp.status_code == 201
        order = resp.json()
        print(f"Order created successfully! ID: {order['id']}, Status: {order['status']}")

if __name__ == "__main__":
    asyncio.run(test_public_api())
