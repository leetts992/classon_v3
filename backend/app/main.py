from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(f"🚀 {settings.PROJECT_NAME} started!")
    print(f"📚 Docs: http://{settings.HOST}:{settings.PORT}{settings.API_V1_STR}/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on shutdown"""
    await engine.dispose()
    print(f"👋 {settings.PROJECT_NAME} shutting down...")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# Import and include routers
from app.api.v1 import auth, products, upload, orders, customers

app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(products.router, prefix=settings.API_V1_STR, tags=["products"])
app.include_router(upload.router, prefix=settings.API_V1_STR, tags=["upload"])
app.include_router(orders.router, prefix=settings.API_V1_STR, tags=["orders"])
app.include_router(customers.router, prefix=settings.API_V1_STR, tags=["customers"])
