from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.api.auth import router as auth_router
from app.core.config import settings
from app.database.dependencies import get_db
from app.api.experiment import router as experiment_router
from app.api.prompt import router as prompt_router
from app.api.evaluation import router as evaluation_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION
)

app.include_router(auth_router)
app.include_router(experiment_router)
app.include_router(prompt_router)
app.include_router(evaluation_router)

@app.get("/")
def root():
    return {"message": "Welcome to EvalForge AI 🚀"}

@app.get("/db-test")
def db_test(db: Session = Depends(get_db)):
    return {
        "message": "Database session created successfully"
    }