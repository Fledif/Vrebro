from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from models.order import Order
from models.product import Product
from auth import get_current_admin
from config import settings

router = APIRouter(dependencies=[Depends(get_current_admin)])

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

class DescriptionRequest(BaseModel):
    name: str

class CategorySuggestRequest(BaseModel):
    name: str
    categories: List[str]

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

async def call_groq(messages: list, model: str = "llama-3.1-8b-instant", temperature: float = 0.7):
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": messages,
                "temperature": temperature
            },
            timeout=30.0
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Groq API Error: {response.text}")
        
        data = response.json()
        return data["choices"][0]["message"]["content"]

@router.post("/generate-description")
async def generate_description(req: DescriptionRequest):
    prompt = f"Згенеруй короткий, привабливий та смачний опис для товару '{req.name}' в інтернет-магазин. Використовуй емодзі. Максимум 3-4 речення. Тільки опис, нічого зайвого."
    messages = [
        {"role": "system", "content": "Ти професійний копірайтер для магазину крафтової їжі, який продає варених раків, м'ясні делікатеси, морепродукти та закуски. Твоя ціль - викликати апетит у покупця."},
        {"role": "user", "content": prompt}
    ]
    description = await call_groq(messages)
    return {"description": description}

@router.post("/suggest-category")
async def suggest_category(req: CategorySuggestRequest):
    if not req.categories:
        return {"category": ""}
    
    prompt = f"У мене є товар '{req.name}'. В яку з цих категорій його найкраще помістити: {', '.join(req.categories)}? Напиши ТІЛЬКИ назву категорії з цього списку, без лапок і без пояснень."
    messages = [
        {"role": "user", "content": prompt}
    ]
    category = await call_groq(messages, temperature=0.1)
    category = category.strip('\'" .').strip()
    return {"category": category}

@router.post("/chat")
async def ai_chat(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    # Gather some basic stats for context
    orders_query = await db.execute(select(Order))
    orders = orders_query.scalars().all()
    
    products_query = await db.execute(select(Product))
    products = products_query.scalars().all()
    
    total_revenue = sum(o.total_price for o in orders if o.status != "CANCELLED")
    active_orders = len([o for o in orders if o.status in ["NEW", "REVIEWED", "EDITED", "PACKING", "SHIPPED"]])
    
    stats_text = (
        f"Статистика магазину:\n"
        f"- Всього товарів: {len(products)}\n"
        f"- Всього замовлень: {len(orders)}\n"
        f"- Активних замовлень: {active_orders}\n"
        f"- Загальний дохід (не скасовані): {total_revenue} грн\n"
    )
    
    system_msg = {
        "role": "system", 
        "content": (
            "Ти особистий ШІ-асистент (аналітик) для власника інтернет-магазину VreBRO. "
            "Ти спілкуєшся з власником, допомагаєш йому аналізувати бізнес, даєш поради та підтримуєш позитивний настрій. "
            "Відповідай коротко, по ділу, українською мовою. "
            "Ось поточна інформація про магазин, на яку ти можеш спиратися:\n" + stats_text
        )
    }
    
    messages = [system_msg] + [{"role": m.role, "content": m.content} for m in req.messages]
    
    reply = await call_groq(messages)
    return {"reply": reply}

from fastapi import UploadFile, File

@router.post("/process-image")
async def process_image_ai(image: UploadFile = File(...)):
    if not settings.PHOTOROOM_API_KEY:
        raise HTTPException(status_code=400, detail="PHOTOROOM_API_KEY is not configured on the server")
        
    image_bytes = await image.read()
    
    async with httpx.AsyncClient() as client:
        # Step 1: Send to Photoroom for AI Processing
        # We use Photoroom v2 edit API with a prompt for a good background
        # Note: If the user just wants background removal, we could use /v1/segment,
        # but to add a nice background we use /v2/edit
        
        pr_files = {'imageFile': (image.filename, image_bytes, image.content_type)}
        pr_data = {
            'background.prompt': 'A professional high-quality food photography of a product on a rustic dark wooden table with cinematic lighting',
            'padding': '0.1'
        }
        
        pr_res = await client.post(
            "https://image-api.photoroom.com/v2/edit",
            headers={"x-api-key": settings.PHOTOROOM_API_KEY},
            files=pr_files,
            data=pr_data,
            timeout=60.0
        )
        
        if pr_res.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Photoroom API Error: {pr_res.text}")
            
        processed_image_bytes = pr_res.content
        
        # Step 2: Upload the processed image to ImgBB
        if not settings.IMGBB_API_KEY:
            raise HTTPException(status_code=500, detail="IMGBB_API_KEY is missing for final upload")
            
        imgbb_files = {'image': ("ai_processed_" + image.filename, processed_image_bytes, image.content_type)}
        imgbb_res = await client.post(
            f"https://api.imgbb.com/1/upload?key={settings.IMGBB_API_KEY}",
            files=imgbb_files,
            timeout=30.0
        )
        
        if imgbb_res.status_code != 200:
            raise HTTPException(status_code=500, detail=f"ImgBB error: {imgbb_res.text}")
            
        data = imgbb_res.json()
        if data.get("success"):
            return {"url": data["data"]["url"]}
        else:
            raise HTTPException(status_code=400, detail="Failed to upload AI image to ImgBB")
