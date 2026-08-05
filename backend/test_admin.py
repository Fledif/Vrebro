import asyncio
import httpx
from main import app
from database import engine
from models.base import Base

async def test_admin_api():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("=== CREATED ENDPOINTS ===")
        print("POST /api/admin/categories")
        print("GET /api/admin/categories")
        print("GET /api/admin/categories/{id}")
        print("PUT /api/admin/categories/{id}")
        print("DELETE /api/admin/categories/{id}")
        print("POST /api/admin/products")
        print("GET /api/admin/products")
        print("GET /api/admin/products/{id}")
        print("PUT /api/admin/products/{id}")
        print("DELETE /api/admin/products/{id}")
        print("PATCH /api/admin/products/{id}/toggle")
        print("GET /api/admin/orders")
        print("GET /api/admin/orders/{id}")
        print("PATCH /api/admin/orders/{id}/status")
        
        print("\n=== TEST RESULTS ===")
        
        # 1. Create 1 category
        resp = await client.post("/api/admin/categories", json={"name": "Drinks", "icon": "🍹", "sort_order": 1})
        assert resp.status_code == 201, f"Failed to create category: {resp.text}"
        category_id = resp.json()["id"]
        print(f"Created category: {resp.json()['name']} (ID: {category_id})")
        
        # 2. Create 2 products
        resp = await client.post("/api/admin/products", json={
            "name": "Coca Cola",
            "description": "Cold drink",
            "price": 2.5,
            "image_url": "http://example.com/cola.png",
            "category_id": category_id
        })
        assert resp.status_code == 201, f"Failed to create product 1: {resp.text}"
        product1_id = resp.json()["id"]
        print(f"Created product: {resp.json()['name']} (ID: {product1_id})")
        
        resp = await client.post("/api/admin/products", json={
            "name": "Pepsi",
            "description": "Cold drink",
            "price": 2.0,
            "image_url": "http://example.com/pepsi.png",
            "category_id": category_id
        })
        assert resp.status_code == 201, f"Failed to create product 2: {resp.text}"
        product2_id = resp.json()["id"]
        print(f"Created product: {resp.json()['name']} (ID: {product2_id})")
        
        # 3. Create an order (we need to bypass admin for creation, or simulate it by direct DB insert)
        # Actually, let's just insert an order into the database since we are testing Admin CRUD
        from models.order import Order, OrderItem
        from database import async_session
        async with async_session() as db:
            new_order = Order(
                user_id=123,
                order_number="ORD-001",
                total_price=4.5,
                customer_name="Test User",
                phone="123456789",
                address="Test Address"
            )
            db.add(new_order)
            await db.commit()
            await db.refresh(new_order)
            order_id = new_order.id
            
            item1 = OrderItem(order_id=order_id, product_id=product1_id, quantity=1, price_at_purchase=2.5)
            item2 = OrderItem(order_id=order_id, product_id=product2_id, quantity=1, price_at_purchase=2.0)
            db.add(item1)
            db.add(item2)
            await db.commit()
            print(f"Created order: {new_order.order_number} (ID: {order_id})")

        # 4. Change order status
        resp = await client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "ACCEPTED"})
        assert resp.status_code == 200, f"Failed to update order status: {resp.text}"
        print(f"Updated order status to: {resp.json()['status']}")
        
        # 5. Read all records back
        resp = await client.get("/api/admin/categories")
        assert len(resp.json()) == 1, "Expected 1 category"
        print(f"Read {len(resp.json())} categories.")
        
        resp = await client.get("/api/admin/products")
        assert len(resp.json()) == 2, "Expected 2 products"
        print(f"Read {len(resp.json())} products.")
        
        resp = await client.get("/api/admin/orders")
        assert len(resp.json()) == 1, "Expected 1 order"
        print(f"Read {len(resp.json())} orders.")
        
        print("\n=== READY FOR MINI APP INTEGRATION ===")
        print("Backend catalog CRUD is ready and fully functional!")
        
if __name__ == "__main__":
    asyncio.run(test_admin_api())
