import os
import logging
from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import Message, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

TOKEN = os.getenv("BOT_TOKEN", "")
WEB_APP_URL = os.getenv("WEB_APP_URL", "")

logging.basicConfig(level=logging.INFO)

bot = Bot(token=TOKEN) if TOKEN else None
dp = Dispatcher()

@dp.message(CommandStart())
async def cmd_start(message: Message):
    if not WEB_APP_URL:
        await message.answer("Помилка: WEB_APP_URL не налаштовано на сервері.")
        return
        
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="🔥 Відкрити меню для замовлення",
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ])
    await message.answer(
        "Вітаємо у **VreBRO Mini App**!\nНатисніть кнопку нижче, щоб відкрити преміальне меню 🥩🦐",
        reply_markup=keyboard,
        parse_mode="Markdown"
    )
