import os
import time
import psutil
import httpx
from fastapi import APIRouter, Request
from datetime import datetime
from database import engine
from sqlalchemy import text

router = APIRouter(prefix="/api/monitor", tags=["Monitor"])

ENV_PATH = ".env"

@router.get("/healthz")
async def healthz():
    """Ultra-fast unauthenticated endpoint for Render health checks or UptimeRobot"""
    return {"status": "ok"}

@router.get("/health")
async def get_health_metrics(request: Request):
    metrics = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "system": {},
        "database": {},
        "telegram": {}
    }
    
    # Calculate API latency
    latencies = getattr(request.app.state, 'latencies', [])
    avg_latency = sum(latencies) / len(latencies) if latencies else 0
    metrics["system"]["api_latency_ms"] = round(avg_latency, 2)
    
    # 1. System
    metrics["system"]["cpu"] = psutil.cpu_percent(interval=None)  # None prevents blocking the async thread
    mem = psutil.virtual_memory()
    metrics["system"]["ram_percent"] = mem.percent
    metrics["system"]["ram_used_mb"] = mem.used // (1024**2)
    metrics["system"]["ram_total_mb"] = mem.total // (1024**2)
    
    disk = psutil.disk_usage('.')
    metrics["system"]["disk_percent"] = disk.percent
    
    # 2. Database (Using SQLAlchemy Engine from database.py)
    try:
        start = time.time()
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            ping = (time.time() - start) * 1000
            
            # Simple queries that work on both SQLite and PostgreSQL
            res_orders = await conn.execute(text("SELECT count(*) FROM orders WHERE status = 'NEW'"))
            stuck_orders = res_orders.scalar()
            
            res_stock = await conn.execute(text("SELECT count(*) FROM products WHERE stock_quantity < 0"))
            neg_stock = res_stock.scalar()
            
        metrics["database"]["status"] = "OK"
        metrics["database"]["ping_ms"] = round(ping, 2)
        metrics["database"]["stuck_orders"] = stuck_orders
        metrics["database"]["negative_stock"] = neg_stock
    except Exception as e:
        metrics["database"]["status"] = "FAIL"
        metrics["database"]["error"] = str(e)
        metrics["database"]["stuck_orders"] = 0
        metrics["database"]["negative_stock"] = 0
            
    # 3. Telegram
    bot_token = os.getenv("BOT_TOKEN")
    
    if not bot_token and os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("BOT_TOKEN="):
                    bot_token = line.split("=", 1)[1].strip().strip('"\'')
                    break
                    
    if bot_token:
        async with httpx.AsyncClient(timeout=3.0) as client:
            try:
                resp = await client.get(f"https://api.telegram.org/bot{bot_token}/getWebhookInfo")
                data = resp.json()
                if data.get("ok"):
                    metrics["telegram"]["status"] = "OK"
                    metrics["telegram"]["url"] = data['result'].get('url', '')
                    metrics["telegram"]["pending_updates"] = data['result'].get('pending_update_count', 0)
                else:
                    metrics["telegram"]["status"] = "FAIL"
                    metrics["telegram"]["error"] = data.get("description")
            except Exception as e:
                metrics["telegram"]["status"] = "FAIL"
                metrics["telegram"]["error"] = "Мережева помилка"
    else:
        metrics["telegram"]["status"] = "FAIL"
        metrics["telegram"]["error"] = "BOT_TOKEN not found"
        
    return metrics
