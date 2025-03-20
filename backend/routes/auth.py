import os
import bcrypt
import jwt as pyjwt  # ✅ Use PyJWT instead of built-in jwt
import datetime
from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, constr
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET = os.getenv("JWT_SECRET")

if not MONGO_URI:
    raise ValueError("⚠️ MONGO_URI is not set in the environment variables!")
if not JWT_SECRET:
    raise ValueError("⚠️ JWT_SECRET is missing! Add it to your .env file.")

# ✅ Initialize MongoDB Connection
client = AsyncIOMotorClient(MONGO_URI)
db_name = "quiz_app"  # ✅ Use explicit database name
db = client[db_name]
users_collection = db["users"]

router = APIRouter()

# ✅ User Schema for Registration
class UserRegister(BaseModel):
    username: str
    email: EmailStr  # ✅ Validate email format
    password: constr(min_length=6)  # ✅ Require at least 6 characters

# ✅ User Schema for Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# ✅ Password Hashing
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))

# ✅ JWT Token Generation
def create_jwt_token(data: dict):
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    data.update({"exp": expiration})
    return pyjwt.encode(data, JWT_SECRET, algorithm="HS256")

# 📝 **API: Register a New User**
@router.post("/register")
async def register_user(user: UserRegister):
    try:
        print(f"🔹 Registering user: {user.email}")

        # ✅ Check if user already exists
        existing_user = await users_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        # ✅ Hash Password & Save User
        hashed_password = hash_password(user.password)
        new_user = {
            "username": user.username,
            "email": user.email,
            "password": hashed_password,
        }
        result = await users_collection.insert_one(new_user)

        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="User registration failed")

        print("✅ User registered successfully!")
        return {"message": "🎉 User registered successfully! You can now log in."}

    except Exception as e:
        print(f"❌ Error during registration: {e}")
        raise HTTPException(status_code=500, detail=f"Error registering user: {str(e)}")

# 🔑 **API: Login User & Return JWT Token**
@router.post("/login")
async def login_user(user: UserLogin):
    try:
        print(f"🔹 Logging in user: {user.email}")

        user_record = await users_collection.find_one({"email": user.email})

        # ✅ Debugging: Check if user exists in the database
        if not user_record:
            print("❌ User not found in database")
            raise HTTPException(status_code=401, detail="Invalid email or password")

        print("✅ User found in database:", user_record)

        # ✅ Check if the password is correct
        if not verify_password(user.password, user_record["password"]):
            print("❌ Incorrect password")
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # ✅ Generate JWT Token
        token = create_jwt_token({"email": user.email, "username": user_record["username"]})

        print("✅ Login successful, returning token")
        return {"token": token, "username": user_record["username"]}

    except Exception as e:
        print(f"❌ Error during login: {e}")
        raise HTTPException(status_code=500, detail=f"Error logging in: {str(e)}")
