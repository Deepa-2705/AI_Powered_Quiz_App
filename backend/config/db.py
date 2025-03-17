from motor.motor_asyncio import AsyncIOMotorClient

import os
from dotenv import load_dotenv
import motor.motor_asyncio
import asyncio

MONGO_URI = "your_mongo_uri_here"

async def test_connection():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.get_database()
    print(await db.list_collection_names())

asyncio.run(test_connection())


load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client.get_database()

print("MongoDB Connected")
