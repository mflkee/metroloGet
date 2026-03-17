import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers.groups import router as groups
from app.routers.instruments import router as instruments
from app.routers.nodes import router as nodes

# Создание таблиц в базе данных
Base.metadata.create_all(bind=engine)

app = FastAPI(redirect_slashes=False)  # Отключаем автоматический редирект

app.include_router(nodes)
app.include_router(instruments)
app.include_router(groups)

frontend_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
