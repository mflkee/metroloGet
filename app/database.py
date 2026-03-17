import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool

load_dotenv()

DEBUG = os.getenv("DEBUG", "False").lower() == "true"
DEFAULT_SQLITE_URL = f"sqlite:///{Path(__file__).resolve().parent.parent / 'metrologet.db'}"


def _normalize_database_url(database_url: str) -> str:
    return database_url.strip() or DEFAULT_SQLITE_URL


def _build_engine(database_url: str):
    engine_kwargs = {
        "echo": DEBUG,
        "poolclass": NullPool,
        "future": True,
    }

    if database_url.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}

    return create_engine(database_url, **engine_kwargs)


def _create_engine_with_fallback():
    configured_url = _normalize_database_url(os.getenv("DATABASE_URL", ""))

    try:
        engine = _build_engine(configured_url)

        # Проверяем только внешние БД, чтобы локальный SQLite не открывать лишний раз.
        if not configured_url.startswith("sqlite"):
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))

        return engine
    except (ModuleNotFoundError, SQLAlchemyError) as exc:
        if configured_url.startswith("sqlite"):
            raise RuntimeError("Failed to initialize SQLite database") from exc

        print(
            "Primary database is unavailable; falling back to local SQLite "
            f"database at {DEFAULT_SQLITE_URL}"
        )
        return _build_engine(DEFAULT_SQLITE_URL)


DATABASE_URL = _normalize_database_url(os.getenv("DATABASE_URL", ""))

engine = _create_engine_with_fallback()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
