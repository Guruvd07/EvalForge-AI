from sqlalchemy import create_engine

from app.core.settings import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=True
)