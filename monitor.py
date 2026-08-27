import os
import sys
import time
import sqlite3
import socket
import asyncio
import httpx
import psutil
from datetime import datetime

# Налаштування
DB_PATH = "backend/vrebro.db"
ENV_PATH = "backend/.env"
API_BASE_URL = "http://127.0.0.1:8000"
EXTERNAL_URL = "https://vrebro.onrender.com"

# Кольори для терміналу
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

results = {"passed": 0, "failed": 0, "warnings": 0}

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}=== {text} ==={Colors.ENDC}")

def report_pass(test_name, details=""):
    print(f"{Colors.OKGREEN}[PASS]{Colors.ENDC} {test_name} {f'- {details}' if details else ''}")
    results["passed"] += 1

def report_fail(test_name, details=""):
    print(f"{Colors.FAIL}[FAIL]{Colors.ENDC} {test_name} {f'- {details}' if details else ''}")
    results["failed"] += 1

def report_warn(test_name, details=""):
    print(f"{Colors.WARNING}[WARN]{Colors.ENDC} {test_name} {f'- {details}' if details else ''}")
    results["warnings"] += 1

# ==========================================
# 1. Системні тести (System & Resources)
# ==========================================
def test_system_resources():
    print_header("1. Системні ресурси")
    
    # Test 1: CPU Usage
    cpu_percent = psutil.cpu_percent(interval=0.5)
    if cpu_percent < 80:
        report_pass("Навантаження CPU", f"{cpu_percent}%")
    else:
        report_warn("Навантаження CPU високе", f"{cpu_percent}%")

    # Test 2: RAM Usage
    mem = psutil.virtual_memory()
    if mem.percent < 90:
        report_pass("Використання RAM", f"{mem.percent}% ({mem.used // (1024**2)}MB / {mem.total // (1024**2)}MB)")
    else:
        report_warn("Використання RAM критичне", f"{mem.percent}%")

    # Test 3: Disk Space
    disk = psutil.disk_usage('.')
    if disk.percent < 90:
        report_pass("Вільне місце на диску", f"{100 - disk.percent}% вільно")
    else:
        report_warn("Мало місця на диску", f"{disk.percent}% зайнято")

    # Test 4: Environment Variables File
    if os.path.exists(ENV_PATH):
        report_pass("Файл .env існує", ENV_PATH)
    else:
        report_fail("Файл .env не знайдено", ENV_PATH)

# ==========================================
# 2. Тести Бази Даних (Database)
# ==========================================
def test_database():
    print_header("2. База даних SQLite")
    
    # Test 5: DB File Exists
    if os.path.exists(DB_PATH):
        report_pass("Файл БД існує", f"Розмір: {os.path.getsize(DB_PATH) // 1024} KB")
    else:
        report_fail("Файл БД не знайдено", DB_PATH)
        return

    try:
        start_time = time.time()
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Test 6: DB Connection Ping
        cursor.execute("SELECT 1")
        ping = (time.time() - start_time) * 1000
        report_pass("З'єднання з БД", f"Пінг: {ping:.2f} мс")

        # Test 7: Tables Integrity
        tables = ['users', 'products', 'categories', 'orders', 'order_items', 'store_settings']
        missing = []
        for table in tables:
            cursor.execute(f"SELECT count(name) FROM sqlite_master WHERE type='table' AND name='{table}'")
            if cursor.fetchone()[0] == 0:
                missing.append(table)
        
        if not missing:
            report_pass("Структура таблиць", "Всі 6 ключових таблиць присутні")
        else:
            report_fail("Відсутні таблиці", ", ".join(missing))

        # Test 8: Stuck Orders Check
        cursor.execute("SELECT count(*) FROM orders WHERE status = 'NEW' AND created_at < datetime('now', '-1 day')")
        stuck_orders = cursor.fetchone()[0]
        if stuck_orders == 0:
            report_pass("Завислі замовлення", "0 старих необроблених замовлень")
        else:
            report_warn("Завислі замовлення", f"Знайдено {stuck_orders} замовлень у статусі NEW, старіших за 1 день")

        # Test 9: Negative Stock Check
        cursor.execute("SELECT count(*) FROM products WHERE stock_quantity < 0")
        negative_stock = cursor.fetchone()[0]
        if negative_stock == 0:
            report_pass("Перевірка залишків", "Негативних залишків немає")
        else:
            report_fail("Помилка залишків", f"Знайдено {negative_stock} товарів з мінусовим залишком")

        # Test 10: Store Settings Check
        cursor.execute("SELECT count(*) FROM store_settings")
        settings_count = cursor.fetchone()[0]
        if settings_count > 0:
            report_pass("Налаштування магазину", f"Завантажено {settings_count} параметрів")
        else:
            report_warn("Налаштування магазину", "Таблиця порожня")

        conn.close()
    except Exception as e:
        report_fail("Помилка БД", str(e))

# ==========================================
# 3. Тести Backend API та Серверів (Network)
# ==========================================
def test_network_sync():
    print_header("3. Мережа та Backend API")
    
    # Test 11: Local Port Check
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', 8000))
    if result == 0:
        report_pass("Порт 8000", "Відкритий (Backend працює)")
    else:
        report_warn("Порт 8000", "Закритий (Локальний сервер не запущено?)")
    sock.close()

