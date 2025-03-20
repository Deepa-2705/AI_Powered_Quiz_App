from fastapi import FastAPI, Request
from backend.routes.quizRoutes import router as quiz_router
from backend.routes import auth
from fastapi.middleware.cors import CORSMiddleware

import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# ✅ Load environment variables
load_dotenv()

# ✅ Get MONGO_URI from .env
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("⚠ MONGO_URI is missing in the .env file!")

# ✅ Connect to MongoDB
client = AsyncIOMotorClient(MONGO_URI)

# ✅ Extract the database name from URI
DB_NAME = MONGO_URI.split("/")[-1].split("?")[0]

if not DB_NAME:
    raise ValueError("⚠ No database name found in MONGO_URI!")

db = client[DB_NAME]  # ✅ Correctly selects the database

# ✅ Initialize FastAPI app
app = FastAPI()

# ✅ Register authentication routes (ONLY ONCE)
app.include_router(auth.router, prefix="/api/auth")

# ✅ Register quiz routes
app.include_router(quiz_router, prefix="/api/quiz")

# ✅ CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Debugging Log: Check Incoming Payloads
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"🔍 Incoming Request: {request.method} {request.url}")
    if request.method in ["POST", "PUT"]:
        body = await request.json()
        print(f"📥 Request Payload: {body}")

    response = await call_next(request)
    print(f"📤 Response Status: {response.status_code}")
    return response

# ✅ Root Route
@app.get("/")
async def root():
    return {"message": "FastAPI server is running!"}

# ✅ Handle Unexpected Errors Gracefully
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"❌ Error: {exc}")
    return {"error": "Internal Server Error", "details": str(exc)}

print(f"✅ MongoDB Connected Successfully! Using Database: {DB_NAME}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
