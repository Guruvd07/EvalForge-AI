from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from app.api.auth import router as auth_router
from app.api.experiment import router as experiment_router
from app.api.prompt import router as prompt_router

from app.core.settings import settings
from app.database.dependencies import get_db

from app.api.evaluation import router as evaluation_router

from app.api.evaluation_results import (
    router as evaluation_result_router
)

from app.api.dashboard import router as dashboard_router
from app.api.evaluation_history import router as evaluation_history_router
from app.api.leaderboard import router as leaderboard_router
from app.api.analytics import router as analytics_router
from app.api.experiment_details import router as experiment_details_router
from app.api.search import router as search_router
from app.api.comparison import router as comparison_router
from app.api.quality import router as quality_router
from app.api.activity import router as activity_router
from app.api.model_metrics import router as model_metrics_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(experiment_router)
app.include_router(prompt_router)
app.include_router(evaluation_router)
app.include_router(evaluation_result_router)

app.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["Dashboard"],
)

app.include_router(
    evaluation_history_router,
    prefix="/evaluation",
    tags=["Evaluation History"],
)

app.include_router(
    leaderboard_router,
    prefix="/leaderboard",
    tags=["Leaderboard"],
)

app.include_router(
    analytics_router,
    prefix="/analytics",
    tags=["Analytics"],
)

app.include_router(
    experiment_details_router,
    prefix="/experiment-details",
    tags=["Experiment Details"],
)

app.include_router(
    search_router,
    prefix="/search",
    tags=["Search"],
)


app.include_router(
    comparison_router,
    prefix="/comparison",
    tags=["Comparison"],
)

app.include_router(
    quality_router,
    prefix="/quality",
    tags=["Quality"],
)

app.include_router(
    activity_router,
    prefix="/activity",
    tags=["Activity"],
)

app.include_router(
    model_metrics_router,
    prefix="/metrics",
    tags=["Model Metrics"],
)

app.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["Dashboard"],
)


@app.get("/")
def root():
    return {"message": "Welcome to EvalForge AI 🚀"}


@app.get("/db-test")
def db_test(db: Session = Depends(get_db)):
    return {
        "message": "Database session created successfully"
    }