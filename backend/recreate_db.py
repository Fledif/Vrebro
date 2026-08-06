import asyncio
from database import engine
from models.base import Base
import models.product
import models.order
import models.user

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        print("Dropped tables")
        await conn.run_sync(Base.metadata.create_all)
        print("Created tables")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
