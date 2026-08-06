from datetime import datetime, timedelta, UTC

from jose import jwt

from app.core.settings import settings


ALGORITHM = "HS256"


def create_access_token(data: dict) -> str:
    payload = data.copy()

    expire = datetime.now(UTC) + timedelta(hours=24)
    payload["exp"] = expire

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=ALGORITHM
    )