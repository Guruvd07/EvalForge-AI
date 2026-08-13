from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.experiment import Experiment
from app.models.user import User


class SearchService:

    @staticmethod
    def search_experiments(
        db: Session,
        current_user: User,
        query: str = "",
        status: str | None = None,
        page: int = 1,
        page_size: int = 10,
    ):
        q = db.query(Experiment).filter(
            Experiment.user_id == current_user.id
        )

        if query:
            q = q.filter(
                or_(
                    Experiment.title.ilike(f"%{query}%"),
                    Experiment.description.ilike(f"%{query}%"),
                )
            )

        if status:
            q = q.filter(
                Experiment.status == status
            )

        total = q.count()

        experiments = (
            q.order_by(Experiment.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return {
            "items": experiments,
            "total": total,
            "page": page,
            "page_size": page_size,
        }