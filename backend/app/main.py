from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from app.core.config import settings
from app.core.database import engine, Base
import re

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
)

# Custom CORS middleware to allow all *.class-on.kr subdomains
class DynamicCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")

        # List of allowed origins
        allowed_origins = settings.BACKEND_CORS_ORIGINS.copy()

        # Check if origin matches *.class-on.kr pattern
        if origin:
            # Allow all subdomains of class-on.kr
            if re.match(r"^https://[a-zA-Z0-9-]+\.class-on\.kr$", origin):
                allowed_origins.append(origin)
            # Also allow localhost for development
            if origin.startswith("http://localhost"):
                allowed_origins.append(origin)

        # Handle preflight OPTIONS requests
        if request.method == "OPTIONS":
            if origin in allowed_origins:
                return Response(
                    status_code=200,
                    headers={
                        "Access-Control-Allow-Origin": origin,
                        "Access-Control-Allow-Credentials": "true",
                        "Access-Control-Allow-Methods": "*",
                        "Access-Control-Allow-Headers": "*",
                    }
                )

        response = await call_next(request)

        # Set CORS headers if origin is allowed
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"

        return response

# Add custom CORS middleware (handles all CORS including wildcards)
app.add_middleware(DynamicCORSMiddleware)


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
