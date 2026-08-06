from sqlalchemy.orm import Session

from app.models.experiment import Experiment
from app.models.user import User
from app.schemas.experiment import ExperimentCreate


class ExperimentService:

    @staticmethod
    def create_experiment(
        db: Session,
        experiment_data: ExperimentCreate,
        current_user: User
    ) -> Experiment:

        experiment = Experiment(
            user_id=current_user.id,
            title=experiment_data.title,
            description=experiment_data.description
        )

        db.add(experiment)
        db.commit()
        db.refresh(experiment)

        return experiment
    
    @staticmethod
    def get_user_experiments(
        db: Session,
        current_user: User
    ):
        return (
            db.query(Experiment)
            .filter(Experiment.user_id == current_user.id)
            .order_by(Experiment.created_at.desc())
            .all()
        )