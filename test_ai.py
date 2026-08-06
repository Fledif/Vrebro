import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

from backend.routers.ai import call_groq

async def test():
    try:
        res = await call_groq([{"role": "user", "content": "Скажи одне слово: Працює"}], temperature=0.1)
        print("AI Response:", res)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(test())
