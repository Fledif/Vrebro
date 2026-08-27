from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from contextlib import asynccontextmanager
from database import engine
from models.base import Base

# Import all models here so metadata is aware of them
import models.product
import models.order
import models.user
from routers import admin, catalog, orders, ai

import asyncio
from bot import bot, dp

import sqlite3
import httpx

from aiogram.types import Update
from fastapi import Request

async def keep_awake():
    """Background task to ping the server every 3 minutes to keep it awake on Render."""
    while True:
        await asyncio.sleep(180)
        try:
            async with httpx.AsyncClient() as client:
                await client.get("https://vrebro.onrender.com/", headers={"User-Agent": "Render-Keep-Alive-Bot/1.0"})
            print("Keep-awake ping sent successfully.")
        except Exception as e:
            print(f"Keep-awake ping failed: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-migrate database for Render's persistent disk
    try:
        with sqlite3.connect("vrebro.db") as conn:
            conn.execute("ALTER TABLE orders ADD COLUMN delivery_cost FLOAT DEFAULT 0.0")
    except Exception as e:
        print(f"Migration: {e}") # Expected if column already exists

    try:
        with sqlite3.connect("vrebro.db") as conn:
            conn.execute("ALTER TABLE products ADD COLUMN is_weighted BOOLEAN DEFAULT 0")
            conn.execute("ALTER TABLE products ADD COLUMN weight_step INTEGER")
            conn.execute("ALTER TABLE order_items ADD COLUMN product_name VARCHAR")
            conn.execute("ALTER TABLE products ADD COLUMN cross_sell_ids VARCHAR")
    except Exception as e:
        print(f"Migration for products/order_items: {e}")

    try:
        with sqlite3.connect("vrebro.db") as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS store_settings (
                    key VARCHAR PRIMARY KEY,
                    value VARCHAR NOT NULL
                )
            """)
    except Exception as e:
        print(f"Migration: {e}")

    # Initialize DB
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Run safe migrations for both SQLite and PostgreSQL
    from sqlalchemy import text
    migration_queries = [
        "ALTER TABLE products ADD COLUMN is_promo BOOLEAN DEFAULT FALSE",
        "ALTER TABLE products ADD COLUMN promo_price FLOAT",
        "ALTER TABLE products ADD COLUMN is_weighted BOOLEAN DEFAULT FALSE",
        "ALTER TABLE products ADD COLUMN weight_step INTEGER",
        "ALTER TABLE products ADD COLUMN stock_quantity FLOAT",
        "ALTER TABLE products ADD COLUMN is_out_of_stock BOOLEAN DEFAULT FALSE",
        "ALTER TABLE products ADD COLUMN cross_sell_ids VARCHAR",
        "ALTER TABLE orders ADD COLUMN delivery_cost FLOAT DEFAULT 0.0",
        "ALTER TABLE order_items ADD COLUMN product_name VARCHAR",
        "ALTER TABLE users ADD COLUMN cashback_balance FLOAT DEFAULT 0.0",
        "ALTER TABLE orders ADD COLUMN cashback_used FLOAT DEFAULT 0.0",
        "ALTER TABLE orders ADD COLUMN cashback_earned FLOAT DEFAULT 0.0"
    ]
    # We must use separate connections/transactions for each query because in Postgres, 
    # a failed ALTER TABLE aborts the entire transaction block.
    for query in migration_queries:
        try:
            async with engine.begin() as conn:
                await conn.execute(text(query))
        except Exception:
            pass
            
    # Special migration for BIGINT which might have foreign key constraints
    try:
        async with engine.begin() as conn:
            # Check if it's already bigint
            res = await conn.execute(text("SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'telegram_id'"))
            row = res.fetchone()
            if row and row[0] == 'integer':
                # It's an integer, we need to upgrade to bigint
                # PostgreSQL requires dropping the FK first
                if conn.dialect.name == 'postgresql':
                    # Find constraint name
                    fk_res = await conn.execute(text("SELECT constraint_name FROM information_schema.key_column_usage WHERE table_name = 'orders' AND column_name = 'user_id' AND constraint_name LIKE '%fkey'"))
                    fk_row = fk_res.fetchone()
                    if fk_row:
                        fk_name = fk_row[0]
                        await conn.execute(text(f"ALTER TABLE orders DROP CONSTRAINT {fk_name}"))
                    
                    await conn.execute(text("ALTER TABLE users ALTER COLUMN telegram_id TYPE BIGINT"))
                    await conn.execute(text("ALTER TABLE orders ALTER COLUMN user_id TYPE BIGINT"))
                    
                    if fk_row:
                        await conn.execute(text(f"ALTER TABLE orders ADD CONSTRAINT {fk_name} FOREIGN KEY (user_id) REFERENCES users(telegram_id)"))
                else:
                    # SQLite just ignores ALTER COLUMN TYPE usually, but we don't need it for SQLite as it handles large ints automatically
                    pass
    except Exception as e:
        print(f"Failed to migrate BIGINT: {e}")
    
    if bot:
        render_url = os.getenv("RENDER_EXTERNAL_URL")
        web_app_url = os.getenv("WEB_APP_URL", "").replace("/miniapp", "")
        base_url = render_url if render_url else web_app_url
        if base_url:
            webhook_url = f"{base_url}/api/webhook"
            await bot.set_webhook(webhook_url, drop_pending_updates=True)
            print(f"Telegram Bot webhook set to {webhook_url}!")
        else:
            print("Telegram Bot webhook NOT SET: RENDER_EXTERNAL_URL or WEB_APP_URL missing.")
        
    keep_awake_task = asyncio.create_task(keep_awake())
        
    yield
    

    if keep_awake_task:
        keep_awake_task.cancel()

app = FastAPI(title="VreBRO Unified Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(ai.router, prefix="/api/admin/ai", tags=["ai"])
app.include_router(catalog.router, prefix="/api/catalog", tags=["catalog"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])

@app.post("/api/webhook")
async def telegram_webhook(request: Request):
    if not bot:
        return {"status": "bot_not_configured"}
    try:
        update_data = await request.json()
        update = Update.model_validate(update_data, context={"bot": bot})
        await dp.feed_update(bot, update)
    except Exception as e:
        print(f"Webhook processing error: {e}")
    return {"status": "ok"}

admin_path = os.path.join(os.path.dirname(__file__), "..", "admin-panel", "dist")
miniapp_path = os.path.join(os.path.dirname(__file__), "..", "miniapp", "frontend", "dist")

if os.path.exists(os.path.join(admin_path, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(admin_path, "assets")), name="admin_assets")

if os.path.exists(os.path.join(miniapp_path, "assets")):
    app.mount("/miniapp/assets", StaticFiles(directory=os.path.join(miniapp_path, "assets")), name="miniapp_assets")

@app.get("/miniapp")
@app.get("/miniapp/")
@app.get("/miniapp/{full_path:path}")
async def serve_miniapp(full_path: str = ""):
    file_path = os.path.join(miniapp_path, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
        
    if full_path.endswith(".js") or full_path.endswith(".css"):
        raise HTTPException(status_code=404, detail="Asset not found")
    
    index_path = os.path.join(miniapp_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return {"status": "ok", "message": "Mini App build not found"}

@app.get("/{full_path:path}")
async def serve_admin(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")
        
    if full_path.endswith(".js") or full_path.endswith(".css"):
        raise HTTPException(status_code=404, detail="Asset not found")
    
    file_path = os.path.join(admin_path, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    index_path = os.path.join(admin_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return {"status": "ok", "message": "Admin Panel build not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
