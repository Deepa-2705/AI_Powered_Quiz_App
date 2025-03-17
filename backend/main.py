from fastapi import FastAPI
from backend.routes.quizRoutes import router as quiz_router
from backend.routes import auth
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ Add a root route
@app.get("/")
async def root():
    return {"message": "FastAPI server is running!"}


app.include_router(auth.router, prefix="/api/auth")  # ✅ Register authentication routes


# ✅ Register quiz routes
app.include_router(quiz_router, prefix="/api/quiz")


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000)