import sys
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add the bot directory to path so we can import its models and DB config
bot_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../vrebro_bot'))
sys.path.append(bot_path)

from routes import catalog, orders, favorites, admin

app = FastAPI(title="VreBRO Mini App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(catalog.router, prefix="/api/catalog", tags=["Catalog"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(favorites.router, prefix="/api/favorites", tags=["Favorites"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
def root():
    return {"status": "ok", "message": "VreBRO Mini App API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
