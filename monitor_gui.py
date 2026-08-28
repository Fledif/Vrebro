import os
import sys
import time
import sqlite3
import socket
import asyncio
import httpx
import psutil
import threading
from datetime import datetime

try:
    import customtkinter as ctk
except ImportError:
    print("Встановіть customtkinter: pip install customtkinter psutil httpx")
    sys.exit(1)

# Налаштування вигляду
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# Конфігурація
DB_PATH = "backend/vrebro.db"
ENV_PATH = "backend/.env"
API_BASE_URL = "http://127.0.0.1:8000"
EXTERNAL_URL = "https://vrebro.onrender.com"

class VrebroMonitorApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("VreBRO Live Monitor")
        self.geometry("980x750")
        self.minsize(850, 600)
        
        # Grid layout
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)
        
        # === SIDEBAR ===
        self.sidebar = ctk.CTkFrame(self, width=220, corner_radius=0)
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        self.sidebar.grid_rowconfigure(6, weight=1)
        
        self.logo_label = ctk.CTkLabel(self.sidebar, text="VreBRO\nLive Monitor", font=ctk.CTkFont(size=24, weight="bold"))
        self.logo_label.grid(row=0, column=0, padx=20, pady=(30, 10))
        
        self.pulse_label = ctk.CTkLabel(self.sidebar, text="● Оновлення в реал-таймі", text_color="#2ecc71", font=ctk.CTkFont(size=11, weight="bold"))
        self.pulse_label.grid(row=1, column=0, pady=(0, 20))
        
        self.btn_run = ctk.CTkButton(self.sidebar, text="Оновити вручну", height=40, font=ctk.CTkFont(weight="bold"), command=self.start_tests_once)
        self.btn_run.grid(row=2, column=0, padx=20, pady=10)
        
        self.live_mode = ctk.BooleanVar(value=True)
        self.switch_live = ctk.CTkSwitch(self.sidebar, text="Live Mode (3 сек)", variable=self.live_mode, command=self.toggle_live, progress_color="#e67e22")
        self.switch_live.grid(row=3, column=0, padx=20, pady=15)
        
        self.status_label = ctk.CTkLabel(self.sidebar, text="Ініціалізація...", text_color="gray", font=ctk.CTkFont(weight="bold"))
        self.status_label.grid(row=4, column=0, padx=20, pady=5)
        
        self.time_label = ctk.CTkLabel(self.sidebar, text="Останнє оновлення: --:--:--", text_color="gray", font=ctk.CTkFont(size=11))
        self.time_label.grid(row=5, column=0, padx=20, pady=0)
        
        # Summary
        self.summary_frame = ctk.CTkFrame(self.sidebar)
        self.summary_frame.grid(row=7, column=0, padx=20, pady=20, sticky="ew")
        
        self.lbl_pass = ctk.CTkLabel(self.summary_frame, text="✅ Пройдено: 0", text_color="#2ecc71", font=ctk.CTkFont(weight="bold"))
        self.lbl_pass.pack(anchor="w", padx=15, pady=(15, 5))
        
        self.lbl_warn = ctk.CTkLabel(self.summary_frame, text="⚠️ Увага: 0", text_color="#f1c40f", font=ctk.CTkFont(weight="bold"))
        self.lbl_warn.pack(anchor="w", padx=15, pady=5)
        
        self.lbl_fail = ctk.CTkLabel(self.summary_frame, text="❌ Помилки: 0", text_color="#e74c3c", font=ctk.CTkFont(weight="bold"))
        self.lbl_fail.pack(anchor="w", padx=15, pady=(5, 15))
        
        # === MAIN VIEW ===
        self.main_view = ctk.CTkScrollableFrame(self, fg_color="transparent")
        self.main_view.grid(row=0, column=1, sticky="nsew", padx=10, pady=10)
        
        # Categories
        self.categories = [
            "Системні ресурси", 
            "База даних SQLite", 
            "Мережа та Backend API", 
            "Telegram Bot API", 
            "Зовнішній сервер (Render)"
        ]
        self.sections = {}
        self.test_widgets = {}
        self.test_statuses = {}
        
        for cat in self.categories:
            cat_label = ctk.CTkLabel(self.main_view, text=cat, font=ctk.CTkFont(size=18, weight="bold"))
            cat_label.pack(anchor="w", pady=(20, 5), padx=10)
            
            frame = ctk.CTkFrame(self.main_view)
            frame.pack(fill="x", padx=10)
            self.sections[cat] = frame
            
        self.is_running = False
        
        # Launch Live mode automatically
        if self.live_mode.get():
            self.toggle_live()
            
    def toggle_live(self):
        if self.live_mode.get():
            self.btn_run.configure(state="disabled")
            self.pulse_label.configure(text="● Live Mode активний", text_color="#2ecc71")
            threading.Thread(target=self._live_loop, daemon=True).start()
        else:
            self.btn_run.configure(state="normal")
            self.pulse_label.configure(text="○ Пауза", text_color="gray")
            
    def start_tests_once(self):
        if not self.is_running:
            threading.Thread(target=self._run_all, daemon=True).start()

    def _live_loop(self):
        while self.live_mode.get():
            if not self.is_running:
                self._run_all()
            time.sleep(3.0)
            
    def _run_all(self):
        self.is_running = True
        self.test_system()
        self.test_database()
        self.test_network_sync()
        asyncio.run(self.test_async_tasks())
        self.after(0, self._update_summary_ui)
        self.is_running = False

    def report(self, category, name, status, details=""):
        self.after(0, self._add_result_ui, category, name, status, details)
        
    def _add_result_ui(self, category, name, status, details):
        if name not in self.test_widgets:
            frame = self.sections[category]
            row = ctk.CTkFrame(frame, fg_color="transparent")
            row.pack(fill="x", pady=2, padx=10)
            
            status_lbl = ctk.CTkLabel(row, text="", width=70, font=ctk.CTkFont(weight="bold"))
            status_lbl.pack(side="left", padx=(0, 10))
            
            name_lbl = ctk.CTkLabel(row, text=name, width=220, anchor="w", font=ctk.CTkFont(weight="bold"))
            name_lbl.pack(side="left", padx=10)
            
            details_lbl = ctk.CTkLabel(row, text="", text_color="gray", anchor="w")
            details_lbl.pack(side="left", fill="x", expand=True, padx=10)
            
            self.test_widgets[name] = {"status": status_lbl, "details": details_lbl}
            
        self.test_statuses[name] = status
        w = self.test_widgets[name]
        
        color = {"PASS": "#2ecc71", "WARN": "#f1c40f", "FAIL": "#e74c3c"}
        emoji = {"PASS": "✅", "WARN": "⚠️", "FAIL": "❌"}
        
        w["status"].configure(text=f"{emoji.get(status, '')} {status}", text_color=color.get(status, "white"))
        w["details"].configure(text=details)

    def _update_summary_ui(self):
        passed = list(self.test_statuses.values()).count("PASS")
        warn = list(self.test_statuses.values()).count("WARN")
        failed = list(self.test_statuses.values()).count("FAIL")
        
        self.lbl_pass.configure(text=f"✅ Пройдено: {passed}")
        self.lbl_warn.configure(text=f"⚠️ Увага: {warn}")
        self.lbl_fail.configure(text=f"❌ Помилки: {failed}")
        
        current_time = datetime.now().strftime("%H:%M:%S")
        self.time_label.configure(text=f"Оновлено: {current_time}")
        
        if failed > 0:
            self.status_label.configure(text="🔴 Є критичні помилки", text_color="#e74c3c")
        elif warn > 0:
            self.status_label.configure(text="🟡 Є зауваження", text_color="#f1c40f")
        else:
            self.status_label.configure(text="🟢 Всі системи в нормі", text_color="#2ecc71")

    # ==========================================
    # TESTS IMPLEMENTATION
    # ==========================================
    
    def test_system(self):
        cat = "Системні ресурси"
        
        # CPU
        cpu = psutil.cpu_percent(interval=0.1) # Shorter interval for live mode
        if cpu < 85: self.report(cat, "Навантаження CPU", "PASS", f"{cpu}% (Норма)")
        else: self.report(cat, "Навантаження CPU", "WARN", f"{cpu}% (Високе)")
        
        # RAM
        mem = psutil.virtual_memory()
        if mem.percent < 90: self.report(cat, "Використання RAM", "PASS", f"{mem.percent}% (Вільна: {mem.available // (1024**2)}MB)")
        else: self.report(cat, "Використання RAM", "WARN", f"{mem.percent}% (Критично)")
        
        # Disk
        disk = psutil.disk_usage('.')
        if disk.percent < 90: self.report(cat, "Місце на диску", "PASS", f"Зайнято {disk.percent}%")
        else: self.report(cat, "Місце на диску", "WARN", f"Зайнято {disk.percent}%")
        
        # ENV
        if os.path.exists(ENV_PATH): self.report(cat, "Файл .env", "PASS", f"Знайдено за шляхом {ENV_PATH}")
        else: self.report(cat, "Файл .env", "FAIL", f"Відсутній ({ENV_PATH})")

    def test_database(self):
        cat = "База даних SQLite"
        
        if not os.path.exists(DB_PATH):
            self.report(cat, "Файл БД", "FAIL", f"Не знайдено ({DB_PATH})")
            return
        
        self.report(cat, "Файл БД", "PASS", f"Розмір: {os.path.getsize(DB_PATH) // 1024} KB")
        
        try:
            start = time.time()
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute("SELECT 1")
            ping = (time.time() - start) * 1000
            self.report(cat, "З'єднання з БД", "PASS", f"Пінг: {ping:.2f} мс")
            
            tables = ['users', 'products', 'categories', 'orders', 'order_items', 'store_settings']
            missing = []
            for t in tables:
                cursor.execute(f"SELECT count(name) FROM sqlite_master WHERE type='table' AND name='{t}'")
                if cursor.fetchone()[0] == 0: missing.append(t)
            
            if not missing: self.report(cat, "Структура таблиць", "PASS", "Всі 6 ключових таблиць присутні")
            else: self.report(cat, "Структура таблиць", "FAIL", f"Відсутні таблиці: {', '.join(missing)}")
            
            cursor.execute("SELECT count(*) FROM orders WHERE status = 'NEW' AND created_at < datetime('now', '-1 day')")
            stuck = cursor.fetchone()[0]
            if stuck == 0: self.report(cat, "Завислі замовлення", "PASS", "0 необроблених замовлень (старіше 1 дня)")
            else: self.report(cat, "Завислі замовлення", "WARN", f"Знайдено {stuck} завислих замовлень")
            
            try:
                cursor.execute("SELECT count(*) FROM products WHERE stock_quantity < 0")
                neg_stock = cursor.fetchone()[0]
                if neg_stock == 0: self.report(cat, "Коректність залишків", "PASS", "Негативних залишків немає")
                else: self.report(cat, "Коректність залишків", "FAIL", f"Товарів з мінусовим залишком: {neg_stock}")
            except sqlite3.OperationalError:
                self.report(cat, "Коректність залишків", "WARN", "Колонка stock_quantity відсутня у базі")
                
            conn.close()
        except Exception as e:
            self.report(cat, "Помилка БД", "FAIL", str(e))

    def test_network_sync(self):
        cat = "Мережа та Backend API"
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', 8000))
        if result == 0: self.report(cat, "Порт 8000", "PASS", "Відкритий (Backend локально працює)")
        else: self.report(cat, "Порт 8000", "WARN", "Закритий (Локальний сервер не запущено)")
        sock.close()

    async def test_async_tasks(self):
        await self.test_network_async()
        await self.test_telegram()
        await self.test_external()

    async def test_network_async(self):
        cat = "Мережа та Backend API"
        # Small timeout for live mode so it doesn't freeze the loop
        async with httpx.AsyncClient(timeout=2.0) as client:
            try:
                start = time.time()
                resp = await client.get(f"{API_BASE_URL}/api/catalog/categories")
                ping = (time.time() - start) * 1000
                if resp.status_code == 200: self.report(cat, "Catalog API", "PASS", f"OK (Пінг: {ping:.1f} мс)")
                else: self.report(cat, "Catalog API", "FAIL", f"Код {resp.status_code}")
            except: self.report(cat, "Catalog API", "WARN", "API локально недоступне")
            
            try:
                resp = await client.get(f"{API_BASE_URL}/api/admin/orders")
                if resp.status_code == 401: self.report(cat, "Admin API Захист", "PASS", "Повертає 401 Unauthorized")
                else: self.report(cat, "Admin API Захист", "WARN", f"Код: {resp.status_code}")
            except: pass

            try:
                resp = await client.get(f"{API_BASE_URL}/miniapp/")
                if resp.status_code == 200: self.report(cat, "Miniapp Frontend", "PASS", "Сторінка HTML доступна")
                else: self.report(cat, "Miniapp Frontend", "FAIL", f"Код {resp.status_code}")
            except: pass

    async def test_telegram(self):
        cat = "Telegram Bot API"
        bot_token = None
        if os.path.exists(ENV_PATH):
            with open(ENV_PATH, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("BOT_TOKEN="):
                        bot_token = line.split("=", 1)[1].strip().strip('"\'')
                        break
        
        if not bot_token:
            self.report(cat, "Токен Бота", "FAIL", "Не знайдено BOT_TOKEN у .env")
            return
            
        async with httpx.AsyncClient(timeout=3.0) as client:
            try:
                start = time.time()
                resp = await client.get(f"https://api.telegram.org/bot{bot_token}/getMe")
                ping = (time.time() - start) * 1000
                data = resp.json()
                if data.get("ok"):
                    self.report(cat, "Зв'язок з Telegram", "PASS", f"Пінг: {ping:.1f} мс (Бот: @{data['result']['username']})")
                else:
                    self.report(cat, "Зв'язок з Telegram", "FAIL", data.get("description"))
                    return
            except Exception as e:
                self.report(cat, "Зв'язок з Telegram", "FAIL", "Відсутній інтернет або таймаут")
                return
                
            try:
                resp = await client.get(f"https://api.telegram.org/bot{bot_token}/getWebhookInfo")
                data = resp.json()
                if data.get("ok"):
                    url = data['result'].get('url', '')
                    pending = data['result'].get('pending_update_count', 0)
                    if url:
                        self.report(cat, "Webhook Status", "PASS", f"URL: {url}")
                        if pending > 50: self.report(cat, "Черга повідомлень", "WARN", f"{pending} повідомлень не оброблено")
                        else: self.report(cat, "Черга повідомлень", "PASS", f"{pending} в черзі (ОК)")
                    else:
                        self.report(cat, "Webhook Status", "WARN", "Webhook не встановлено (Режим Polling)")
                else:
                    self.report(cat, "Webhook", "FAIL", data.get("description"))
            except Exception as e:
                self.report(cat, "Webhook", "FAIL", "Помилка мережі")

    async def test_external(self):
        cat = "Зовнішній сервер (Render)"
        async with httpx.AsyncClient(timeout=3.0) as client:
            try:
                start = time.time()
                resp = await client.get(EXTERNAL_URL)
                ping = (time.time() - start) * 1000
                if resp.status_code == 200: self.report(cat, "Зовнішній доступ", "PASS", f"OK (Пінг: {ping:.1f} мс)")
                else: self.report(cat, "Зовнішній доступ", "WARN", f"Віддає код {resp.status_code}")
            except Exception as e:
                self.report(cat, "Зовнішній доступ", "WARN", f"Сайт недоступний або не відповідає")

if __name__ == "__main__":
    app = VrebroMonitorApp()
    app.mainloop()
