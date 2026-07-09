from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine


PROJECT_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = PROJECT_ROOT / ".env"


def load_env_file(env_path: Path = ENV_PATH) -> None:
    """Load simple KEY=VALUE pairs from .env without overriding existing variables."""
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")

        os.environ.setdefault(key, value)


def get_database_url() -> str:
    load_env_file()
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise RuntimeError("DATABASE_URL is not defined in the environment or .env file.")

    return database_url


def get_engine() -> Engine:
    """Create a SQLAlchemy engine for PostgreSQL/Neon."""
    return create_engine(get_database_url(), pool_pre_ping=True)


def load_query(query: str, params: dict[str, Any] | None = None) -> pd.DataFrame:
    """Load a SQL query into a pandas DataFrame."""
    engine = get_engine()

    with engine.connect() as connection:
        return pd.read_sql_query(text(query), connection, params=params)


def load_table(table_name: str, limit: int | None = None) -> pd.DataFrame:
    """Load a full table, optionally limited, into a pandas DataFrame."""
    safe_table_name = "".join(char for char in table_name if char.isalnum() or char == "_")

    if safe_table_name != table_name:
        raise ValueError("Invalid table name.")

    query = f'SELECT * FROM "{safe_table_name}"'
    params: dict[str, Any] = {}

    if limit is not None:
        query += " LIMIT :limit"
        params["limit"] = limit

    return load_query(query, params)
