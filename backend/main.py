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

async def run_bot():
    if not bot: return
    while True:
        try:
            await bot.delete_webhook(drop_pending_updates=True)
            await dp.start_polling(bot)
        except Exception as e:
            print(f"Bot polling error: {e}")
            await asyncio.sleep(5)

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
    
    bot_task = None
    if bot:
        bot_task = asyncio.create_task(run_bot())
        print("Telegram Bot started with resilient polling!")
        
    keep_awake_task = asyncio.create_task(keep_awake())
        
    yield
    
    if bot_task:
        bot_task.cancel()
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
