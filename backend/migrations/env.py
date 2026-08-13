from logging.config import fileConfig
import os
import sys
from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool
from alembic import context

from app.database.base import Base

# Import all models so Alembic can discover them
from app.models.user import User
from app.models.experiment import Experiment
from app.models.prompt import Prompt
from app.models.evaluation_run import EvaluationRun
from app.models.evaluation_result import EvaluationResult


# ---------------------------------------------------------
# Python path
# ---------------------------------------------------------

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)


# ---------------------------------------------------------
# Alembic Config
# ---------------------------------------------------------

config = context.config


# ---------------------------------------------------------
# Logging
# ---------------------------------------------------------

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# ---------------------------------------------------------
# Target metadata
# ---------------------------------------------------------

target_metadata = Base.metadata


# ---------------------------------------------------------
# Database URL
# ---------------------------------------------------------
load_dotenv()

database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise RuntimeError(
        "DATABASE_URL environment variable is not set."
    )

# Render may provide a standard PostgreSQL URL:
# postgresql://...
#
# psycopg2 requires:
# postgresql+psycopg2://...

if database_url.startswith("postgresql://"):
    database_url = database_url.replace(
        "postgresql://",
        "postgresql+psycopg2://",
        1,
    )

config.set_main_option(
    "sqlalchemy.url",
    database_url.replace("%", "%%"),
)


# ---------------------------------------------------------
# Offline migrations
# ---------------------------------------------------------

def run_migrations_offline() -> None:
    """Run migrations in offline mode."""

    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={
            "paramstyle": "named"
        },
    )

    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------
# Online migrations
# ---------------------------------------------------------

def run_migrations_online() -> None:
    """Run migrations in online mode."""

    connectable = engine_from_config(
        config.get_section(
            config.config_ini_section,
            {},
        ),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


# ---------------------------------------------------------
# Run migrations
# ---------------------------------------------------------

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()