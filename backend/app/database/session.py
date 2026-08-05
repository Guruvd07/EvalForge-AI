from sqlalchemy.orm import sessionmaker

from app.database.engine import engine


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)