async def test_network_async():
    async with httpx.AsyncClient(timeout=5.0) as client:
        # Test 12: Catalog API (Public)
        try:
            start = time.time()
            resp = await client.get(f"{API_BASE_URL}/api/catalog/categories")
            ping = (time.time() - start) * 1000
            if resp.status_code == 200:
                report_pass("Public Catalog API", f"OK (Пінг: {ping:.1f} мс)")
            else:
                report_fail("Public Catalog API", f"Помилка {resp.status_code}")
        except Exception as e:
            report_warn("Public Catalog API", f"Недоступно локально ({e})")

        # Test 13: Admin API (Protected)
        try:
            resp = await client.get(f"{API_BASE_URL}/api/admin/orders")
            if resp.status_code == 401:
                report_pass("Admin API Захист", "Повертає 401 Unauthorized (Захищено JWT)")
            else:
                report_warn("Admin API Захист", f"Неочікуваний код: {resp.status_code}")
        except Exception:
            report_warn("Admin API Захист", "Пропущено")

        # Test 14: Miniapp Frontend Route
        try:
            resp = await client.get(f"{API_BASE_URL}/miniapp/")
            if resp.status_code == 200:
                report_pass("Miniapp Frontend", "Віддає HTML")
            else:
                report_fail("Miniapp Frontend", f"Помилка {resp.status_code}")
        except Exception:
            pass

        # Test 15: Admin Panel Route
        try:
            resp = await client.get(f"{API_BASE_URL}/")
            if resp.status_code == 200:
                report_pass("Admin Panel Frontend", "Віддає HTML")
            else:
                report_fail("Admin Panel Frontend", f"Помилка {resp.status_code}")
        except Exception:
            pass

        # Test 16: External Webhook Endpoint Health
        try:
            resp = await client.post(f"{API_BASE_URL}/api/webhook", json={})
            # Should return bot_not_configured or error since it's empty, but shouldn't 404
            if resp.status_code != 404:
                report_pass("Ендпоінт Webhook", f"Існує (Код: {resp.status_code})")
            else:
                report_fail("Ендпоінт Webhook", "Відсутній (404)")
        except Exception:
            pass

# ==========================================
# 4. Тести Telegram Bot API (Telegram)
# ==========================================
async def test_telegram_bot():
    print_header("4. Telegram Bot API")
    
    # Read bot token from .env manually to not depend on python-dotenv in the script
    bot_token = None
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("BOT_TOKEN="):
                    bot_token = line.split("=", 1)[1].strip().strip('"\'')
                    break
    
    if not bot_token:
        report_fail("Токен Бота", "Не знайдено BOT_TOKEN у .env")
        return

    async with httpx.AsyncClient(timeout=10.0) as client:
        # Test 17: getMe (Ping Telegram API)
        try:
            start = time.time()
            resp = await client.get(f"https://api.telegram.org/bot{bot_token}/getMe")
            ping = (time.time() - start) * 1000
            data = resp.json()
            if data.get("ok"):
                bot_username = data['result']['username']
                report_pass("Зв'язок з Telegram API", f"Пінг: {ping:.1f} мс (Бот: @{bot_username})")
            else:
                report_fail("Зв'язок з Telegram API", f"Помилка токена: {data.get('description')}")
        except Exception as e:
            report_fail("Зв'язок з Telegram API", str(e))
            return

        # Test 18: getWebhookInfo
        try:
            resp = await client.get(f"https://api.telegram.org/bot{bot_token}/getWebhookInfo")
            data = resp.json()
            if data.get("ok"):
                url = data['result'].get('url', '')
                pending = data['result'].get('pending_update_count', 0)
                if url:
                    report_pass("Webhook Status", f"Підключено до: {url}")
                    
                    # Test 19: Pending Updates Alert
                    if pending > 50:
                        report_warn("Оновлення Telegram", f"Багато необроблених повідомлень: {pending}")
                    else:
                        report_pass("Черга повідомлень Telegram", f"{pending} повідомлень в черзі (ОК)")
                else:
                    report_warn("Webhook Status", "Webhook не встановлено (бот працює в режимі Polling або вимкнений)")
            else:
                report_fail("Webhook Status", data.get("description"))
        except Exception as e:
            report_fail("Webhook Status", str(e))

# ==========================================
# 5. Перевірка зовнішнього деплою (Render)
# ==========================================
async def test_external_deploy():
    print_header("5. Зовнішній сервер (Render)")
    
    # Test 20: External URL Ping
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            start = time.time()
            resp = await client.get(EXTERNAL_URL)
            ping = (time.time() - start) * 1000
            if resp.status_code == 200:
                report_pass("Зовнішній доступ", f"OK (Пінг: {ping:.1f} мс)")
            else:
                report_warn("Зовнішній доступ", f"Віддає код {resp.status_code}")
        except Exception as e:
            report_warn("Зовнішній доступ", f"Недоступно ({e})")

def main():
    print(f"\n{Colors.OKCYAN}{Colors.BOLD}🚀 Запуск VreBRO Monitoring System (Health Check){Colors.ENDC}")
    print(f"Час: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Run sync tests
    test_system_resources()
    test_database()
    test_network_sync()
    
    # Run async tests
    asyncio.run(test_network_async())
    asyncio.run(test_telegram_bot())
    asyncio.run(test_external_deploy())
    
    # Summary
    print_header("РЕЗУЛЬТАТИ")
    print(f"✅ Успішно: {Colors.OKGREEN}{results['passed']}{Colors.ENDC}")
    print(f"⚠️ Попереджень: {Colors.WARNING}{results['warnings']}{Colors.ENDC}")
    print(f"❌ Помилок: {Colors.FAIL}{results['failed']}{Colors.ENDC}\n")
    
    if results['failed'] > 0:
        print(f"{Colors.FAIL}{Colors.BOLD}Система має критичні помилки!{Colors.ENDC}")
        sys.exit(1)
    elif results['warnings'] > 0:
        print(f"{Colors.WARNING}{Colors.BOLD}Система працює, але є зауваження.{Colors.ENDC}")
    else:
        print(f"{Colors.OKGREEN}{Colors.BOLD}Система працює ідеально! 🚀{Colors.ENDC}")

if __name__ == "__main__":
    main()
