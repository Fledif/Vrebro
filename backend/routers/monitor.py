import os
import time
import psutil
import sqlite3
import httpx
from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/api/monitor", tags=["Monitor"])

DB_PATH = "vrebro.db"
ENV_PATH = ".env"
EXTERNAL_URL = "https://vrebro.onrender.com"

@router.get("/health")
async def get_health_metrics():
    metrics = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "system": {},
        "database": {},
        "telegram": {}
    }
    
    # 1. System
    metrics["system"]["cpu"] = psutil.cpu_percent(interval=0.1)
    mem = psutil.virtual_memory()
    metrics["system"]["ram_percent"] = mem.percent
    metrics["system"]["ram_used_mb"] = mem.used // (1024**2)
    metrics["system"]["ram_total_mb"] = mem.total // (1024**2)
    
    disk = psutil.disk_usage('.')
    metrics["system"]["disk_percent"] = disk.percent
    
    # 2. Database
    if not os.path.exists(DB_PATH):
        metrics["database"]["status"] = "FAIL"
        metrics["database"]["error"] = "DB not found"
    else:
        try:
            start = time.time()
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            ping = (time.time() - start) * 1000
            
            cursor.execute("SELECT count(*) FROM orders WHERE status = 'NEW' AND created_at < datetime('now', '-1 day')")
            stuck_orders = cursor.fetchone()[0]
            
            cursor.execute("SELECT count(*) FROM products WHERE stock_quantity < 0")
            neg_stock = cursor.fetchone()[0]
            
            conn.close()
            
            metrics["database"]["status"] = "OK"
            metrics["database"]["ping_ms"] = round(ping, 2)
            metrics["database"]["stuck_orders"] = stuck_orders
            metrics["database"]["negative_stock"] = neg_stock
        except Exception as e:
            metrics["database"]["status"] = "FAIL"
            metrics["database"]["error"] = str(e)
            
    # 3. Telegram
    bot_token = None
    if os.path.exists(ENV_PATH):
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
