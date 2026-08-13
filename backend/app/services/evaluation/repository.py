from sqlalchemy.orm import Session

from app.models.evaluation_result import EvaluationResult


class EvaluationRepository:

    @staticmethod
    def save_results(
        db: Session,
        evaluation_run_id: str,
        results: list,
    ):

        for result in results:

            db.add(
                EvaluationResult(
                    evaluation_run_id=evaluation_run_id,
                    prompt_id=result["prompt_id"],
                    model_name=result["model_name"],
                    provider=result["provider"],
                    response_text=result["response"],
                    latency_ms=result["latency_ms"],
                    input_tokens=result["input_tokens"],
                    output_tokens=result["output_tokens"],
                    total_tokens=result["total_tokens"],
                    cost=result["cost"],

                    relevance_score=result.get("relevance_score"),
                    correctness_score=result.get("correctness_score"),
                    coherence_score=result.get("coherence_score"),
                    instruction_following_score=result.get(
                        "instruction_following_score"
                    ),
                    overall_score=result.get("overall_score"),
                )
            )

        db.commit()